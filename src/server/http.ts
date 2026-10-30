import { ZodError } from "zod";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export function checkOrigin(request: Request) {
  const expected =
    process.env.APP_URL ||
    (process.env.NODE_ENV !== "production" ? new URL(request.url).origin : "");
  if (!expected) throw new HttpError(503, "Configure APP_URL no servidor.");
  if (request.headers.get("origin") !== new URL(expected).origin)
    throw new HttpError(403, "Origem da requisição inválida.");
}
export async function readLimited(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit)
    throw new HttpError(413, "Conteúdo muito grande.");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) {
        await reader.cancel();
        throw new HttpError(413, "Conteúdo muito grande.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}
export async function readJson(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Envie JSON.");
  const body = new TextDecoder().decode(await readLimited(request, 32768));
  try {
    return JSON.parse(body);
  } catch {
    throw new HttpError(400, "JSON inválido.");
  }
}
export function failure(error: unknown) {
  if (error instanceof HttpError)
    return json({ error: error.message }, error.status);
  if (error instanceof ZodError)
    return json(
      {
        error: error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      },
      400,
    );
  const code =
    error && typeof error === "object" && "code" in error ? error.code : "";
  if (code === "P2002")
    return json(
      { error: "Já existe um registro com esse identificador." },
      409,
    );
  if (code === "P2003")
    return json(
      {
        error:
          "Registro vinculado a produtos ou categoria inválida. Atualize os vínculos primeiro.",
      },
      409,
    );
  if (code === "P2025") return json({ error: "Registro não encontrado." }, 404);
  console.error(
    "Erro na administração:",
    error instanceof Error ? error.message : "Erro desconhecido",
  );
  return json(
    {
      error:
        "Não foi possível concluir. Verifique a conexão e as migrações do banco no servidor.",
    },
    503,
  );
}
