"use client";

/* Event assets are administrator-configured external URLs. */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Camera, Heart, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import type { GuestExperienceProps } from "@/components/photobooth/guest-experience";

type Props = Pick<GuestExperienceProps, "eventId" | "eventName" | "coverImage" | "logo" | "description" | "primaryColor" | "secondaryColor">;

export default function PhotoBoothHome({ eventId, eventName, coverImage, logo, primaryColor, secondaryColor }: Props) {
  return (
    <main
      className="min-h-[100svh] min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#f7f1e9] text-[#252321]"
      style={{ "--home-primary": primaryColor || "#252321", "--home-accent": secondaryColor || "#c99a62" } as CSSProperties}
    >
      <div className="mx-auto flex min-h-[100svh] min-h-[100dvh] w-full max-w-lg flex-col px-6 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(22px+env(safe-area-inset-top))]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-4 rounded-[2rem] border border-[#b98b5a]/20" />
          <span className="absolute left-4 top-4 h-16 w-16 border-l border-t border-[#b98b5a]/40" />
          <span className="absolute right-4 top-4 h-16 w-16 border-r border-t border-[#b98b5a]/40" />
          <span className="absolute bottom-4 left-4 h-16 w-16 border-b border-l border-[#b98b5a]/40" />
          <span className="absolute bottom-4 right-4 h-16 w-16 border-b border-r border-[#b98b5a]/40" />
          <div className="absolute left-1/2 top-[43%] h-[42%] w-[72%] -translate-x-1/2 rounded-[50%] border border-[#c99a62]/15" />
          <div className="absolute inset-0 opacity-[.055] [background-image:radial-gradient(#6f5b4f_0.6px,transparent_0.6px)] [background-size:8px_8px]" />
          <span className="absolute left-[19%] top-[44%] text-xs text-[#c99a62]/45">✦</span>
          <span className="absolute right-[18%] top-[50%] text-[10px] text-[#c99a62]/40">✦</span>
          <span className="absolute left-[12%] bottom-[22%] text-sm text-[#c99a62]/35">·</span>
          <span className="absolute right-[13%] bottom-[25%] text-sm text-[#c99a62]/35">·</span>
          <div className="absolute -right-10 top-10 h-36 w-36 rotate-12 rounded-full border border-[#c99a62]/20" />
          <div className="absolute right-5 top-16 h-24 w-12 rotate-[35deg] rounded-[100%] border-l border-[#b99a72]/35" />
          <span className="absolute right-10 top-12 text-5xl text-[#d8b68a]/30">❀</span>
          <span className="absolute right-24 top-24 text-2xl text-[#b99a72]/25">❀</span>
          <span className="absolute bottom-8 left-5 text-5xl text-[#d8b68a]/25">❀</span>
          <span className="absolute bottom-14 right-6 text-4xl text-[#d8b68a]/20">❀</span>
        </div>
        <header className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[#252321]">
          {logo ? <img src={logo} alt="Momen Kita" className="h-8 max-w-32 object-contain" /> : <><Heart size={16} fill="currentColor" className="text-[#c99a62]" /> Momen Kita</>}
        </header>

        <section className="flex min-h-0 flex-1 flex-col justify-center py-5">
          <div className="text-center">
            <p className="font-serif text-[clamp(2.3rem,10vw,3.8rem)] italic leading-none text-[#837b74]">Abadikan</p>
            <h1 className="mt-1 font-serif text-[clamp(3.8rem,17vw,6rem)] leading-[.8] tracking-[.08em] text-[#252321]">MOMENT</h1>
            <p className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c99a62]"><Sparkles size={13} /> Bersama Kami</p>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#837b74]">Ambil foto terbaikmu dan jadi bagian dari cerita spesial hari ini.</p>
            <div className="mx-auto mt-4 flex max-w-[180px] items-center gap-2 text-[#c99a62]"><span className="h-px flex-1 bg-[#c99a62]/45" /><span className="text-xs">♥</span><span className="h-px flex-1 bg-[#c99a62]/45" /></div>
          </div>

          <div className="relative mx-auto mt-5 aspect-[4/3] w-full max-w-[360px]">
            <div className="absolute left-0 top-1 w-[clamp(58px,18vw,82px)] -rotate-[9deg] rounded-[3px] border border-[#ded3c8] bg-[#fffdfb] p-1.5 shadow-lg shadow-[#8d7565]/15">
              <div className="aspect-square overflow-hidden bg-[#e8d8cc]">{coverImage ? <img src={coverImage} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-[linear-gradient(135deg,#ead8c9,#f6ece3)]" />}</div>
              <p className="py-1 text-center text-[7px] font-semibold tracking-wide text-[#837b74]">Momen Kita</p>
            </div>
            <div className="absolute bottom-0 left-2 w-[clamp(58px,18vw,78px)] rotate-[6deg] rounded-[3px] border border-[#ded3c8] bg-[#fffdfb] p-1.5 shadow-lg shadow-[#8d7565]/15">
              <div className="aspect-square overflow-hidden bg-[#d9c1b4]"><div className="h-full w-full bg-[linear-gradient(145deg,#c9a898,#f0dfd4)]" /></div>
              <p className="py-1 text-center text-[7px] font-semibold tracking-wide text-[#837b74]">08.08.2026</p>
            </div>
            <div className="absolute right-0 top-5 w-[clamp(58px,18vw,78px)] rotate-[7deg] rounded-[3px] border border-[#ded3c8] bg-[#fffdfb] p-1.5 shadow-lg shadow-[#8d7565]/15">
              <div className="aspect-square overflow-hidden bg-[#ead8c9]"><div className="h-full w-full bg-[linear-gradient(35deg,#d9b9a8,#f5e7dc)]" /></div>
              <p className="py-1 text-center text-[7px] font-semibold tracking-wide text-[#837b74]">Momen Kita</p>
            </div>
            <div className="absolute -right-1 bottom-0 w-[clamp(42px,13vw,58px)] rotate-[-5deg] rounded-[3px] border border-[#ded3c8] bg-[#fffdfb] p-1.5 shadow-md shadow-[#8d7565]/15">
              <div className="space-y-1 bg-[#e5d2c5] p-1"><span className="block aspect-[4/3] bg-[#c7a99a]" /><span className="block aspect-[4/3] bg-[#f1ddd0]" /><span className="block aspect-[4/3] bg-[#b98e7d]" /></div>
            </div>
            <div className="absolute inset-x-7 inset-y-2 z-10 rotate-[-4deg] rounded-[1.25rem] border border-[#c99a62]/50 bg-white p-3 shadow-xl shadow-[#8d7565]/15">
              <div className="relative h-full overflow-hidden rounded-lg bg-[#efe2d7]">
                {coverImage ? <img src={coverImage} alt={`Momen ${eventName}`} className="h-full w-full object-cover object-center" /> : <div className="absolute inset-0 bg-[linear-gradient(135deg,#ead8c9,#f8eee5_48%,#d5b49f)]"><div className="absolute inset-5 border border-white/70" /><div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 text-white"><Camera size={24} /></div><p className="absolute bottom-5 inset-x-0 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">Photo booth</p></div>}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#252321]/75 to-transparent px-4 pb-3 pt-10 text-center text-white"><p className="font-serif text-lg">{eventName}</p><p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-white/75">Momen untuk dikenang</p></div>
              </div>
            </div>
            <div className="absolute -bottom-1 right-3 grid h-14 w-14 rotate-[8deg] place-items-center rounded-xl border border-[#c99a62]/50 bg-[#f3e7da] text-[#252321] shadow-lg"><Camera size={25} /><span className="sr-only">Photo booth camera</span></div>
          </div>
        </section>

        <div className="text-center">
          <Link href={`/event/${encodeURIComponent(eventId)}?start=media`} className="mx-auto flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#c99a62] px-6 text-base font-semibold text-[#252321] shadow-lg shadow-[#8d7565]/20 transition hover:bg-[#b88650] active:scale-[.98]"><Camera size={18} /> Ambil Foto Sekarang <span aria-hidden="true">→</span></Link>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[#837b74]">Yuk, abadikan momen serunya!</p>
          <p className="mx-auto mt-5 max-w-xs font-serif text-base italic leading-6 text-[#837b74]">Terima kasih telah menjadi bagian<br />dari hari istimewa kami</p>
          <p className="mt-1 text-sm text-[#c99a62]">♥</p>
        </div>
      </div>
    </main>
  );
}
