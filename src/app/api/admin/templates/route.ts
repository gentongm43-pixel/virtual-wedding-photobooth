import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ name: z.string().trim().min(2).max(100), width: z.coerce.number().int().min(100).max(5000), height: z.coerce.number().int().min(100).max(5000), background: z.string().trim().max(2000).optional().or(z.literal("")), overlay: z.string().trim().max(2000).optional().or(z.literal("")), logo: z.string().trim().max(2000).optional().or(z.literal("")), textConfig: z.string().transform((value, ctx) => { try { return JSON.parse(value) as object; } catch { ctx.addIssue({ code: "custom", message: "JSON invalid" }); return z.NEVER; } }) });

export async function POST(request: Request) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const parsed = schema.safeParse(Object.fromEntries((await request.formData()).entries()));
  if (!parsed.success) return NextResponse.json({ error: "Konfigurasi template tidak valid." }, { status: 400 });
  const template = await prisma.template.create({ data: { ...parsed.data, background: parsed.data.background || null, overlay: parsed.data.overlay || null, logo: parsed.data.logo || null } });
  return NextResponse.json({ id: template.id }, { status: 201 });
}
