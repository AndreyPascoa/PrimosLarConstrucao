import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getDb } from "@/server/db/prisma";
import {
  crmActor,
  staffLogin,
  staffLogout,
  passwordHash,
  conversationFor,
} from "@/server/crm-auth";
import { attachmentResponse, saveAttachment } from "@/server/crm-storage";
import {
  checkOrigin,
  failure,
  HttpError,
  json,
  readJson,
  readLimited,
} from "@/server/http";
export const runtime = "nodejs";
const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(256),
});
async function handle(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const [resource, id, action] = path;
  const db = getDb();
  let native = false;
  try {
    if (path.length > 3) throw new HttpError(404, "Rota inválida.");
    if (request.method !== "GET") checkOrigin(request);
    if (resource === "login" && request.method === "POST") {
      native = !!request.headers
        .get("content-type")
        ?.includes("application/x-www-form-urlencoded");
      const body = native
        ? Object.fromEntries(
            new URLSearchParams(
              new TextDecoder().decode(await readLimited(request, 32768)),
            ),
          )
        : await readJson(request);
      const data = loginSchema.parse(body);
      await staffLogin(data.email, data.password);
      return native
        ? new Response(null, { status: 303, headers: { Location: "/crm" } })
        : json({ ok: true });
    }
    const actor = await crmActor();
    if (resource === "session") return json(actor);
    if (resource === "logout" && request.method === "POST") {
      await staffLogout();
      return json({ ok: true });
    }
    if (resource === "users") {
      if (!actor.admin) throw new HttpError(403, "Somente administrador.");
      if (request.method === "GET")
        return json(
          await db.crmUser.findMany({
            select: { id: true, email: true, sellerId: true, active: true },
          }),
        );
      if (request.method === "POST") {
        const data = z
          .object({
            sellerId: z.string(),
            email: z.string().email().max(254),
            password: z.string().min(12).max(256),
            active: z.boolean(),
          })
          .strict()
          .parse(await readJson(request));
        if (!(await db.seller.findUnique({ where: { id: data.sellerId } })))
          throw new HttpError(400, "Vendedor inválido.");
        const user = await db.crmUser.upsert({
          where: { sellerId: data.sellerId },
          create: {
            sellerId: data.sellerId,
            email: data.email.toLowerCase(),
            passwordHash: passwordHash(data.password),
            active: data.active,
          },
          update: {
            email: data.email.toLowerCase(),
            passwordHash: passwordHash(data.password),
            active: data.active,
          },
        });
        return json({ id: user.id });
      }
    }
    if (resource === "profile" && request.method === "POST") {
      const data = z
        .object({
          sellerId: z.string(),
          phone: z.string().regex(/^55\d{10,11}$/),
        })
        .strict()
        .parse(await readJson(request));
      if (!actor.admin && actor.sellerId !== data.sellerId)
        throw new HttpError(403, "Número de outro vendedor.");
      if (await db.waAccount.findUnique({ where: { sellerId: data.sellerId } }))
        throw new HttpError(
          409,
          "Número já possui conta vinculada. Cadastre outro vendedor para um novo número e preserve o histórico.",
        );
      await db.seller.update({
        where: { id: data.sellerId },
        data: { phone: data.phone },
      });
      return json({ ok: true });
    }
    if (resource === "sellers" && request.method === "GET")
      return json(
        await db.seller.findMany({
          where: actor.admin ? {} : { id: actor.sellerId },
          select: { id: true, name: true, phone: true, active: true },
        }),
      );
    if (resource === "accounts") {
      if (request.method === "GET")
        return json(
          (
            await db.waAccount.findMany({
              where: actor.admin ? {} : { sellerId: actor.sellerId },
            })
          ).map((a) => ({
            ...a,
            qr: a.qrExpiresAt && a.qrExpiresAt > new Date() ? a.qr : null,
            status:
              !a.heartbeatAt || Date.now() - a.heartbeatAt.getTime() > 45000
                ? "offline"
                : a.status,
          })),
        );
      if (request.method === "POST") {
        const data = z
          .object({
            sellerId: z.string(),
            command: z.enum(["connect", "disconnect"]),
          })
          .strict()
          .parse(await readJson(request));
        if (!actor.admin && actor.sellerId !== data.sellerId)
          throw new HttpError(403, "Número de outro vendedor.");
        const seller = await db.seller.findUnique({
          where: { id: data.sellerId },
        });
        if (!seller?.active) throw new HttpError(400, "Vendedor inativo.");
        return json(
          await db.waAccount.upsert({
            where: { sellerId: data.sellerId },
            create: {
              sellerId: data.sellerId,
              command: data.command,
              commandId: randomUUID(),
            },
            update: {
              command: data.command,
              commandId: randomUUID(),
              qr: null,
              status: "pending",
            },
          }),
        );
      }
    }
    if (resource === "conversations" && !id && request.method === "GET") {
      const search =
        new URL(request.url).searchParams.get("q")?.slice(0, 100) || "";
      return json(
        await db.crmConversation.findMany({
          where: {
            ...(!actor.admin ? { assignedSellerId: actor.sellerId } : {}),
            ...(search
              ? {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search } },
                  ],
                }
              : {}),
          },
          orderBy: { updatedAt: "desc" },
          take: 100,
          include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
        }),
      );
    }
    if (resource === "conversations" && id) {
      const conversation = await conversationFor(id, actor);
      if (request.method === "GET") {
        const before = new URL(request.url).searchParams.get("before");
        if (
          before &&
          !(await db.crmMessage.findFirst({
            where: { id: before, conversationId: id },
          }))
        )
          throw new HttpError(400, "Cursor inválido.");
        const messages = await db.crmMessage.findMany({
          where: { conversationId: id },
          include: {
            attachment: { select: { id: true, name: true, mime: true } },
          },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 101,
          ...(before ? { cursor: { id: before }, skip: 1 } : {}),
        });
        const hasMore = messages.length > 100;
        return json({
          ...conversation,
          sourcePhone: (
            await db.seller.findUnique({
              where: { id: conversation.account.sellerId },
            })
          )?.phone,
          messages: messages.slice(0, 100).reverse(),
          hasMore,
          quotes: await db.quote.findMany({
            where: { id: conversation.quoteId || "__none" },
          }),
        });
      }

      if (request.method === "PATCH") {
        const data = z
          .object({
            name: z.string().trim().max(120),
            notes: z.string().max(3000),
            stage: z.enum(["new", "contacted", "quoted", "won", "lost"]),
            assignedSellerId: z.string(),
          })
          .strict()
          .parse(await readJson(request));
        if (
          data.assignedSellerId !== conversation.assignedSellerId &&
          !actor.admin
        )
          throw new HttpError(403, "Transferência exige administrador.");
        if (
          !(await db.seller.findFirst({
            where: { id: data.assignedSellerId, active: true },
          }))
        )
          throw new HttpError(400, "Vendedor de destino inválido.");
        return json(await db.crmConversation.update({ where: { id }, data }));
      }
      if (action === "attachments" && request.method === "POST") {
        const body = await readLimited(request, 11 * 1024 * 1024);
        const form = await new Response(body, {
          headers: {
            "Content-Type": request.headers.get("content-type") || "",
          },
        }).formData();
        const file = form.get("file");
        if (!(file instanceof File))
          throw new HttpError(400, "Selecione um arquivo.");
        return json(
          await saveAttachment(
            id,
            file.name,
            file.type,
            Buffer.from(await file.arrayBuffer()),
          ),
          201,
        );
      }
      if (action === "messages" && request.method === "POST") {
        const data = z
          .object({
            requestKey: z.string().uuid(),
            body: z.string().trim().max(4000),
            attachmentId: z.string().optional(),
          })
          .strict()
          .refine(
            (d) => d.body || d.attachmentId,
            "Escreva uma mensagem ou selecione anexo",
          )
          .parse(await readJson(request));
        if (
          data.attachmentId &&
          !(await db.crmAttachment.findFirst({
            where: { id: data.attachmentId, conversationId: id },
          }))
        )
          throw new HttpError(400, "Anexo inválido.");
        if (
          conversation.account.status !== "connected" ||
          !conversation.account.heartbeatAt ||
          Date.now() - conversation.account.heartbeatAt.getTime() > 45000
        )
          throw new HttpError(409, "Conecte o WhatsApp antes de enviar.");
        const existing = await db.crmMessage.findUnique({
          where: { requestKey: data.requestKey },
        });
        if (existing) {
          if (
            existing.conversationId !== id ||
            existing.body !== data.body ||
            existing.attachmentId !== (data.attachmentId || null)
          )
            throw new HttpError(409, "Solicitação já utilizada.");
          return json(existing);
        }
        const message = await db.$transaction(async (tx) => {
          const row = await tx.crmMessage.create({
            data: {
              ...data,
              conversationId: id,
              direction: "out",
              author: actor.name,
            },
          });
          await tx.crmConversation.update({
            where: { id },
            data: { updatedAt: new Date() },
          });
          return row;
        });
        return json(message, 201);
      }
    }
    if (resource === "attachments" && id && request.method === "GET") {
      const item = await db.crmAttachment.findUnique({ where: { id } });
      if (!item) throw new HttpError(404, "Anexo não encontrado.");
      await conversationFor(item.conversationId, actor);
      return attachmentResponse(id);
    }
    throw new HttpError(404, "Rota não encontrada.");
  } catch (error) {
    const response = failure(error);
    return native
      ? new Response(null, {
          status: 303,
          headers: { Location: `/crm/login?error=${response.status}` },
        })
      : response;
  }
}
export { handle as GET, handle as POST, handle as PATCH };
