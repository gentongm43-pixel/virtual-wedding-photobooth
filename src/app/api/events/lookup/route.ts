import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeEventCode } from "@/lib/event-code";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const code = normalizeEventCode(searchParams.get("code") ?? "");
  const slug = searchParams.get("slug")?.trim().toLowerCase() ?? "";
  if (!code && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  const event = code
    ? await prisma.event.findUnique({ where: { eventCode: code }, select: { slug: true, active: true } })
    : await prisma.event.findUnique({ where: { slug }, select: { slug: true, active: true } });
  if (!event) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
  if (!event.active) return NextResponse.json({ error: "Event sedang tidak tersedia" }, { status: 410 });
  return NextResponse.json({ slug: event.slug });
}
