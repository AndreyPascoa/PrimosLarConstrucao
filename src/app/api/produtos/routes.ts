
import { prisma } from "@/server/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const produtos = await prisma.product.findMany({
      where: {
        published: true
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return Response.json(produtos, { status: 200 });
  } catch (error) {
    console.error("Erro ao consultar produtos:", error);

    return Response.json(
      { error: "Erro ao consultar produtos" },
      { status: 500 }
    );
  }
}
