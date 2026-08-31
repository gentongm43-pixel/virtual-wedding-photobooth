import { notFound } from "next/navigation";
import PhotoBoothHome from "@/components/homepage/photo-booth-home";
import { getGuestEvent } from "@/lib/guest-event";

export const dynamic = "force-dynamic";

export default async function Home() {
  const event = await getGuestEvent("putri-mahfud");
  if (!event) notFound();
  return <PhotoBoothHome {...event} />;
}
