import { cookies } from "next/headers";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "./db/prisma";
import { HttpError } from "./http";
const derive = promisify(scrypt);
const cookieName = "primos_admin";
const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function verifyPassword(password: string, encoded: string) {
  const [kind, salt, hex] = encoded.split(":");
  if (
    kind !== "scrypt" ||
    !/^[a-f0-9]{32}$/.test(salt || "") ||
    !/^[a-f0-9]{128}$/.test(hex || "")
  )
    return false;
  const derived = (await derive(password, salt, 64)) as Buffer;
  return timingSafeEqual(derived, Buffer.from(hex, "hex"));
}
export async function currentSession() {
  const value = (await cookies()).get(cookieName)?.value;
  if (
    !value ||
    !/^[a-f0-9]{64}$/.test(value) ||
    !process.env.ADMIN_PASSWORD_HASH
  )
    return null;
  const session = await getDb().adminSession.findUnique({
    where: { tokenHash: digest(value) },
  });
  if (
    !session ||
    session.expiresAt < new Date() ||
    session.identity !== identity()
  )
    return null;
  return session;
}
const identity = () =>
  digest(
    `${process.env.ADMIN_EMAIL?.toLowerCase()}:${process.env.ADMIN_PASSWORD_HASH}`,
  );
export async function requireAdmin() {
  if (!(await currentSession()))
    throw new HttpError(401, "Sessão expirada. Entre novamente.");
}
export async function login(email: string, password: string) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH)
    throw new HttpError(503, "Administrador não configurado no servidor.");
  const db = getDb();
  // Shared across instances; every attempt counts, including unknown addresses.
  const window = Math.floor(Date.now() / (15 * 60 * 1000));
  const key = `admin-login:${window}`;
  const attempt = await db.loginAttempt.upsert({
    where: { key },
    create: { key, expiresAt: new Date((window + 1) * 15 * 60 * 1000) },
    update: { count: { increment: 1 } },
  });
  if (attempt.count > 20)
    throw new HttpError(429, "Muitas tentativas. Aguarde até 15 minutos.");
  const valid = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);
  if (!valid || email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase())
    throw new HttpError(401, "E-mail ou senha incorretos.");
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await db.adminSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  await db.loginAttempt.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  await db.adminSession.create({
    data: { tokenHash: digest(token), identity: identity(), expiresAt },
  });
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token)
    await getDb().adminSession.deleteMany({
      where: { tokenHash: digest(token) },
    });
  jar.delete(cookieName);
}
