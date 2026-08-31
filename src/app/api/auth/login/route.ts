import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({ email: z.string().email().transform((value) => value.toLowerCase()), password: z.string().min(8) });

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Format login tidak valid." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await compare(parsed.data.password, user.passwordHash))) return NextResponse.json({ error: "Email atau password tidak valid." }, { status: 401 });
  await createAdminSession(user.id);
  return NextResponse.json({ ok: true });
}
