import { getDb } from "@/server/db/prisma";
import { failure, json } from "@/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return json(
      await getDb().product.findMany({
        where: { published: true },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
    );
  } catch (error) {
    return failure(error);
  }
}
