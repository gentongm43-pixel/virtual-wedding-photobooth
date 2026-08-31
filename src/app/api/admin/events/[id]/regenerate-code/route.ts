import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { generateUniqueEventCode } from "@/lib/event-code";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id }, select: { name: true, eventCode: true } });
  if (!event) return NextResponse.json({ error: "Event tidak ditemukan." }, { status: 404 });
  const updated = await prisma.event.update({
    where: { id },
    data: { eventCode: await generateUniqueEventCode(event.name, id, event.eventCode) },
    select: { eventCode: true },
  });
  return NextResponse.json(updated);
}
