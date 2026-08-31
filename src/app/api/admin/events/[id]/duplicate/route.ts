import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createEventWithGeneratedCode } from "@/lib/event-code";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const { id } = await params;
  const source = await prisma.event.findUnique({ where: { id } });
  if (!source) return NextResponse.json({ error: "Event tidak ditemukan." }, { status: 404 });

  let slug = `${source.slug}-copy`;
  for (let suffix = 2; ; suffix += 1) {
    const conflict = await prisma.event.findUnique({ where: { slug }, select: { id: true } });
    if (!conflict) break;
    slug = `${source.slug}-copy-${suffix}`;
  }
  const { id: newId } = await createEventWithGeneratedCode({
    name: `${source.name} (Copy)`,
    slug,
    date: source.date,
    location: source.location,
    logo: source.logo,
    description: source.description,
    coverImage: source.coverImage,
    primaryColor: source.primaryColor,
    secondaryColor: source.secondaryColor,
    templateId: source.templateId,
    photoLimit: source.photoLimit,
    allowVideo: source.allowVideo,
    videoDuration: source.videoDuration,
    allowVoiceNote: source.allowVoiceNote,
    voiceNoteDuration: source.voiceNoteDuration,
    allowMessage: source.allowMessage,
    saveOriginal: source.saveOriginal,
    active: source.active,
  });
  return NextResponse.json({ id: newId }, { status: 201 });
}
