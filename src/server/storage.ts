import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { HttpError } from "./http";
function storageConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "site-media";
  if (!url || !key || !/^[a-z0-9-]+$/.test(bucket))
    throw new HttpError(
      503,
      "Configure o Supabase Storage no servidor para enviar imagens.",
    );
  return { url, key, bucket };
}
export async function uploadImage(file: File) {
  if (!file.size || file.size > 5 * 1024 * 1024)
    throw new HttpError(400, "Envie uma imagem de até 5 MB.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new HttpError(400, "Use PNG, JPG ou WebP.");
  const { url, key, bucket } = storageConfig();
  let buffer: Buffer;
  try {
    buffer = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 25_000_000,
    })
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new HttpError(400, "Imagem inválida ou dimensões muito grandes.");
  }
  const path = `${randomUUID()}.webp`;
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "image/webp",
      "x-upsert": "false",
    },
    body: new Uint8Array(buffer),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new HttpError(
      502,
      "Não foi possível enviar a imagem. Verifique o bucket público e a chave do Storage.",
    );
  return { path, url: `${url}/storage/v1/object/public/${bucket}/${path}` };
}
export async function removeImage(path: string) {
  const { url, key, bucket } = storageConfig();
  const response = await fetch(`${url}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: [path] }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok)
    throw new HttpError(502, "Não foi possível remover a imagem do Storage.");
}
