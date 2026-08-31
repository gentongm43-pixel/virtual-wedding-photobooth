import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/storage";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const video = await prisma.video.findUnique({ where: { id: (await params).id } });
  if (!video) return NextResponse.json({ error: "Video tidak ditemukan." }, { status: 404 });
  await prisma.video.delete({ where: { id: video.id } });
  await storage.deleteFile(video.url);
  return NextResponse.json({ ok: true });
}
