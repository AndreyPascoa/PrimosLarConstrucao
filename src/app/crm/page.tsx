import { redirect } from "next/navigation";
import { crmActor } from "@/server/crm-auth";
import CrmPanel from "@/components/crm/crm-panel";
export const dynamic = "force-dynamic";
export default async function Page() {
  let actor;
  try {
    actor = await crmActor();
  } catch {
    redirect("/crm/login");
  }
  return <CrmPanel actor={actor} />;
}
