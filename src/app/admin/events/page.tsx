import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getPublicEventUrl } from "@/lib/event-url";

export default async function EventsPage() {
  await requireAdmin();
  const events = await prisma.event.findMany({ orderBy: { date: "desc" }, include: { _count: { select: { photos: true, videos: true, voiceNotes: true, messages: true } } } });
  return <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12"><header className="flex items-start justify-between"><div><p className="text-sm text-[#957c6c]">Workspace</p><h1 className="mt-2 font-serif text-4xl">Events</h1></div><Link href="/admin/events/new" className="inline-flex items-center gap-2 rounded-xl bg-[#2b2927] px-4 py-3 text-sm font-semibold text-white"><Plus size={16} /> Event baru</Link></header>
    <div className="mt-8 overflow-hidden rounded-2xl border border-[#e8dfd8] bg-white"><div className="hidden grid-cols-[1.5fr_1fr_0.7fr_0.7fr_24px] gap-4 border-b border-[#eee6e0] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#a19389] md:grid"><span>Event</span><span>Tanggal</span><span>Foto</span><span>Status</span><span /></div>{events.length === 0 ? <div className="p-10 text-center text-sm text-[#8f837b]">Belum ada event.</div> : events.map((event) => <Link href={`/admin/events/${event.id}`} key={event.id} className="grid gap-3 border-b border-[#f1ebe7] px-6 py-5 transition last:border-0 hover:bg-[#fdfaf8] md:grid-cols-[1.5fr_1fr_0.7fr_0.7fr_24px] md:items-center md:gap-4"><div><p className="font-semibold">{event.name}</p><p className="mt-1 truncate text-xs text-[#a19389]">{getPublicEventUrl(event.slug)}</p></div><p className="text-sm text-[#756d67]">{event.date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p><p className="text-sm text-[#756d67]">{event._count.photos} foto</p><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${event.active ? "bg-emerald-50 text-emerald-700" : "bg-[#f2efed] text-[#8f837b]"}`}>{event.active ? "Aktif" : "Nonaktif"}</span><ArrowUpRight size={16} className="text-[#b9aaa0]" /></Link>)}</div>
  </div>;
}
