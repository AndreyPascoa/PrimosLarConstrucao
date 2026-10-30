import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { defaultSettings } from "../src/lib/content";
if (!process.env.DATABASE_URL)
  throw new Error("Configure DATABASE_URL antes de executar o seed.");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  try {
    await db.$transaction(async (tx) => {
      await tx.siteSettings.upsert({
        where: { id: "site" },
        update: {},
        create: { id: "site", data: defaultSettings },
      });
      if ((await tx.product.count()) === 0) {
        const category = await tx.category.upsert({
          where: { slug: "estrutural" },
          update: {},
          create: {
            name: "Estrutural",
            slug: "estrutural",
            primaryColor: "#92400E",
            secondaryColor: "#FEF3C7",
          },
        });
        await tx.product.createMany({
          data: [
            {
              id: "seed-tecplus-top",
              name: "TECPLUS TOP",
              description: "Argamassa TECPLUS TOP 18kg",
              imageUrl: "/produto/quartzolit/quartzolit-tecplus.png",
              categoryId: category.id,
              published: true,
            },
            {
              id: "seed-tecplus-lastic",
              name: "TECPLUS LASTIC 7000",
              description: "Argamassa TECPLUS LASTIC 7000 18kg",
              imageUrl: "/produto/quartzolit/quartzolit-tecplus-7000.png",
              categoryId: category.id,
              published: true,
            },
          ],
        });
      }
      if ((await tx.banner.count()) === 0)
        await tx.banner.create({
          data: {
            title: "Novidades da Primos Lar e Construção",
            imageUrl: "/carousel/1.png",
            linkUrl: "#shop",
            published: true,
          },
        });
    });
    console.log(
      "Conteúdo inicial criado. Os registros existentes foram preservados.",
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
