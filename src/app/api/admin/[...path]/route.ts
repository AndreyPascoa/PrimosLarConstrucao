import { salesAdmin } from "@/server/sales";
import { getDb } from "@/server/db/prisma";
import { login, logout, requireAdmin } from "@/server/auth";
import {
  checkOrigin,
  failure,
  HttpError,
  json,
  readJson,
  readLimited,
} from "@/server/http";
import {
  bannerSchema,
  categorySchema,
  loginSchema,
  productSchema,
  settingsSchema,
} from "@/lib/validation";
import { defaultSettings } from "@/lib/content";
import { removeImage, uploadImage } from "@/server/storage";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: Context) {
  const nativeLogin =
    request.method === "POST" &&
    new URL(request.url).pathname === "/api/admin/login" &&
    request.headers.get("content-type")?.split(";")[0].trim() ===
      "application/x-www-form-urlencoded";
  const redirectLogin = (path: string) =>
    new Response(null, {
      status: 303,
      headers: { Location: path, "Cache-Control": "no-store" },
    });
  try {
    const { path } = await context.params;
    const [resource, id] = path;
    if (path.length > 2) throw new HttpError(404, "Rota não encontrada.");
    const method = request.method;
    if (method !== "GET") checkOrigin(request);
    if (resource === "login" && method === "POST" && !id) {
      const body = nativeLogin
        ? Object.fromEntries(
            new URLSearchParams(
              new TextDecoder().decode(await readLimited(request, 32768)),
            ),
          )
        : await readJson(request);
      const data = loginSchema.parse(body);
      await login(data.email, data.password);
      return nativeLogin ? redirectLogin("/admin") : json({ ok: true });
    }
    await requireAdmin();
    if (["sellers", "quotes"].includes(resource))
      return await salesAdmin(request, resource, id);
    const db = getDb();
    if (resource === "logout" && method === "POST" && !id) {
      await logout();
      return json({ ok: true });
    }
    if (method === "GET" && !id) {
      if (resource === "dashboard") {
        const [products, published, categories, banners, media] =
          await Promise.all([
            db.product.count(),
            db.product.count({ where: { published: true } }),
            db.category.count(),
            db.banner.count(),
            db.media.count(),
          ]);
        return json({
          products,
          published,
          categories,
          banners,
          media,
          storageReady:
            !!process.env.SUPABASE_URL &&
            !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        });
      }
      if (resource === "products")
        return json(
          await db.product.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" },
          }),
        );
      if (resource === "categories")
        return json(
          await db.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: "asc" },
          }),
        );
      if (resource === "banners")
        return json(
          await db.banner.findMany({
            orderBy: [{ position: "asc" }, { createdAt: "asc" }],
          }),
        );
      if (resource === "media")
        return json(
          await db.media.findMany({ orderBy: { createdAt: "desc" } }),
        );
      if (resource === "settings") {
        const row = await db.siteSettings.findUnique({ where: { id: "site" } });
        return json({
          ...defaultSettings,
          ...(row?.data && typeof row.data === "object" ? row.data : {}),
        });
      }
    }
    if (resource === "media" && method === "POST" && !id) {
      if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024)
        throw new HttpError(413, "Arquivo muito grande.");
      const body = await readLimited(request, 6 * 1024 * 1024);
      const form = await new Response(body, {
        headers: { "Content-Type": request.headers.get("content-type") || "" },
      }).formData();
      const file = form.get("file");
      if (!(file instanceof File))
        throw new HttpError(400, "Selecione uma imagem.");
      const image = await uploadImage(file);
      try {
        return json(
          await db.media.create({
            data: { ...image, name: file.name.slice(0, 160) },
          }),
          201,
        );
      } catch (error) {
        await removeImage(image.path).catch(() => {});
        throw error;
      }
    }
    if (resource === "media" && method === "DELETE" && id) {
      const item = await db.media.findUnique({ where: { id } });
      if (!item) throw new HttpError(404, "Imagem não encontrada.");
      const [products, banners, settings] = await Promise.all([
        db.product.count({ where: { imageUrl: item.url } }),
        db.banner.count({ where: { imageUrl: item.url } }),
        db.siteSettings.findUnique({ where: { id: "site" } }),
      ]);
      if (
        products ||
        banners ||
        JSON.stringify(settings?.data ?? {}).includes(item.url)
      )
        throw new HttpError(
          409,
          "Esta imagem está em uso. Remova seus vínculos antes de excluir.",
        );
      await removeImage(item.path);
      await db.media.delete({ where: { id } });
      return json({ ok: true });
    }
    if ((method === "POST" && !id) || (method === "PATCH" && id)) {
      const body = await readJson(request);
      if (resource === "products") {
        const data = productSchema.parse(body);
        return json(
          id
            ? await db.product.update({ where: { id }, data })
            : await db.product.create({ data }),
          id ? 200 : 201,
        );
      }
      if (resource === "categories") {
        const data = categorySchema.parse(body);
        return json(
          id
            ? await db.category.update({ where: { id }, data })
            : await db.category.create({ data }),
          id ? 200 : 201,
        );
      }
      if (resource === "banners") {
        const data = bannerSchema.parse(body);
        return json(
          id
            ? await db.banner.update({ where: { id }, data })
            : await db.banner.create({ data }),
          id ? 200 : 201,
        );
      }
    }
    if (resource === "settings" && method === "PUT" && !id) {
      const data = settingsSchema.parse(await readJson(request));
      await db.siteSettings.upsert({
        where: { id: "site" },
        create: { id: "site", data },
        update: { data },
      });
      return json(data);
    }
    if (method === "DELETE" && id) {
      if (resource === "products") {
        await db.product.delete({ where: { id } });
        return json({ ok: true });
      }
      if (resource === "categories") {
        await db.category.delete({ where: { id } });
        return json({ ok: true });
      }
      if (resource === "banners") {
        await db.banner.delete({ where: { id } });
        return json({ ok: true });
      }
    }
    throw new HttpError(404, "Rota não encontrada.");
  } catch (error) {
    const response = failure(error);
    return nativeLogin
      ? redirectLogin(`/admin/login?error=${response.status}`)
      : response;
  }
}
export {
  handle as GET,
  handle as POST,
  handle as PATCH,
  handle as PUT,
  handle as DELETE,
};
