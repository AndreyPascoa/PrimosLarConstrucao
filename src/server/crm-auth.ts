import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync } from "node:crypto";
import { currentSession, verifyPassword, logout as adminLogout } from "./auth";
import { getDb } from "./db/prisma";
import { HttpError } from "./http";
export const digest = (s: string) =>
  createHash("sha256").update(s).digest("hex");
export const passwordHash = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
};
export type Actor = { admin: boolean; sellerId: string; name: string };
export async function crmActor(): Promise<Actor> {
  if (await currentSession())
    return { admin: true, sellerId: "", name: "Administrador" };
  const token = (await cookies()).get("primos_crm")?.value;
  if (!token) throw new HttpError(401, "Entre para acessar o CRM.");
  const db = getDb();
  const session = await db.crmSession.findUnique({
    where: { tokenHash: digest(token) },
  });
  const user = session
    ? await db.crmUser.findUnique({ where: { id: session.userId } })
    : null;
  const seller = user
    ? await db.seller.findUnique({ where: { id: user.sellerId } })
    : null;
  if (
    !session ||
    session.expiresAt < new Date() ||
    !user?.active ||
    !seller?.active ||
    session.identity !== digest(user.passwordHash)
  )
    throw new HttpError(401, "Sessão expirada.");
  return { admin: false, sellerId: seller.id, name: seller.name };
}
export async function staffLogin(email: string, password: string) {
  const db = getDb();
  const key = `crm-login:${digest(email.toLowerCase())}:${Math.floor(Date.now() / 900000)}`;
  const attempt = await db.loginAttempt.upsert({
    where: { key },
    create: { key, expiresAt: new Date(Date.now() + 900000) },
    update: { count: { increment: 1 } },
  });
  if (attempt.count > 15)
    throw new HttpError(429, "Aguarde 15 minutos antes de tentar novamente.");
  const user = await db.crmUser.findUnique({
    where: { email: email.toLowerCase() },
  });
  const valid = await verifyPassword(
    password,
    user?.passwordHash || passwordHash("dummy-login-password"),
  );
  const seller = user
    ? await db.seller.findUnique({ where: { id: user.sellerId } })
    : null;
  if (!valid || !user?.active || !seller?.active)
    throw new HttpError(401, "E-mail ou senha incorretos.");
  await adminLogout();
  await db.crmSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const token = randomBytes(32).toString("hex"),
    expiresAt = new Date(Date.now() + 28800000);
  await db.crmSession.create({
    data: {
      tokenHash: digest(token),
      userId: user.id,
      identity: digest(user.passwordHash),
      expiresAt,
    },
  });
  (await cookies()).set("primos_crm", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}
export async function staffLogout() {
  const jar = await cookies();
  const token = jar.get("primos_crm")?.value;
  if (token)
    await getDb().crmSession.deleteMany({
      where: { tokenHash: digest(token) },
    });
  jar.delete("primos_crm");
}
export async function conversationFor(id: string, actor: Actor) {
  const conversation = await getDb().crmConversation.findFirst({
    where: {
      id,
      ...(!actor.admin ? { assignedSellerId: actor.sellerId } : {}),
    },
    include: { account: true },
  });
  if (!conversation) throw new HttpError(404, "Conversa não encontrada.");
  return conversation;
}
