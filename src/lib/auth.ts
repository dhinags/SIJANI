import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { HttpError } from "./http";
import { secureSessionCookie } from "./app-origin";
export const SESSION_COOKIE = "sijani_session";
const digest = (token: string) => createHash("sha256").update(token).digest("hex");
export function demoEnabled() { return process.env.APP_MODE === "demo"; }
export async function currentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await db.session.findUnique({ where: { tokenHash: digest(token) }, include: { user: { include: { profile: true } } } });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  if (session.user.isDemo && !demoEnabled()) return null;
  return session.user;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "Masuk terlebih dahulu untuk menyimpan pembelajaran.");
  return user;
}
export async function pageUser() { const user = await currentUser(); if (!user) redirect("/masuk"); return user; }
export async function requireDosen() {
  const user = await requireUser();
  if (user.role !== "DOSEN") throw new HttpError(403, "Ruang dosen memerlukan akun dengan izin pengajar.");
  return user;
}
export async function createDemoSession() {
  const token = randomBytes(32).toString("hex"); const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.user.create({ data: { profile: { create: {} }, sessions: { create: { tokenHash: digest(token), expiresAt } } } });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: secureSessionCookie(), path: "/", expires: expiresAt });
}
export async function endSession() {
  const jar = await cookies(); const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: digest(token) } });
  jar.delete(SESSION_COOKIE);
}
