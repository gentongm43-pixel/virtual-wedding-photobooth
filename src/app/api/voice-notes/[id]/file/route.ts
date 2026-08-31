import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const note = await prisma.voiceNote.findUnique({ where: { id: (await params).id } });
  if (!note) return NextResponse.json({ error: "Voice note tidak ditemukan." }, { status: 404 });
  try {
    const data = await storage.readFile(note.url);
    const extensions: Record<string, string> = { "audio/webm": "webm", "audio/mp4": "mp4", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/wav": "wav", "audio/x-wav": "wav" };
    const extension = extensions[note.mimeType] ?? "webm";
    return new NextResponse(new Uint8Array(data), { headers: { "Content-Type": note.mimeType, "Content-Disposition": `attachment; filename="voice-note-${note.id}.${extension}"` } });
  } catch { return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 }); }
}
