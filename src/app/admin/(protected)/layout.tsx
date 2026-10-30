import { redirect } from "next/navigation";
import { currentSession } from "@/server/auth";
export const dynamic = "force-dynamic";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await currentSession();
  } catch {
    redirect("/admin/login?status=unavailable");
  }
  if (!session) redirect("/admin/login");
  return children;
}
