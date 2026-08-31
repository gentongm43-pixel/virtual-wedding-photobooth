import { prisma } from "@/lib/prisma";
import type { GuestExperienceProps } from "@/components/photobooth/guest-experience";
import type { PreviewTemplate } from "@/components/photobooth/photo-preview";
import { configFromTemplateRecord } from "@/lib/image/template-config";

async function getFrames(): Promise<PreviewTemplate[]> {
  const rawFrames = await prisma.template.findMany({
    select: { id: true, name: true, width: true, height: true, background: true, overlay: true, logo: true, textConfig: true },
    orderBy: { createdAt: "asc" },
  });

  return rawFrames.map((frame): PreviewTemplate => {
    const config = configFromTemplateRecord(frame);
    return {
      ...frame,
      textConfig: { photoSlots: config.photoSlots, texts: config.texts },
    };
  });
}

export async function getGuestEvent(slug?: string): Promise<GuestExperienceProps | null> {
  const event = slug
    ? await prisma.event.findUnique({ where: { slug } })
    : await prisma.event.findFirst({ where: { active: true }, orderBy: { createdAt: "asc" } });

  if (!event || !event.active) return null;

  return {
    eventId: event.slug,
    eventName: event.name,
    eventDate: event.date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
    location: event.location,
    description: event.description,
    coverImage: event.coverImage,
    logo: event.logo,
    primaryColor: event.primaryColor,
    secondaryColor: event.secondaryColor,
    templateId: event.templateId,
    frames: await getFrames(),
    allowMessage: event.allowMessage,
    defaultPhotoCount: event.photoLimit,
    allowVideo: event.allowVideo,
    videoDuration: event.videoDuration,
    allowVoiceNote: event.allowVoiceNote,
    voiceNoteDuration: event.voiceNoteDuration,
  };
}
