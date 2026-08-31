"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  Camera,
  ChevronDown,
  Crown,
  FileHeart,
  Heart,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageCircle,
  QrCode,
  Settings,
  Share2,
  Sparkles,
  Video,
  X,
} from "lucide-react";

type AdminNavigationProps = {
  userName: string;
  userEmail: string;
};

const sections = [
  {
    label: "Event",
    links: [
      { href: "/admin/events", label: "Daftar Event", icon: CalendarDays },
      { href: "/admin/events", label: "Event Aktif", icon: Sparkles },
      { href: "/admin/events/new", label: "Buat Event Baru", icon: CalendarDays },
      { href: "/admin/events", label: "Pengaturan Event", icon: Settings },
    ],
  },
  {
    label: "Konten",
    links: [
      { href: "/admin/photos", label: "Galeri Kenangan", icon: LayoutTemplate },
      { href: "/admin/photos", label: "Foto", icon: Camera },
      { href: "/admin/videos", label: "Video", icon: Video },
      { href: "/admin/voice-notes", label: "Voice Note", icon: FileHeart },
      { href: "/admin/messages", label: "Ucapan", icon: MessageCircle },
    ],
  },
  {
    label: "Design",
    links: [
      { href: "/admin/templates", label: "Template Frame", icon: LayoutTemplate },
      { href: "/admin/templates", label: "Layout & Tampilan", icon: LayoutTemplate },
      { href: "/admin/settings", label: "Tema & Warna", icon: Sparkles },
    ],
  },
  {
    label: "Bagikan",
    links: [
      { href: "/admin/events", label: "Bagikan Link", icon: Share2 },
      { href: "/admin/events", label: "QR Code", icon: QrCode },
    ],
  },
  {
    label: "Pengaturan",
    links: [
      { href: "/admin/settings", label: "Umum", icon: Settings },
      { href: "/admin/settings", label: "Notifikasi", icon: Bell },
      { href: "/admin/settings", label: "Keamanan", icon: Settings },
      { href: "/admin/settings", label: "Backup Data", icon: FileHeart },
    ],
  },
];

const bottomLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Sparkles },
  { href: "/admin/events", label: "Event", icon: CalendarDays },
  { href: "/admin/photos", label: "Konten", icon: Camera },
  { href: "/admin/templates", label: "Design", icon: LayoutTemplate },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

function initials(name: string, email: string) {
  return (name || email).slice(0, 1).toUpperCase();
}

export default function AdminNavigation({ userName, userEmail }: AdminNavigationProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const adminName = userName || "Royal Admin";
  const avatar = initials(adminName, userEmail);

  const isActive = (href: string) => href === "/admin/dashboard" ? pathname === href : pathname.startsWith(href);
  const isMobileMenuActive = (href: string, label: string) => {
    const primaryLabels: Record<string, string> = {
      "/admin/dashboard": "Dashboard",
      "/admin/events": "Daftar Event",
      "/admin/events/new": "Buat Event Baru",
      "/admin/photos": "Galeri Kenangan",
      "/admin/videos": "Video",
      "/admin/voice-notes": "Voice Note",
      "/admin/messages": "Ucapan",
      "/admin/templates": "Template Frame",
      "/admin/settings": "Umum",
    };
    return isActive(href) && primaryLabels[href] === label;
  };
  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  return (
    <>
      <aside className="hidden w-[274px] shrink-0 border-r border-[#ebe3db] bg-[#fffdfa] px-5 py-6 lg:flex lg:flex-col">
        <Link href="/admin/dashboard" className="flex items-center gap-3 px-2">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#b99261] text-white shadow-sm"><Heart size={19} fill="currentColor" /></span>
          <span><strong className="block font-serif text-xl leading-none">Royal Moments</strong><small className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-[#a59689]">Digital Guestbook</small></span>
        </Link>
        <nav className="mt-8 space-y-6 overflow-y-auto pr-1">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive("/admin/dashboard") ? "bg-[#f5eadb] text-[#a77943]" : "text-[#786f68] hover:bg-[#faf3eb]"}`}><Sparkles size={17} /> Dashboard</Link>
          {sections.map((section) => <div key={section.label}><p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b0a196]">{section.label}</p><div className="mt-2 space-y-0.5">{section.links.map(({ href, label, icon: Icon }) => <Link key={`${section.label}-${label}`} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition ${isActive(href) ? "bg-[#faf3eb] text-[#a77943]" : "text-[#786f68] hover:bg-[#faf3eb] hover:text-[#a77943]"}`}><Icon size={16} strokeWidth={1.8} /> {label}</Link>)}</div></div>)}
        </nav>
        <div className="mt-6 rounded-2xl border border-[#ead8bd] bg-[#fbf1e3] p-4"><div className="flex items-center gap-2 text-[#a77943]"><Crown size={16} /><span className="text-xs font-bold uppercase tracking-[0.12em]">Premium Plan</span></div><p className="mt-2 text-xs leading-5 text-[#8e7660]">Kelola paket &amp; fitur</p><Link href="/admin/settings" className="mt-3 inline-flex text-xs font-semibold text-[#a77943]">Lihat pengaturan <span className="ml-1">→</span></Link></div>
        <div className="mt-5 border-t border-[#eee7df] pt-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#ead8c6] text-xs font-bold text-[#8b6749]">{avatar}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{adminName}</p><p className="truncate text-[11px] text-[#a3978e]">Administrator</p></div><ChevronDown size={15} className="ml-auto text-[#a3978e]" /></div><form action="/api/auth/logout" method="post" className="mt-3"><button className="flex items-center gap-2 text-xs font-semibold text-[#957c6c]"><LogOut size={14} /> Keluar</button></form></div>
      </aside>

      <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#ebe3db] bg-[#fffdfa]/95 px-4 shadow-[0_4px_16px_rgba(70,55,40,0.04)] backdrop-blur lg:hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Buka menu admin" className="grid h-11 w-11 place-items-center rounded-xl text-[#655a52]"><Menu size={22} /></button>
        <Link href="/admin/dashboard" className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#b99261] text-white"><Heart size={15} fill="currentColor" /></span><span className="font-serif text-base text-[#302b28]">Royal Moments</span></Link>
        <div className="flex items-center gap-1"><button type="button" aria-label="Notifikasi" className="grid h-11 w-11 place-items-center rounded-xl text-[#8e7a69]"><Bell size={18} /></button><span className="grid h-9 w-9 place-items-center rounded-full bg-[#ead8c6] text-xs font-bold text-[#8b6749]">{avatar}</span></div>
      </header>

      {drawerOpen && <>
        <button type="button" aria-label="Tutup menu admin" onClick={closeDrawer} className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden" />
        <aside role="dialog" aria-modal="true" aria-label="Menu admin" className="fixed inset-y-0 left-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[min(86vw,340px)] flex-col overflow-hidden rounded-r-[24px] border-r border-[#eee3d8] bg-[#fffdfa] shadow-[10px_0_35px_rgba(48,38,28,0.14)] lg:hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-[#f0e8e0] px-5 pb-4 pt-[calc(16px+env(safe-area-inset-top))]">
            <Link href="/admin/dashboard" onClick={closeDrawer} className="flex min-h-11 items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#b99261] text-white"><Heart size={16} fill="currentColor" /></span>
              <span><strong className="block font-serif text-lg leading-none text-[#302b28]">Royal Moments</strong><small className="mt-1 block text-[9px] uppercase tracking-[0.18em] text-[#a59689]">Digital Guestbook</small></span>
            </Link>
            <button type="button" onClick={closeDrawer} aria-label="Tutup drawer" className="grid h-11 w-11 place-items-center rounded-xl text-[#786f68] transition hover:bg-[#faf3eb] active:bg-[#f5eadb]"><X size={20} /></button>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4" aria-label="Navigasi admin">
            <Link href="/admin/dashboard" onClick={closeDrawer} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${isMobileMenuActive("/admin/dashboard", "Dashboard") ? "bg-[#f5eadb] text-[#a77943]" : "text-[#786f68] hover:bg-[#fcf7f1]"}`}><Sparkles size={18} /> Dashboard</Link>
            {sections.map((section) => <div key={section.label} className="mt-5 border-t border-[#f1e9e2] pt-4"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b0a196]">{section.label}</p><div className="mt-2 space-y-0.5">{section.links.map(({ href, label, icon: Icon }) => <Link key={`${section.label}-${label}`} href={href} onClick={closeDrawer} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${isMobileMenuActive(href, label) ? "bg-[#f5eadb] text-[#a77943]" : "text-[#786f68] hover:bg-[#fcf7f1] active:bg-[#faf0e5]"}`}><Icon size={19} strokeWidth={1.8} /> <span className="flex-1">{label}</span>{label === "Event Aktif" && <span className="rounded-full bg-[#eaf5ed] px-2 py-1 text-[10px] font-semibold text-[#4c8a5a]">Live</span>}</Link>)}</div></div>)}
          </nav>
          <div className="shrink-0 border-t border-[#eee7df] bg-[#fffdfa] px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4">
            <Link href="/admin/settings" onClick={closeDrawer} className="flex min-h-11 items-center justify-between rounded-2xl border border-[#ead8bd] bg-[#fbf1e3] px-4 transition hover:bg-[#f8ead8] active:bg-[#f5e2c9]"><span><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#a77943]"><Crown size={16} /> Premium Plan</span><span className="mt-1 block text-xs text-[#8e7660]">Kelola paket &amp; fitur</span></span><span className="text-lg text-[#a77943]">→</span></Link>
            <form action="/api/auth/logout" method="post" className="mt-2"><button className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#786f68] transition hover:bg-[#fcf7f1] active:bg-[#faf0e5]"><LogOut size={17} /> Keluar</button></form>
          </div>
        </aside>
      </>}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e9dfd6] bg-[#fffdfa]/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_24px_rgba(70,55,40,0.08)] backdrop-blur lg:hidden"><div className="mx-auto flex max-w-md items-center justify-around">{bottomLinks.map(({ href, label, icon: Icon }) => <Link key={label} href={href} className={`flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold ${isActive(href) ? "text-[#a77943]" : "text-[#95887e]"}`}><Icon size={18} strokeWidth={isActive(href) ? 2.2 : 1.8} /><span className="truncate">{label}</span></Link>)}</div></nav>
    </>
  );
}
