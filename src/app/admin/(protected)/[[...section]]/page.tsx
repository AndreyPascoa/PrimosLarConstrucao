import { notFound } from "next/navigation";
import AdminPanel from "@/components/admin/admin-panel";
const pages: Record<string, string> = {
  "": "dashboard",
  produtos: "products",
  categorias: "categories",
  banners: "banners",
  imagens: "media",
  conteudo: "content",
  aparencia: "appearance",
};
export default async function Page({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section } = await params;
  const view = pages[(section || []).join("/")];
  if (!view) notFound();
  return <AdminPanel key={view} view={view} />;
}
