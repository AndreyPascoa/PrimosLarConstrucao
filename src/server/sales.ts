import { getDb } from "./db/prisma";
import { HttpError, json, readJson } from "./http";
import {
  isSellerAvailable,
  quoteSchema,
  quoteUpdateSchema,
  sellerSchema,
} from "@/lib/sales";
export async function assignQuote(body: unknown) {
  const data = quoteSchema.parse(body);
  return getDb().$transaction(
    async (db) => {
      // One shared lock serializes assignment across all server instances.
      await db.$executeRaw`SELECT pg_advisory_xact_lock(72631031)`;
      const now = new Date();
      const previous = await db.quote.findUnique({
        where: { requestKey: data.requestKey },
        include: { seller: true },
      });
      if (previous) {
        if (
          JSON.stringify(
            (previous.items as { id: string; quantity: number }[]).map((i) => ({
              id: i.id,
              quantity: i.quantity,
            })),
          ) !== JSON.stringify(data.items)
        )
          throw new HttpError(
            409,
            "Esta solicitação já foi usada para outro orçamento. Atualize a página.",
          );
        if (
          previous.seller.phone !== previous.sellerPhone ||
          !previous.seller.active ||
          !isSellerAvailable(previous.seller.schedule, now)
        )
          throw new HttpError(
            409,
            "O vendedor desse orçamento encerrou o atendimento. Atualize a página para solicitar um novo encaminhamento.",
          );
        return {
          id: previous.id,
          url: `https://wa.me/${previous.sellerPhone}?text=${encodeURIComponent(previous.message)}`,
          seller: previous.sellerName,
        };
      }
      const sellers = await db.seller.findMany({
        where: { active: true },
        orderBy: [
          { lastAssignedAt: { sort: "asc", nulls: "first" } },
          { createdAt: "asc" },
          { id: "asc" },
        ],
      });
      const seller = sellers.find((s) => isSellerAvailable(s.schedule, now));
      if (!seller)
        throw new HttpError(
          409,
          "Nenhum vendedor está disponível neste horário. Sua lista continua salva; tente durante o atendimento da loja.",
        );
      const products = await db.product.findMany({
        where: { id: { in: data.items.map((i) => i.id) }, published: true },
      });
      if (products.length !== data.items.length)
        throw new HttpError(
          409,
          "Algum produto não está mais disponível. Atualize a página e revise sua lista.",
        );
      const items = data.items.map((item) => ({
        ...item,
        name: products.find((p) => p.id === item.id)!.name,
      }));
      const quote = await db.quote.create({
        data: {
          requestKey: data.requestKey,
          sellerId: seller.id,
          sellerName: seller.name,
          sellerPhone: seller.phone,
          items,
          message: "",
        },
      });
      const message = `Olá, ${seller.name}! Gostaria de um orçamento.\nReferência: ${quote.id}\n\n${items.map((p) => `${p.quantity} × ${p.name}`).join("\n")}\n\nPodem confirmar os valores, a disponibilidade e as opções de entrega?`;
      if (message.length > 3500)
        throw new HttpError(
          400,
          "A lista está longa demais para um envio. Divida os produtos em dois orçamentos.",
        );
      await db.quote.update({ where: { id: quote.id }, data: { message } });
      await db.seller.update({
        where: { id: seller.id },
        data: {
          lastAssignedAt: new Date(
            Math.max(
              now.getTime(),
              ...sellers.map((s) => (s.lastAssignedAt?.getTime() || 0) + 1),
            ),
          ),
        },
      });
      return {
        id: quote.id,
        url: `https://wa.me/${seller.phone}?text=${encodeURIComponent(message)}`,
        seller: seller.name,
      };
    },
    { maxWait: 10000, timeout: 15000 },
  );
}
export async function salesAdmin(
  request: Request,
  resource: string,
  id?: string,
) {
  const db = getDb();
  const method = request.method;
  if (resource === "sellers") {
    if (method === "GET" && !id) {
      const rows = await db.seller.findMany({
        include: { _count: { select: { quotes: true } } },
        orderBy: { createdAt: "asc" },
      });
      return json(
        rows.map((s) => ({
          ...s,
          available: s.active && isSellerAvailable(s.schedule),
        })),
      );
    }
    if ((method === "POST" && !id) || (method === "PATCH" && id)) {
      const data = sellerSchema.parse(await readJson(request));
      return json(
        id
          ? await db.seller.update({ where: { id }, data })
          : await db.seller.create({ data }),
        id ? 200 : 201,
      );
    }
  }
  if (resource === "quotes") {
    if (method === "PATCH" && id) {
      const data = quoteUpdateSchema.parse(await readJson(request));
      return json(await db.quote.update({ where: { id }, data }));
    }
    if (method === "GET" && !id) {
      const params = new URL(request.url).searchParams;
      const page = Math.max(
        1,
        Math.min(100000, Number(params.get("page")) || 1),
      );
      const sellerId = params.get("seller") || undefined;
      const where = { ...(sellerId ? { sellerId } : {}) };
      const [rows, total, counts] = await Promise.all([
        db.quote.findMany({
          where,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          skip: (Math.floor(page) - 1) * 25,
          take: 25,
        }),
        db.quote.count({ where }),
        db.quote.groupBy({ by: ["sellerId"], _count: { _all: true } }),
      ]);
      return json({ rows, total, page: Math.floor(page), counts });
    }
  }
  throw new HttpError(404, "Rota não encontrada.");
}
