import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const video = await prisma.video.findUnique({ where: { id: (await params).id } });
  if (!video) return NextResponse.json({ error: "Video tidak ditemukan." }, { status: 404 });
  try {
    const data = await storage.readFile(video.url);
    const extensions: Record<string, string> = { "video/webm": "webm", "video/mp4": "mp4", "video/quicktime": "mov", "video/ogg": "ogg" };
    const extension = extensions[video.mimeType] ?? "webm";
    return new NextResponse(new Uint8Array(data), { headers: { "Content-Type": video.mimeType, "Content-Disposition": `attachment; filename="video-${video.id}.${extension}"` } });
  } catch { return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 }); }
}
