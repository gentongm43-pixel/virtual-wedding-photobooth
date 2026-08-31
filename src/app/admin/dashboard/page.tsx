/* Event cover images are administrator-configured URLs. */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowUpRight, Bell, Camera, Heart, Image as ImageIcon, LayoutTemplate, MessageCircle, Mic, Plus, QrCode, Settings, Share2, Sparkles, Video } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { storage } from "@/lib/storage/storage";

type RecentItem = { id: string; kind: string; label: string; detail: string; createdAt: Date; icon: typeof Camera };

export default async function DashboardPage() {
  const user = await requireAdmin();
  const [events, photos, videos, voiceNotes, messages, activeEvents, activeEvent, recentEvents, recentPhotos, recentVideos, recentVoiceNotes, recentMessages] = await prisma.$transaction([
    prisma.event.count(),
    prisma.photo.count(),
    prisma.video.count(),
    prisma.voiceNote.count(),
    prisma.message.count(),
    prisma.event.count({ where: { active: true } }),
    prisma.event.findFirst({ where: { active: true }, orderBy: { updatedAt: "desc" }, include: { _count: { select: { photos: true, videos: true, voiceNotes: true, messages: true } } } }),
    prisma.event.findMany({ orderBy: { createdAt: "desc" }, take: 4, include: { _count: { select: { photos: true, messages: true } } } }),
    prisma.photo.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.video.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.voiceNote.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const stats = [
    { label: "Event Aktif", value: activeEvents, icon: Sparkles, note: "siap digunakan" },
    { label: "Foto", value: photos, icon: Camera, note: "tersimpan" },
    { label: "Video", value: videos, icon: Video, note: "tersimpan" },
    { label: "Voice Note", value: voiceNotes, icon: Mic, note: "tersimpan" },
    { label: "Ucapan", value: messages, icon: MessageCircle, note: "dari tamu" },
  ];
  const recentContent: RecentItem[] = [
    ...recentPhotos.map((item) => ({ id: item.id, kind: "Foto", label: "Foto kenangan", detail: "Tamu", createdAt: item.createdAt, icon: Camera })),
    ...recentVideos.map((item) => ({ id: item.id, kind: "Video", label: "Video guestbook", detail: "Tamu", createdAt: item.createdAt, icon: Video })),
    ...recentVoiceNotes.map((item) => ({ id: item.id, kind: "Voice", label: "Voice note", detail: "Tamu", createdAt: item.createdAt, icon: Mic })),
    ...recentMessages.map((item) => ({ id: item.id, kind: "Ucapan", label: item.content.slice(0, 42), detail: item.name ?? "Tamu", createdAt: item.createdAt, icon: MessageCircle })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
  const activity = [
    { label: "Foto", value: photos, icon: Camera, color: "bg-[#b99261]" },
    { label: "Video", value: videos, icon: Video, color: "bg-[#8f7865]" },
    { label: "Voice", value: voiceNotes, icon: Mic, color: "bg-[#c9a98a]" },
    { label: "Ucapan", value: messages, icon: MessageCircle, color: "bg-[#d8c2aa]" },
  ];
  const maxActivity = Math.max(...activity.map((item) => item.value), 1);

  return (
    <div className="min-h-screen">
      <header className="hidden items-center justify-between border-b border-[#ebe3db] bg-[#fffdfa]/90 px-5 py-4 sm:px-8 lg:flex lg:px-10">
        <div><p className="text-xs text-[#a59689]">Royal Moments / Workspace</p><p className="mt-1 text-sm font-semibold">Dashboard overview</p></div>
        <div className="flex items-center gap-3"><button aria-label="Notifikasi" className="grid h-10 w-10 place-items-center rounded-full border border-[#eadfd5] bg-white text-[#8e7a69]"><Bell size={17} /></button><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user.name ?? "Royal Admin"}</p><p className="text-[11px] text-[#a59689]">Administrator</p></div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#ead8c6] text-sm font-bold text-[#8b6749]">{(user.name ?? user.email).slice(0, 1).toUpperCase()}</span></div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm text-[#a77943]">Selamat datang di workspace 👋</p><h1 className="mt-2 font-serif text-4xl tracking-tight text-[#302b28] sm:text-5xl">Dashboard</h1><p className="mt-2 text-sm text-[#8e837b]">Kelola momen berharga dari satu tempat.</p></div>
          <Link href="/admin/events/new" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#302b28] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4a423d]"><Plus size={17} /> Event baru</Link>
        </header>

        <section className="mt-8 grid gap-5 xl:grid-cols-[1.55fr_0.45fr]">
          <div className="overflow-hidden rounded-[22px] border border-[#eadfd5] bg-[#fffdfa] shadow-[0_12px_35px_rgba(100,76,54,0.06)]">
            <div className="flex items-center justify-between border-b border-[#f0e9e2] px-5 py-4 sm:px-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a77943]">Event aktif</p><h2 className="mt-1 font-serif text-2xl">Momen yang sedang berjalan</h2></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] px-3 py-1.5 text-xs font-semibold text-[#4c8a5a]"><span className="h-1.5 w-1.5 rounded-full bg-[#5ea66a]" /> Live</span></div>
            {activeEvent ? <div className="grid md:grid-cols-[minmax(180px,0.75fr)_1.25fr]"><div className="min-h-[190px] bg-[#f0e2d4]">{activeEvent.coverImage ? <img src={storage.getFileUrl(activeEvent.coverImage)} alt={`Cover ${activeEvent.name}`} className="h-full min-h-[190px] w-full object-cover" /> : <div className="grid h-full min-h-[190px] place-items-center bg-[radial-gradient(circle_at_30%_20%,#fffaf3,#ead8c5)]"><Heart size={46} className="text-[#bd9870]" /></div>}</div><div className="flex flex-col justify-center p-5 sm:p-7"><h3 className="font-serif text-3xl text-[#302b28]">{activeEvent.name}</h3><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#81766d]"><span>{activeEvent.date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</span>{activeEvent.location && <span>{activeEvent.location}</span>}</div><p className="mt-4 text-sm leading-6 text-[#8e837b]">{activeEvent.description ?? "Tamu dapat mengirim kenangan dan ucapan untuk event ini."}</p><Link href={`/admin/events/${activeEvent.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#a77943]">Lihat event <ArrowUpRight size={15} /></Link></div></div> : <p className="p-7 text-sm text-[#8e837b]">Belum ada event aktif.</p>}
          </div>
          <div className="rounded-[22px] bg-[#302b28] p-6 text-white shadow-[0_12px_35px_rgba(48,43,40,0.12)]"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#dec09a]">Ringkasan</p><h2 className="mt-4 font-serif text-3xl leading-tight">Semua siap untuk momen baru.</h2><div className="mt-8 border-t border-white/15 pt-5"><p className="text-sm text-white/55">Total event</p><p className="mt-1 font-serif text-4xl">{events}</p></div></div>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{stats.map(({ label, value, icon: Icon, note }) => <div key={label} className="rounded-2xl border border-[#eadfd5] bg-[#fffdfa] p-4 shadow-[0_8px_24px_rgba(100,76,54,0.04)]"><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f5eadb] text-[#a77943]"><Icon size={17} /></span><span className="text-[10px] font-semibold uppercase tracking-wider text-[#a59689]">Live</span></div><p className="mt-5 text-xs font-medium text-[#978b81]">{label}</p><p className="mt-1 font-serif text-3xl">{value}</p><p className="mt-1 text-[11px] text-[#b0a39a]">{note}</p></div>)}</section>

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[22px] border border-[#eadfd5] bg-[#fffdfa] p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-serif text-2xl">Ringkasan Aktivitas</h2><p className="mt-1 text-sm text-[#978b81]">Total aktivitas tersimpan di seluruh event.</p></div><span className="rounded-lg border border-[#eadfd5] px-3 py-2 text-xs font-medium text-[#8e837b]">Semua waktu</span></div><div className="mt-7 space-y-4">{activity.map(({ label, value, icon: Icon, color }) => <div key={label} className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f6eee6] text-[#a77943]"><Icon size={15} /></span><span className="w-14 text-xs font-semibold text-[#756b64]">{label}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f2ece6]"><span className={`block h-full rounded-full ${color}`} style={{ width: `${Math.max((value / maxActivity) * 100, value ? 7 : 0)}%` }} /></div><strong className="w-8 text-right text-sm">{value}</strong></div>)}</div><div className="mt-7 flex flex-wrap gap-4 border-t border-[#f0e9e2] pt-4 text-[11px] text-[#978b81]">{activity.map(({ label, color }) => <span key={label} className="inline-flex items-center gap-1.5"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span>)}</div></div>
          <div className="rounded-[22px] border border-[#eadfd5] bg-[#fffdfa] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-serif text-2xl">Event terbaru</h2><p className="mt-1 text-sm text-[#978b81]">Event yang baru dibuat.</p></div><Link href="/admin/events" className="text-xs font-semibold text-[#a77943]">Lihat semua →</Link></div><div className="mt-5 divide-y divide-[#f0e9e2]">{recentEvents.length ? recentEvents.map((event) => <Link href={`/admin/events/${event.id}`} key={event.id} className="flex items-center justify-between gap-3 py-3 first:pt-0"><div className="min-w-0"><p className="truncate text-sm font-semibold">{event.name}</p><p className="mt-1 truncate text-xs text-[#a59689]">{event._count.photos} foto · {event._count.messages} ucapan</p></div><ArrowUpRight size={15} className="shrink-0 text-[#b9a28a]" /></Link>) : <p className="text-sm text-[#8e837b]">Belum ada event.</p>}</div></div>
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[22px] border border-[#eadfd5] bg-[#fffdfa] p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-serif text-2xl">Konten Terbaru</h2><p className="mt-1 text-sm text-[#978b81]">Aktivitas media dan ucapan terakhir.</p></div><Link href="/admin/photos" className="text-xs font-semibold text-[#a77943]">Lihat semua →</Link></div><div className="mt-5 divide-y divide-[#f0e9e2]">{recentContent.length ? recentContent.map(({ id, kind, label, detail, createdAt, icon: Icon }) => <div key={`${kind}-${id}`} className="flex items-center gap-3 py-3 first:pt-0"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f5eadb] text-[#a77943]"><Icon size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-[#a59689]">{kind} · {detail}</p></div><time className="shrink-0 text-[11px] text-[#b0a39a]">{createdAt.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</time></div>) : <p className="text-sm text-[#8e837b]">Belum ada konten terbaru.</p>}</div></div>
          <div className="rounded-[22px] border border-[#eadfd5] bg-[#fffdfa] p-5 sm:p-6"><h2 className="font-serif text-2xl">Aksi Cepat</h2><p className="mt-1 text-sm text-[#978b81]">Akses fitur yang paling sering digunakan.</p><div className="mt-5 grid grid-cols-2 gap-3">{[{ href: "/admin/photos", label: "Galeri Kenangan", icon: ImageIcon }, { href: "/admin/events", label: "Bagikan Link", icon: Share2 }, { href: "/admin/templates", label: "Template Frame", icon: LayoutTemplate }, { href: "/admin/events", label: "QR Code", icon: QrCode }, { href: "/admin/settings", label: "Pengaturan Event", icon: Settings }, { href: "/admin/messages", label: "Ucapan Tamu", icon: MessageCircle }].map(({ href, label, icon: Icon }) => <Link key={label} href={href} className="flex min-h-[76px] flex-col justify-between rounded-xl border border-[#eee6de] bg-[#fffdfa] p-3 transition hover:border-[#d5b68e] hover:bg-[#fcf4e9]"><Icon size={17} className="text-[#a77943]" /><span className="mt-2 text-xs font-semibold text-[#645a53]">{label} <span className="text-[#b99a76]">→</span></span></Link>)}</div></div>
        </section>

        <section className="mt-7 flex flex-col gap-4 rounded-[22px] border border-[#e7d0ae] bg-[#fbf1e3] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="font-serif text-2xl text-[#55463a]">Terus abadikan momen indah!</p><p className="mt-1 text-sm text-[#8e7660]">Bagikan link event Anda agar lebih banyak tamu dapat ikut berpartisipasi.</p></div><Link href="/admin/events" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#b99261] px-4 py-3 text-sm font-semibold text-white shadow-sm"><Share2 size={16} /> Bagikan Link</Link></section>
        <footer className="flex flex-col gap-2 py-7 text-xs text-[#a59689] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Royal Moments. All rights reserved.</span><div className="flex gap-4"><span>Privacy Policy</span><span>Terms of Service</span><span>Help Center</span></div></footer>
      </div>
    </div>
  );
}
