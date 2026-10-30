import { cache } from "react";
import { defaultSettings, type PublicContent } from "@/lib/content";
import { settingsSchema } from "@/lib/validation";
import { getDb } from "./db/prisma";
export const getPublicContent = cache(async (): Promise<PublicContent> => {
  try {
    const db = getDb();
    const [products, categories, banners, row] = await Promise.all([
      db.product.findMany({
        where: { published: true },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
      db.category.findMany({ orderBy: { name: "asc" } }),
      db.banner.findMany({
        where: { published: true },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      }),
      db.siteSettings.findUnique({ where: { id: "site" } }),
    ]);
    const parsed = settingsSchema.safeParse({
      ...defaultSettings,
      ...(row?.data && typeof row.data === "object" ? row.data : {}),
    });
    return {
      products,
      categories,
      banners,
      settings: parsed.success ? parsed.data : defaultSettings,
      catalogAvailable: true,
    };
  } catch (error) {
    console.error(
      "Catálogo indisponível:",
      error instanceof Error ? error.message : "Falha de conexão",
    );
    return {
      settings: defaultSettings,
      products: [],
      categories: [],
      banners: [],
      catalogAvailable: false,
    };
  }
});
