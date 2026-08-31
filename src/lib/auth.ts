import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const COOKIE_NAME = "momen_admin_session";
const SESSION_DAYS = 7;

export async function createAdminSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await prisma.adminSession.create({ data: { token, userId, expiresAt } });
  (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", expires: expiresAt, path: "/" });
}

export async function getAdminUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({ where: { token }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function destroyAdminSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { token } });
  (await cookies()).delete(COOKIE_NAME);
}

export function hashForDisplay(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}
