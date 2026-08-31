import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const event = await prisma.event.findFirst({ where: { OR: [{ id: eventId }, { slug: eventId }], active: true }, select: { id: true } });
  if (!event) return NextResponse.json({ error: "Event tidak ditemukan." }, { status: 404 });
  const headerList = await headers();
  const session = await prisma.guestSession.create({
    data: { eventId: event.id, deviceInfo: headerList.get("user-agent"), ipAddress: headerList.get("x-forwarded-for")?.split(",")[0]?.trim() },
    select: { id: true },
  });
  return NextResponse.json(session, { status: 201 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const body = await request.json().catch(() => ({})) as { sessionId?: string };
  const event = await prisma.event.findFirst({ where: { OR: [{ id: eventId }, { slug: eventId }], active: true }, select: { id: true } });
  if (!event || !body.sessionId) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 400 });
  const session = await prisma.guestSession.findFirst({ where: { id: body.sessionId, eventId: event.id, status: "ACTIVE" } });
  if (!session) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 403 });
  await prisma.guestSession.update({ where: { id: session.id }, data: { status: "COMPLETED" } });
  return NextResponse.json({ ok: true });
}
