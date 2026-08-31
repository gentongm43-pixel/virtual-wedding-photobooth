import { redirect } from "next/navigation";

export default async function PublicGalleryPage({ searchParams }: { searchParams?: Promise<{ filter?: string }> }) {
  const filter = (await searchParams)?.filter;
  const filterMap: Record<string, string> = { photos: "photo", videos: "video", voice: "voice", messages: "message" };
  const suffix = filter && filterMap[filter] ? `?filter=${filterMap[filter]}` : "";
  redirect(`/event/putri-mahfud/gallery${suffix}`);
}
