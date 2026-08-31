import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validation";
import { updateEventWithGeneratedCode } from "@/lib/event-code";

async function authorized() { return Boolean(await getAdminUser()); }

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorized())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const { id } = await params;
  const parsed = eventSchema.safeParse(Object.fromEntries((await request.formData()).entries()));
  if (!parsed.success) return NextResponse.json({ error: "Periksa kembali data event." }, { status: 400 });
  const current = await prisma.event.findUniqueOrThrow({ where: { id }, select: { name: true, eventCode: true } });
  const event = await updateEventWithGeneratedCode(id, { ...parsed.data, location: parsed.data.location || null, description: parsed.data.description || null, coverImage: parsed.data.coverImage || null, logo: parsed.data.logo || null, primaryColor: parsed.data.primaryColor || null, secondaryColor: parsed.data.secondaryColor || null, templateId: parsed.data.templateId || null }, current);
  return NextResponse.json({ id: event.id });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorized())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  await prisma.event.delete({ where: { id: (await params).id } });
  return NextResponse.json({ ok: true });
}
