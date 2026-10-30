import { getPublicContent } from "@/server/content";
import { json } from "@/server/http";
export const dynamic = "force-dynamic";
export async function GET() {
  const content = await getPublicContent();
  return json(content, content.catalogAvailable ? 200 : 503);
}
