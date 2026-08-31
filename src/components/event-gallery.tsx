"use client";

/* Public gallery media uses storage URLs and native media elements. */
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Mic, Play, X } from "lucide-react";

type Photo = { id: string; url: string; createdAt: string };
type Video = { id: string; url: string; durationMs: number | null; createdAt: string };
type VoiceNote = { id: string; url: string; durationMs: number | null; createdAt: string };
type Message = { id: string; content: string; name: string | null; createdAt: string };
export type GalleryMemory = {
  id: string;
  eventId: string;
  guestSessionId: string | null;
  photos: Photo[];
  videos: Video[];
  voiceNotes: VoiceNote[];
  messages: Message[];
  createdAt: string;
  guestName: string | null;
};

type Props = { eventName: string; slug: string; initialFilter: string; memories: GalleryMemory[] };
const filters = [["all", "Semua"], ["photo", "Foto"], ["video", "Video"], ["voice", "Voice"], ["message", "Pesan"]] as const;

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
function duration(value?: number | null) {
  if (!value) return "00:00";
  return `${String(Math.floor(value / 60000)).padStart(2, "0")}:${String(Math.floor((value % 60000) / 1000)).padStart(2, "0")}`;
}
function hasType(memory: GalleryMemory, type: string) {
  if (type === "photo") return memory.photos.length > 0;
  if (type === "video") return memory.videos.length > 0;
  if (type === "voice") return memory.voiceNotes.length > 0;
  if (type === "message") return memory.messages.length > 0;
  return true;
}

export default function EventGallery({ eventName, slug, initialFilter, memories }: Props) {
  const [filter, setFilter] = useState(filters.some(([value]) => value === initialFilter) ? initialFilter : "all");
  const [selected, setSelected] = useState<GalleryMemory | null>(null);
  const visible = filter === "all" ? memories : memories.filter((memory) => hasType(memory, filter));
  const selectedIndex = selected ? visible.findIndex((memory) => memory.id === selected.id) : -1;
  const [photoIndex, setPhotoIndex] = useState(0);

  function chooseFilter(value: string) {
    setFilter(value);
    window.history.replaceState(null, "", `/event/${slug}/gallery${value === "all" ? "" : `?filter=${value}`}`);
  }
  function openMemory(memory: GalleryMemory) {
    setSelected(memory);
    setPhotoIndex(0);
  }
  function moveMemory(delta: number) {
    const next = visible[selectedIndex + delta];
    if (next) openMemory(next);
  }
  const activePhoto = selected && selected.photos.length ? selected.photos[photoIndex] : null;

  return <main className="relative min-h-screen overflow-hidden bg-[#f8f2ed] px-5 py-7 text-[#2b2927] sm:px-8 sm:py-10">
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true"><span className="absolute right-8 top-12 text-5xl text-[#c99a62]/20">❀</span><span className="absolute left-8 top-28 text-xl text-[#c99a62]/25">✦</span><span className="absolute bottom-20 left-5 text-5xl text-[#c99a62]/15">❀</span><div className="absolute right-10 bottom-24 h-24 w-24 rounded-full border border-[#c99a62]/15" /></div>
    <div className="relative z-10 mx-auto max-w-5xl">
      <a href={`/event/${slug}`} className="text-sm font-semibold text-[#957c6c]">← Kembali ke event</a>
      <header className="mt-8"><p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#957c6c]">Galeri kenangan</p><h1 className="mt-3 font-serif text-[clamp(2.8rem,10vw,5rem)] leading-none">{eventName.split(" & ").map((part, index) => <span key={part}>{index > 0 && <span className="text-[#c99a62]"> & </span>}{part}</span>)}</h1><p className="mt-4 text-sm text-[#8f837b]">Momen yang dibagikan oleh para tamu. 🤎</p></header>
      <nav className="mt-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{filters.map(([value, label]) => <button type="button" key={value} onClick={() => chooseFilter(value)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === value ? "border-[#2b2927] bg-[#2b2927] text-white" : "border-[#dec9b2] bg-[#fffaf6] text-[#6f5748]"}`}>{label}</button>)}</nav>
      <div className="mt-9 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Heart size={18} className="text-[#c99a62]" fill="currentColor" /><div><h2 className="font-serif text-2xl">Semua Kenangan</h2><p className="text-xs text-[#8f837b]">{visible.length} kenangan</p></div></div><span className="rounded-full border border-[#dec9b2] bg-[#fffaf6] px-3 py-2 text-xs font-semibold text-[#8f837b]">Terbaru</span></div>
      {visible.length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">{visible.map((memory) => {
        const photo = memory.photos[0];
        const video = memory.videos[0];
        return <button type="button" key={memory.id} onClick={() => openMemory(memory)} className="overflow-hidden rounded-[1.15rem] border border-[#eadfd8] bg-[#fffdf9] text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          {photo ? <img src={photo.url} alt={`Foto dari ${eventName}`} className="aspect-square w-full object-cover" /> : video ? <div className="relative aspect-square bg-[#332b27]"><video preload="metadata" muted playsInline src={video.url} className="h-full w-full object-cover opacity-80" /><span className="absolute inset-0 m-auto grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#5c4737]"><Play size={18} fill="currentColor" /></span><span className="absolute bottom-2 right-2 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white">{duration(video.durationMs)}</span></div> : <div className="flex aspect-square flex-col items-center justify-center bg-[#f3e7da] p-4 text-[#8c6e52]"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#fffaf6]">{memory.voiceNotes.length ? <Mic size={22} /> : <span className="text-3xl">“</span>}</span><p className="mt-3 line-clamp-4 text-center font-serif text-base">{memory.messages[0]?.content ?? "Voice Note"}</p></div>}
          <div className="border-t border-[#eee2d8] p-3"><p className="truncate text-xs font-semibold text-[#5c4737]">{memory.guestName || memory.messages[0]?.name || "Tamu undangan"} <span className="float-right text-[#c99a62]">♡</span></p><p className="mt-1 truncate text-[10px] text-[#9a8d84]">{dateLabel(memory.createdAt)}</p><div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold text-[#9a765c]">{memory.photos.length > 0 && <span>{memory.photos.length} Foto</span>}{memory.voiceNotes.length > 0 && <span>🎤 Voice</span>}{memory.messages.length > 0 && <span>💬 Pesan</span>}</div></div>
        </button>;
      })}</div> : <p className="mt-8 rounded-2xl border border-[#eadfd8] bg-white/80 p-10 text-center text-sm text-[#8f837b]">Belum ada kenangan yang dibagikan.</p>}
      <button type="button" className="mx-auto mt-8 block rounded-full border border-[#c99a62] bg-[#fffaf6] px-6 py-3 text-sm font-semibold text-[#6f5748]">Muat Lebih Banyak</button>
      <p className="mx-auto mt-5 max-w-md rounded-full border border-[#ead7bd] bg-[#fff8ef] px-4 py-3 text-center text-xs text-[#9b7658]">♡ Terima kasih telah berbagi momen indah bersama kami.</p>
    </div>
    {selected && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#211d1a]/95 p-5" onClick={() => setSelected(null)}>
      <div className="relative w-full max-w-3xl py-8" onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setSelected(null)} aria-label="Tutup" className="absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white"><X size={20} /></button>
        {activePhoto ? <img src={activePhoto.url} alt={`Foto dari ${eventName}`} className="mx-auto max-h-[58vh] max-w-full rounded-xl object-contain" /> : selected.videos[0] ? <video controls playsInline src={selected.videos[0].url} className="mx-auto max-h-[58vh] max-w-full rounded-xl bg-black" /> : <div className="mx-auto grid min-h-48 max-w-lg place-items-center rounded-xl bg-[#fff8ef] p-8 text-center text-[#5c4737]"><span className="font-serif text-2xl">{selected.messages[0]?.content ?? "Voice Note"}</span></div>}
        {selected.photos.length > 1 && <div className="mt-3 flex justify-center gap-2">{selected.photos.map((photo, index) => <button type="button" key={photo.id} onClick={() => setPhotoIndex(index)} className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${index === photoIndex ? "border-[#c99a62]" : "border-white/30"}`}><img src={photo.url} alt="" className="h-full w-full object-cover" /></button>)}</div>}
        {selected.voiceNotes.length > 0 && <div className="mt-5 rounded-2xl bg-[#fff8ef] p-5 text-[#5c4737]"><div className="flex items-center gap-3"><Mic className="text-[#c99a62]" /><strong>Voice Note</strong></div><audio controls src={selected.voiceNotes[0].url} className="mt-4 w-full" /></div>}
        {selected.messages.length > 0 && <div className="mt-4 rounded-2xl border border-[#dec9b2] bg-[#fffdf9] p-5 text-center text-[#5c4737]"><span className="text-4xl text-[#c99a62]">“</span><p className="mt-2 font-serif text-xl leading-8">{selected.messages[0].content}</p></div>}
        <div className="mt-4 text-center text-sm text-white/75"><p className="font-semibold">{selected.guestName || selected.messages[0]?.name || "Tamu undangan"}</p><p className="mt-1 text-xs">{dateLabel(selected.createdAt)}</p></div>
        {selectedIndex >= 0 && <><button type="button" onClick={() => moveMemory(-1)} disabled={selectedIndex <= 0} className="absolute left-0 top-1/2 grid h-11 w-11 -translate-x-2/3 place-items-center rounded-full bg-white/15 text-white disabled:invisible"><ChevronLeft /></button><button type="button" onClick={() => moveMemory(1)} disabled={selectedIndex >= visible.length - 1} className="absolute right-0 top-1/2 grid h-11 w-11 translate-x-2/3 place-items-center rounded-full bg-white/15 text-white disabled:invisible"><ChevronRight /></button></>}
      </div>
    </div>}
  </main>;
}
