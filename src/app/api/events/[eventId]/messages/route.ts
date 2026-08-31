import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const form = await request.formData();
  const content = String(form.get("content") ?? "").trim();
  const name = String(form.get("name") ?? "").trim();
  const sessionId = String(form.get("sessionId") ?? "");
  if (!content || content.length > 500 || name.length > 100 || !sessionId) return NextResponse.json({ error: "Ucapan dan sesi wajib diisi." }, { status: 400 });
  const event = await prisma.event.findFirst({ where: { OR: [{ id: eventId }, { slug: eventId }], active: true }, select: { id: true, allowMessage: true } });
  const session = await prisma.guestSession.findUnique({ where: { id: sessionId }, select: { eventId: true, status: true } });
  if (!event || !event.allowMessage) return NextResponse.json({ error: "Ucapan tidak diizinkan untuk event ini." }, { status: 403 });
  if (!session || session.eventId !== event.id || session.status !== "ACTIVE") return NextResponse.json({ error: "Sesi tidak valid." }, { status: 403 });
  const message = await prisma.message.create({ data: { eventId: event.id, sessionId, name: name || null, content } });
  return NextResponse.json({ id: message.id }, { status: 201 });
}
