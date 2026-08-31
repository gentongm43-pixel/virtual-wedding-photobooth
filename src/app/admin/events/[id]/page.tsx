import Link from "next/link";
import { notFound } from "next/navigation";
import EventForm from "@/components/admin/event-form";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import GuestAccess from "@/components/admin/guest-access";
import { getPublicEventUrl } from "@/lib/event-url";

export default async function EditEventPage({ params }: PageProps<"/admin/events/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [event, templates] = await Promise.all([
    prisma.event.findUnique({ where: { id }, include: { _count: { select: { photos: true, videos: true, voiceNotes: true, messages: true } } } }),
    prisma.template.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!event) notFound();
  return <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10 lg:px-12"><Link href="/admin/events" className="text-sm font-medium text-[#957c6c]">← Kembali ke events</Link><h1 className="mt-5 font-serif text-4xl">Edit event</h1><p className="mt-2 text-sm text-[#8f837b]">Perbarui detail dan pengaturan event.</p><div className="mt-5 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4"><Link href={`/admin/events/${id}/photos`} className="rounded-lg border border-[#ded3cc] px-3 py-2">Photos · {event._count.photos}</Link><Link href={`/admin/events/${id}/videos`} className="rounded-lg border border-[#ded3cc] px-3 py-2">Videos · {event._count.videos}</Link><Link href={`/admin/events/${id}/voice-notes`} className="rounded-lg border border-[#ded3cc] px-3 py-2">Voice notes · {event._count.voiceNotes}</Link><Link href="/admin/messages" className="rounded-lg border border-[#ded3cc] px-3 py-2">Messages · {event._count.messages}</Link></div><GuestAccess eventId={event.id} eventCode={event.eventCode} eventUrl={getPublicEventUrl(event.slug)} /><div className="mt-8 rounded-2xl border border-[#e8dfd8] bg-white p-6 sm:p-8"><EventForm templates={templates} initial={{ ...event, date: event.date.toISOString().slice(0, 10) }} /></div></div>;
}
