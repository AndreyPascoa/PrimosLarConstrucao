import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getDb } from "./db/prisma";
import { HttpError } from "./http";
function config() {
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY,
    bucket = process.env.CRM_STORAGE_BUCKET || "crm-private";
  if (!url || !key || !/^[a-z0-9-]+$/.test(bucket))
    throw new HttpError(503, "Configure o bucket privado de anexos do CRM.");
  return { url, key, bucket };
}
export async function saveAttachment(
  conversationId: string,
  name: string,
  mime: string,
  input: Buffer,
) {
  if (!input.length || input.length > 10 * 1024 * 1024)
    throw new HttpError(400, "Anexo deve ter até 10 MB.");
  let buffer = input;
  if (["image/jpeg", "image/png", "image/webp"].includes(mime)) {
    try {
      buffer = await sharp(input, { limitInputPixels: 25000000 })
        .rotate()
        .resize({
          width: 1920,
          height: 1920,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp()
        .toBuffer();
      mime = "image/webp";
      name = name.replace(/\.[^.]+$/, "") + ".webp";
    } catch {
      throw new HttpError(400, "Imagem inválida.");
    }
  } else if (
    mime !== "application/pdf" ||
    input.subarray(0, 5).toString() !== "%PDF-"
  )
    throw new HttpError(400, "Use imagens PNG/JPG/WebP ou PDF.");
  const { url, key, bucket } = config(),
    path = randomUUID();
  const metadata = await fetch(`${url}/storage/v1/bucket/${bucket}`, {
    headers: { Authorization: `Bearer ${key}`, apikey: key },
    signal: AbortSignal.timeout(15000),
  });
  if (!metadata.ok || (await metadata.json()).public !== false)
    throw new HttpError(
      503,
      "O bucket do CRM precisa existir e ser privado. Não use o bucket público do site.",
    );
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": mime,
    },
    body: new Uint8Array(buffer),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new HttpError(502, "Falha ao salvar o anexo no Storage privado.");
  try {
    return await getDb().crmAttachment.create({
      data: {
        conversationId,
        name: name.replace(/[\r\n"\\/]/g, "_").slice(0, 160),
        path,
        mime,
        size: buffer.length,
      },
    });
  } catch (error) {
    await fetch(`${url}/storage/v1/object/${bucket}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: [path] }),
    }).catch(() => {});
    throw error;
  }
}
export async function attachmentResponse(id: string) {
  const item = await getDb().crmAttachment.findUnique({ where: { id } });
  if (!item) throw new HttpError(404, "Anexo não encontrado.");
  const { url, key, bucket } = config();
  const response = await fetch(
    `${url}/storage/v1/object/authenticated/${bucket}/${item.path}`,
    {
      headers: { Authorization: `Bearer ${key}`, apikey: key },
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!response.ok) throw new HttpError(502, "Anexo indisponível.");
  return new Response(response.body, {
    headers: {
      "Content-Type": item.mime,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(item.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
