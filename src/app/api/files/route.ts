import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage/storage";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const requestedType = request.nextUrl.searchParams.get("type");
  if (!key) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  try {
    const admin = await getAdminUser();
    if (!admin) {
      const [photo, video, note] = await Promise.all([
        prisma.photo.findFirst({ where: { finalUrl: key, event: { active: true } }, select: { id: true } }),
        prisma.video.findFirst({ where: { url: key, event: { active: true } }, select: { id: true } }),
        prisma.voiceNote.findFirst({ where: { url: key, event: { active: true } }, select: { id: true } }),
      ]);
      const template = await prisma.template.findFirst({
        where: {
          events: { some: { active: true } },
          OR: [{ background: key }, { overlay: key }, { logo: key }],
        },
        select: { id: true },
      });
      if (!photo && !video && !note && !template) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
    }
    const data = await storage.readFile(key);
    const extension = key.split(".").pop()?.toLowerCase();
    const contentType = requestedType?.startsWith("audio/") || requestedType?.startsWith("video/") ? requestedType : extension === "mp4" ? "video/mp4" : extension === "mov" ? "video/quicktime" : extension === "mp3" ? "audio/mpeg" : extension === "ogg" ? "audio/ogg" : extension === "wav" ? "audio/wav" : extension === "webm" ? "video/webm" : "image/jpeg";
    return new NextResponse(new Uint8Array(data), { headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=3600" } });
  } catch {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
  }
}
