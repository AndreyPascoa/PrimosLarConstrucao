import { assignQuote } from "@/server/sales";
import { checkOrigin, failure, json, readJson } from "@/server/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    return json(await assignQuote(await readJson(request)), 201);
  } catch (error) {
    return failure(error);
  }
}
