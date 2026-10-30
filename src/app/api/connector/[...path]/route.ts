import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getDb } from "@/server/db/prisma";
import { attachmentResponse, saveAttachment } from "@/server/crm-storage";
import { failure, HttpError, json, readLimited } from "@/server/http";
export const runtime = "nodejs";
const eventSchema = z.object({
  accountId: z.string(),
  externalId: z.string().min(1).max(250),
  phone: z.string().regex(/^\d{8,16}$/),
  name: z.string().max(120),
  body: z.string().max(20000),
  media: z
    .object({
      name: z.string().max(160),
      mime: z.string().max(100),
      base64: z.string().max(14000000),
    })
    .optional(),
});
async function handle(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const expected = process.env.CRM_CONNECTOR_SECRET || "",
      supplied =
        request.headers.get("authorization")?.replace(/^Bearer /, "") || "";
    if (
      expected.length < 32 ||
      supplied.length !== expected.length ||
      !timingSafeEqual(
        createHash("sha256").update(expected).digest(),
        createHash("sha256").update(supplied).digest(),
      )
    )
      throw new HttpError(401, "Conector não autorizado.");
    const { path } = await params;
    const [resource, id] = path;
    if (path.length > 2) throw new HttpError(404, "Rota inválida.");
    const db = getDb();
    if (resource === "accounts" && request.method === "GET") {
      await db.waAccount.updateMany({ data: { heartbeatAt: new Date() } });
      return json(
        await db.waAccount.findMany().then(async (rows) =>
          Promise.all(
            rows.map(async (a) => {
              const seller = await db.seller.findUnique({
                where: { id: a.sellerId },
              });
              return {
                ...a,
                phone: seller?.phone,
                command: seller?.active ? a.command : "disconnect",
                commandId: seller?.active
                  ? a.commandId
                  : a.commandId + ":disabled",
              };
            }),
          ),
        ),
      );
    }
    if (resource === "attachments" && id && request.method === "GET")
      return attachmentResponse(id);
    const body = JSON.parse(
      new TextDecoder().decode(await readLimited(request, 15 * 1024 * 1024)),
    );
    if (resource === "status") {
      const data = z
        .object({
          accountId: z.string(),
          status: z.enum([
            "connecting",
            "qr",
            "connected",
            "disconnected",
            "error",
            "wrong_number",
          ]),
          qr: z.string().max(200000).optional(),
        })
        .strict()
        .parse(body);
      return json(
        await db.waAccount.update({
          where: { id: data.accountId },
          data: {
            status: data.status,
            qr: data.status === "qr" ? data.qr : null,
            qrExpiresAt:
              data.status === "qr" ? new Date(Date.now() + 90000) : null,
            heartbeatAt: new Date(),
          },
        }),
      );
    }
    if (resource === "incoming") {
      const data = eventSchema.parse(body),
        key = `${data.accountId}:${data.externalId}`;
      if (await db.crmMessage.findUnique({ where: { externalKey: key } }))
        return json({ ok: true });
      const account = await db.waAccount.findUnique({
        where: { id: data.accountId },
      });
      if (!account) throw new HttpError(404, "Conta não encontrada.");
      const conversation = await db.crmConversation.upsert({
        where: {
          accountId_phone: { accountId: data.accountId, phone: data.phone },
        },
        create: {
          accountId: data.accountId,
          phone: data.phone,
          name: data.name,
          assignedSellerId: account.sellerId,
        },
        update: { updatedAt: new Date() },
      });
      const ref = data.body.match(/Referência:\s*([a-zA-Z0-9_-]+)/)?.[1];
      if (ref) {
        const quote = await db.quote.findFirst({
          where: { id: ref, sellerId: account.sellerId },
        });
        if (quote)
          await db.crmConversation.update({
            where: { id: conversation.id },
            data: { quoteId: quote.id },
          });
      }
      let attachment;
      let text = data.body;
      if (data.media) {
        try {
          attachment = await saveAttachment(
            conversation.id,
            data.media.name,
            data.media.mime,
            Buffer.from(data.media.base64, "base64"),
          );
        } catch {
          text +=
            "\n[Anexo não armazenado: formato não suportado ou Storage indisponível. Confira no WhatsApp.]";
        }
      }
      await db.crmMessage.create({
        data: {
          conversationId: conversation.id,
          externalKey: key,
          direction: "in",
          body: text,
          attachmentId: attachment?.id,
          status: "received",
        },
      });
      return json({ ok: true });
    }
    if (resource === "claim") {
      const { accountId } = z.object({ accountId: z.string() }).parse(body);
      const account = await db.waAccount.findUnique({
        where: { id: accountId },
      });
      if (account?.status !== "connected" || account.command !== "connect")
        return json(null);
      await db.crmMessage.updateMany({
        where: {
          status: "sending",
          claimedAt: { lt: new Date(Date.now() - 120000) },
        },
        data: {
          status: "unknown",
          error:
            "Conector perdeu confirmação. Confira o WhatsApp antes de reenviar.",
        },
      });
      return json(
        await db.$transaction(async (tx) => {
          const rows = await tx.$queryRaw<
            { id: string }[]
          >`SELECT m.id FROM "CrmMessage" m JOIN "CrmConversation" c ON c.id=m."conversationId" WHERE m.status='queued' AND c."accountId"=${accountId} ORDER BY m."createdAt" LIMIT 1 FOR UPDATE OF m SKIP LOCKED`;
          if (!rows.length) return null;
          return tx.crmMessage.update({
            where: { id: rows[0].id },
            data: { status: "sending", claimedAt: new Date() },
            include: { conversation: true, attachment: true },
          });
        }),
      );
    }
    if (resource === "result") {
      const data = z
        .object({
          id: z.string(),
          status: z.enum(["sent", "failed", "unknown"]),
          externalId: z.string().max(250).optional(),
          error: z.string().max(300).optional(),
        })
        .parse(body);
      const message = await db.crmMessage.findUnique({
        where: { id: data.id },
        include: { conversation: true },
      });
      if (!message || message.status !== "sending") return json({ ok: true });
      await db.crmMessage.update({
        where: { id: data.id },
        data: {
          status: data.status,
          error: data.error,
          externalKey: data.externalId
            ? `${message.conversation.accountId}:${data.externalId}`
            : undefined,
        },
      });
      return json({ ok: true });
    }
    if (resource === "ack") {
      const data = z
        .object({
          accountId: z.string(),
          externalId: z.string(),
          ack: z.number(),
        })
        .parse(body);
      if (data.ack >= 2)
        await db.crmMessage.updateMany({
          where: {
            externalKey: `${data.accountId}:${data.externalId}`,
            direction: "out",
            status: {
              in:
                data.ack >= 3
                  ? ["sent", "delivered", "read"]
                  : ["sent", "delivered"],
            },
          },
          data: { status: data.ack >= 3 ? "read" : "delivered" },
        });
      return json({ ok: true });
    }
    throw new HttpError(404, "Rota não encontrada.");
  } catch (error) {
    return failure(error);
  }
}
export { handle as GET, handle as POST };
