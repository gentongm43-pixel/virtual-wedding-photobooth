import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/storage";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const note = await prisma.voiceNote.findUnique({ where: { id: (await params).id } });
  if (!note) return NextResponse.json({ error: "Voice note tidak ditemukan." }, { status: 404 });
  await prisma.voiceNote.delete({ where: { id: note.id } });
  await storage.deleteFile(note.url);
  return NextResponse.json({ ok: true });
}
