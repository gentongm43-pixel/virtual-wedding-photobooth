import { notFound } from "next/navigation";
import PhotoBoothHome from "@/components/homepage/photo-booth-home";
import GuestExperience from "@/components/photobooth/guest-experience";
import { getGuestEvent } from "@/lib/guest-event";

export default async function GuestEventPage({ params, searchParams }: PageProps<"/event/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const event = await getGuestEvent(slug);
  if (!event) notFound();
  if (query?.start === "media") return <GuestExperience {...event} initialStep="main-choice" />;
  return <PhotoBoothHome {...event} />;
}
