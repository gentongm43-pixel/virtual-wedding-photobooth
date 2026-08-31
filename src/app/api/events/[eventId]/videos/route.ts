import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/storage";

const MAX_SIZE = 50 * 1024 * 1024;
const MIME_TYPES = new Set(["video/webm", "video/mp4", "video/ogg", "video/quicktime"]);
const EXTENSIONS: Record<string, string> = {
  "video/webm": "webm",
  "video/mp4": "mp4",
  "video/ogg": "ogg",
  "video/quicktime": "mov",
};

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const form = await request.formData();
  const file = form.get("file");
  const sessionId = form.get("sessionId");
  const durationMs = Number(form.get("durationMs"));
  if (!(file instanceof File) || typeof sessionId !== "string") return NextResponse.json({ error: "File dan sesi wajib diisi." }, { status: 400 });
  const mimeType = file.type.split(";")[0].trim().toLowerCase();
  if (file.size <= 0 || file.size > MAX_SIZE) return NextResponse.json({ error: "Ukuran video harus lebih dari 0 dan maksimal 50 MB." }, { status: 413 });
  if (!MIME_TYPES.has(mimeType)) return NextResponse.json({ error: "Format video tidak didukung." }, { status: 415 });
  const event = await prisma.event.findFirst({ where: { OR: [{ id: eventId }, { slug: eventId }], active: true }, select: { id: true, allowVideo: true, videoDuration: true } });
  const session = await prisma.guestSession.findUnique({ where: { id: sessionId }, select: { id: true, eventId: true, status: true } });
  if (!event || !event.allowVideo) return NextResponse.json({ error: "Video tidak diizinkan untuk event ini." }, { status: 403 });
  if (!session || session.eventId !== event.id || session.status !== "ACTIVE") return NextResponse.json({ error: "Sesi tidak valid." }, { status: 403 });
  if (!Number.isFinite(durationMs) || durationMs <= 0 || durationMs > event.videoDuration * 1000 + 2000) return NextResponse.json({ error: "Durasi video melebihi batas event." }, { status: 400 });
  const extension = EXTENSIONS[mimeType];
  const data = Buffer.from(await file.arrayBuffer());
  let key: string | null = null;
  try {
    key = await storage.uploadFile({ data, contentType: mimeType, extension });
    const video = await prisma.video.create({ data: { eventId: event.id, sessionId, url: key, mimeType, size: data.length, durationMs: Math.round(durationMs) } });
    return NextResponse.json({ id: video.id, url: storage.getFileUrl(key, mimeType) }, { status: 201 });
  } catch (error) {
    if (key) await storage.deleteFile(key);
    if (process.env.NODE_ENV === "development") console.error(error);
    return NextResponse.json({ error: "Video gagal disimpan." }, { status: 500 });
  }
}
