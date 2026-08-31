"use client";

/* Event cover and logo URLs are administrator-configured external assets. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type CSSProperties, type UIEvent } from "react";
import { ArrowRight, Camera, ChevronRight, Heart, Mic, Pencil, Sparkles, Video } from "lucide-react";
import Link from "next/link";
import PhotoSession, { type CapturedPhoto } from "./photo-session";
import GuestMediaPanel, { type GuestMediaItem, type GuestMediaRecording } from "./guest-media-panel";
import { GuestButton, SelectedMark } from "./guest-ui";
import { PhotoPreview, type PreviewTemplate } from "./photo-preview";

export type GuestMode = "photo" | "video" | "voice" | "text";
type Step = "invitation" | "main-choice" | "frame" | "video-mode" | "memory" | "photo" | "media" | "done";
export type GuestExperienceProps = {
  eventId: string; eventName: string; eventDate: string; location?: string | null;
  description?: string | null; coverImage?: string | null; logo?: string | null;
  primaryColor?: string | null; secondaryColor?: string | null;
  defaultPhotoCount: number; allowVideo: boolean; videoDuration: number;
  templateId?: string | null;
  frames: PreviewTemplate[];
  allowVoiceNote: boolean; voiceNoteDuration: number; allowMessage: boolean;
  initialStep?: Step;
};

const FRAME_SAMPLE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23d8b9a8'/%3E%3Cstop offset='.52' stop-color='%23f1ded1'/%3E%3Cstop offset='1' stop-color='%238e6f63'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='1000' fill='url(%23g)'/%3E%3Cellipse cx='250' cy='430' rx='150' ry='220' fill='%23f8eee8' fill-opacity='.72'/%3E%3Cellipse cx='560' cy='400' rx='160' ry='240' fill='%232b2927' fill-opacity='.2'/%3E%3Ccircle cx='350' cy='260' r='115' fill='%23fff8f3' fill-opacity='.55'/%3E%3C/svg%3E";

export default function GuestExperience(props: GuestExperienceProps) {
  const [step, setStep] = useState<Step>(props.initialStep ?? "invitation");
  const [mainMode, setMainMode] = useState<"photo" | "video" | null>(null);
  const [photoCount, setPhotoCount] = useState(Math.min(4, Math.max(1, props.defaultPhotoCount)));
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingPhotos, setPendingPhotos] = useState<CapturedPhoto[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState(props.templateId);
  const [memoryText, setMemoryText] = useState("");
  const [memoryRecording, setMemoryRecording] = useState<GuestMediaRecording | null>(null);
  const [memoryRecordingActive, setMemoryRecordingActive] = useState(false);
  const [memorySeconds, setMemorySeconds] = useState(0);
  const memoryRecorderRef = useRef<MediaRecorder | null>(null);
  const memoryStreamRef = useRef<MediaStream | null>(null);
  const memoryChunksRef = useRef<Blob[]>([]);
  const memoryStartedRef = useRef(0);
  const memoryTimerRef = useRef<number | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const frameCarouselRef = useRef<HTMLDivElement>(null);
  const style = { "--primary": props.primaryColor || "#2b2927", "--secondary": props.secondaryColor || "#e6cdbd" } as CSSProperties;

  async function createSession() {
    if (sessionId) return sessionId;
    const response = await fetch(`/api/events/${props.eventId}/sessions`, { method: "POST" });
    if (!response.ok) throw new Error("Sesi gagal dibuat.");
    const session = (await response.json()) as { id: string };
    setSessionId(session.id);
    return session.id;
  }
  async function beginMainChoice() {
    if (!mainMode || starting) return;
    setStarting(true);
    try { await createSession(); setStep(mainMode === "photo" ? "frame" : "video-mode"); }
    catch { setError("Sesi belum siap. Periksa koneksi lalu coba lagi."); }
    finally { setStarting(false); }
  }
  function goToMemory() { setStep("memory"); }
  useEffect(() => () => {
    if (memoryTimerRef.current) window.clearInterval(memoryTimerRef.current);
    memoryStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (memoryRecording) URL.revokeObjectURL(memoryRecording.url);
  }, [memoryRecording]);
  function startMemoryRecording() {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return;
    const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
    if (!mimeType) return;
    void navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      memoryStreamRef.current = stream;
      memoryChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      memoryRecorderRef.current = recorder;
      memoryStartedRef.current = Date.now();
      setMemoryRecordingActive(true);
      setMemorySeconds(0);
      recorder.ondataavailable = (event) => { if (event.data.size) memoryChunksRef.current.push(event.data); };
      recorder.onstop = () => {
        if (memoryTimerRef.current) window.clearInterval(memoryTimerRef.current);
        stream.getTracks().forEach((track) => track.stop());
        memoryStreamRef.current = null;
        memoryRecorderRef.current = null;
        setMemoryRecordingActive(false);
        const durationMs = Math.max(1, Date.now() - memoryStartedRef.current);
        const blob = new Blob(memoryChunksRef.current, { type: mimeType });
        setMemoryRecording((current) => {
          if (current) URL.revokeObjectURL(current.url);
          return { mode: "voice", blob, mimeType, durationMs, url: URL.createObjectURL(blob) };
        });
      };
      recorder.start(250);
      memoryTimerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - memoryStartedRef.current) / 1000);
        setMemorySeconds(elapsed);
        if (elapsed >= props.voiceNoteDuration && recorder.state === "recording") recorder.stop();
      }, 250);
    }).catch(() => undefined);
  }
  function stopMemoryRecording() {
    if (memoryRecorderRef.current?.state === "recording") memoryRecorderRef.current.stop();
  }
  function continueMemory() {
    const items: GuestMediaItem[] = [];
    if (memoryRecording) items.push({ mode: "voice", recording: memoryRecording });
    if (memoryText.trim()) items.push({ mode: "text", text: memoryText.trim() });
    setStep("media");
  }
  function selectFrame(frameId: string) {
    setSelectedFrameId(frameId);
    frameCarouselRef.current?.querySelector<HTMLElement>(`[data-frame-id="${frameId}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }
  function syncFrameFromScroll(event: UIEvent<HTMLDivElement>) {
    const container = event.currentTarget;
    const center = container.scrollLeft + container.clientWidth / 2;
    let closestId = "";
    let closestDistance = Number.POSITIVE_INFINITY;
    container.querySelectorAll<HTMLElement>("[data-frame-id]").forEach((card) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestId = card.dataset.frameId ?? "";
      }
    });
    if (closestId) setSelectedFrameId(closestId);
  }
  const memoryItems: GuestMediaItem[] = [
    ...(memoryRecording ? [{ mode: "voice" as const, recording: memoryRecording }] : []),
    ...(memoryText.trim() ? [{ mode: "text" as const, text: memoryText.trim() }] : []),
  ];
  const optionalModes = memoryItems.map((item) => item.mode);
  const mediaModes = mainMode === "video" ? ["video", ...optionalModes] as ("video" | "voice" | "text")[] : optionalModes;

  if (step === "photo") return <PhotoSession {...props} defaultPhotoCount={photoCount} selectedTemplate={props.frames.find((frame) => frame.id === selectedFrameId) ?? null} sessionId={sessionId} onSessionCreated={setSessionId} onBack={() => setStep("frame")} onComplete={(id, photos) => { setSessionId(id); setPendingPhotos(photos); setStep("memory"); }} />;
  if (step === "media") return <GuestMediaPanel {...props} selectedModes={mediaModes} initialItems={memoryItems} startInReview={mainMode === "photo"} pendingPhotos={pendingPhotos} selectedFrameId={selectedFrameId} selectedTemplate={props.frames.find((frame) => frame.id === selectedFrameId) ?? null} sessionId={sessionId} onBack={() => setStep(mainMode === "video" ? "video-mode" : "memory")} />;
  if (step === "done") return <main className="grid min-h-screen place-items-center bg-[#f8f2ed] px-6 text-[#2b2927]"><div className="w-full max-w-md text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#2b2927] text-[#e6cdbd]"><Heart size={28} fill="currentColor" /></span><h1 className="mt-7 font-serif text-5xl">Terima kasih</h1><p className="mt-4 text-sm leading-7 text-[#756d67]">Kenanganmu sudah tersimpan.</p>  <div className="mt-8 grid gap-3"><Link href={`/event/${props.eventId}/gallery`} className="rounded-2xl bg-[#2b2927] px-5 py-4 text-sm font-semibold text-white">Lihat Galeri Kenangan</Link><GuestButton type="button" variant="secondary" onClick={() => { setStep("invitation"); setMainMode(null); setMemoryText(""); setMemoryRecording(null); setSessionId(null); }} className="w-full">Kembali ke Undangan</GuestButton></div></div></main>;

  if (step === "invitation") return <main className="relative min-h-[100svh] min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#f7f1e9] text-[#252321]" style={{ ...style, minHeight: "100svh" }}>{props.coverImage ? <img src={props.coverImage} alt={`Foto ${props.eventName}`} className="absolute inset-0 h-full w-full object-cover object-[center_32%]" /> : <div className="absolute inset-0 bg-[#f7f1e9]"><div className="absolute left-7 top-24 h-20 w-20 border-l border-t border-[#c99a62]/45" /><div className="absolute right-7 top-28 h-20 w-20 border-r border-t border-[#c99a62]/35" /><div className="absolute bottom-20 left-8 h-16 w-16 border-b border-l border-[#c99a62]/35" /><div className="absolute bottom-16 right-8 h-16 w-16 border-b border-r border-[#c99a62]/35" /><div className="absolute left-1/2 top-1/2 h-px w-24 -translate-x-1/2 bg-[#c99a62]/25" /></div>}<div className={`absolute inset-0 ${props.coverImage ? "bg-[radial-gradient(circle_at_18%_18%,rgba(255,241,220,.42),transparent_30%),linear-gradient(180deg,rgba(37,35,33,.12),rgba(37,35,33,.04)_34%,rgba(37,35,33,.86))]" : "bg-[linear-gradient(180deg,rgba(247,241,233,.08),rgba(247,241,233,.18)_45%,rgba(37,35,33,.72))]"}`} />  <div className="relative mx-auto flex min-h-[100svh] min-h-[100dvh] max-w-lg flex-col justify-between px-6 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(24px+env(safe-area-inset-top))] text-white sm:px-10"><header className="flex items-center gap-2 text-sm font-semibold tracking-wide">{props.logo ? <img src={props.logo} alt="Momen Kita" className="h-8 max-w-32 object-contain" /> : <><Heart size={16} fill="currentColor" className="text-[#e7c18e]" /> Momen Kita</>}</header><div className="pb-0"><p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#f1d6ad] sm:tracking-[0.3em]"><Sparkles size={13} /> Undangan digital</p><h1 className="mt-3 max-w-xs font-serif text-[clamp(48px,13vw,72px)] leading-[.9] tracking-[-.04em] sm:mt-4">{props.eventName}</h1><p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 sm:mt-6 sm:tracking-[0.22em]">{props.eventDate}{props.location && ` · ${props.location}`}</p>{props.description && <p className="mt-3 max-w-xs whitespace-pre-line text-[15px] leading-[1.5] text-white/85 sm:mt-4">{props.description}</p>}<button type="button" onClick={() => setStep("main-choice")} className="mx-auto mt-5 flex h-[56px] w-[calc(100%-3rem)] max-w-[520px] items-center justify-center gap-2 rounded-full border-0 bg-[#c99a62] px-6 text-base font-semibold text-[#252321] shadow-lg shadow-black/25 transition hover:bg-[#b88650] active:scale-[.98] sm:mt-7"><Heart size={17} fill="currentColor" /> <span>Mulai</span> <ArrowRight size={19} /></button></div></div></main>;

  if (step === "main-choice") return <main className="relative min-h-[100svh] min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#f7f1e9] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4 text-[#252321] sm:px-6 sm:py-6"><div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true"><div className="absolute inset-4 rounded-[2rem] border border-[#c99a62]/15" /><span className="absolute left-5 top-24 h-12 w-12 border-l border-t border-[#c99a62]/20" /><span className="absolute right-5 top-28 h-12 w-12 border-r border-t border-[#c99a62]/20" /><span className="absolute bottom-20 left-5 h-12 w-12 border-b border-l border-[#c99a62]/20" /><span className="absolute bottom-16 right-5 h-12 w-12 border-b border-r border-[#c99a62]/20" /><span className="absolute left-[18%] top-[38%] text-[10px] text-[#c99a62]/35">✦</span><span className="absolute right-[16%] top-[54%] text-[10px] text-[#c99a62]/35">✦</span><div className="absolute inset-0 opacity-[.035] [background-image:radial-gradient(#8d7565_0.6px,transparent_0.6px)] [background-size:9px_9px]" /></div><div className="guest-fade relative z-10 mx-auto flex max-w-lg flex-col"><button type="button" onClick={() => setStep("invitation")} aria-label="Kembali ke undangan" className="grid h-10 w-10 place-items-center rounded-full border border-[#ded3c8] bg-white/90 text-[#6f5b4f] shadow-sm transition active:scale-95">←</button><div className="mt-6 text-center sm:mt-8"><p className="font-serif text-4xl italic leading-none text-[#837b74]">Abadikan</p><h1 className="mt-1 font-serif text-6xl leading-[.8] tracking-[.04em] text-[#252321]">MOMEN</h1><p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c99a62]">♥ Bersama Kami ♥</p><p className="mx-auto mt-3 max-w-xs text-[15px] leading-[1.5] text-[#837b74]">Pilih cara terbaik untuk berbagi<br />momen dan ucapanmu.</p></div><div className="mt-6 grid gap-3 sm:mt-8">{[{ value: "photo" as const, icon: Camera, title: "Foto", text: "Ambil beberapa foto seru dengan frame photo booth" }, ...(props.allowVideo ? [{ value: "video" as const, icon: Video, title: "Video", text: "Rekam video, boomerang atau foto live dengan momen terbaikmu" }] : [])].map((item) => { const Icon = item.icon; const selected = mainMode === item.value; return <button type="button" key={item.value} onClick={() => setMainMode(item.value)} className={`relative z-10 flex min-h-[120px] items-center gap-4 overflow-hidden rounded-[1.5rem] border p-4 text-left shadow-sm transition active:scale-[.98] sm:min-h-[132px] sm:p-5 ${selected ? "border-[#c99a62] bg-[#fff4e7] text-[#252321] shadow-md" : "border-[#ded3c8] bg-white/95"}`}><span className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${selected ? "bg-[#e4c08f] text-[#252321]" : "bg-[#f3e7da] text-[#9b7658]"}`}><Icon size={24} /></span><span className="min-w-0 flex-1"><strong className="block text-lg">{item.title}</strong><small className={`mt-1 block max-w-[230px] leading-6 ${selected ? "text-[#837b74]" : "text-[#837b74]"}`}>{item.text}</small></span><ChevronRight className={selected ? "text-[#e7c18e]" : "text-[#b6a59a]"} /></button>; })}</div>{error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<GuestButton type="button" disabled={!mainMode || starting} onClick={() => void beginMainChoice()} className="relative z-10 mt-6 flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#c99a62] text-[#252321] shadow-lg shadow-[#8d7565]/20 hover:bg-[#b88650]">{starting ? "Menyiapkan..." : "Lanjut"} <ArrowRight size={18} /></GuestButton></div></main>;

  if (step === "frame") {
    const selectedTemplate = props.frames.find((frame) => frame.id === selectedFrameId) ?? props.frames[0] ?? null;
    return <main className="relative min-h-[100svh] min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#f8f2ed] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5 text-[#2b2927] sm:px-6 sm:pt-8">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-16 -top-12 h-40 w-40 rounded-full border border-[#c99a62]/15" />
        <div className="absolute -left-10 bottom-20 h-32 w-32 rounded-full border border-[#c99a62]/10" />
        <span className="absolute right-[14%] top-[18%] text-xs text-[#c99a62]/35">✦</span>
        <span className="absolute left-[12%] bottom-[30%] text-[10px] text-[#c99a62]/30">✦</span>
        <div className="absolute inset-0 opacity-[.035] [background-image:radial-gradient(#8d7565_0.6px,transparent_0.6px)] [background-size:10px_10px]" />
      </div>
      <div className="guest-fade relative z-10 mx-auto flex max-w-lg flex-col">
        <button type="button" onClick={() => setStep("main-choice")} aria-label="Kembali ke pilihan media" className="grid h-10 w-10 place-items-center rounded-full border border-[#ded3c8] bg-white/90 text-[#6f5b4f] shadow-sm transition active:scale-95">←</button>
        <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#957c6c]">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#c99a62] text-[#2b2927] shadow-sm">1</span><span className="h-px flex-1 bg-[#d8c8be]" /><span className="grid h-8 w-8 place-items-center rounded-full border border-[#d8c8be] bg-[#fffaf6] text-[#a49388]">2</span><span className="h-px flex-1 bg-[#d8c8be]" /><span className="grid h-8 w-8 place-items-center rounded-full border border-[#d8c8be] bg-[#fffaf6] text-[#a49388]">3</span>
        </div>
        <div className="mt-6"><h1 className="font-serif text-5xl leading-none sm:text-6xl">Foto</h1><p className="mt-2 text-sm leading-6 text-[#756d67]">Pilih frame photo booth favoritmu.</p></div>
        <section className="mt-6 rounded-[1.5rem] border border-[#dec9b2] bg-white/90 py-4 shadow-lg shadow-[#8d7565]/10 sm:py-5">
          <div ref={frameCarouselRef} onScroll={syncFrameFromScroll} className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[calc((100%-190px)/2)] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Pilihan frame photo booth">
            {props.frames.length ? props.frames.map((frame) => <button type="button" key={frame.id} data-frame-id={frame.id} onClick={() => selectFrame(frame.id)} className={`w-[190px] shrink-0 snap-center rounded-[1rem] border-2 bg-[#fffaf6] p-2 text-left transition-transform duration-200 active:scale-[.98] ${selectedFrameId === frame.id ? "scale-100 border-[#c99a62] shadow-lg shadow-[#8d7565]/15" : "scale-90 border-[#e5dbd4] opacity-70"}`}><PhotoPreview photoUrl={props.coverImage ?? FRAME_SAMPLE} template={frame} eventName={props.eventName} eventDate={props.eventDate} location={props.location} /><span className="mt-2 block truncate text-center text-xs font-semibold text-[#756d67]">{frame.name}</span></button>) : <p className="px-5 text-sm text-[#8f837b]">Frame standar wedding akan digunakan.</p>}
          </div>
          {props.frames.length > 0 && <div className="mt-3 flex justify-center gap-1.5">{props.frames.map((frame) => <button type="button" key={frame.id} onClick={() => selectFrame(frame.id)} aria-label={`Pilih frame ${frame.name}`} className={`h-2 w-2 rounded-full transition ${selectedFrameId === frame.id ? "bg-[#c99a62] ring-2 ring-[#c99a62]/20" : "bg-[#d8c8be]"}`} />)}</div>}
          <div className="mt-4 border-t border-[#eee2d8] px-4 pt-4 text-center sm:px-5 sm:text-left"><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c99a62]">Frame pilihan</p><h2 className="mt-1 font-serif text-2xl leading-tight">{selectedTemplate?.name ?? "Warm Editorial"}</h2><div className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-[#8c6e52] sm:justify-start"><SelectedMark /> Dipilih</div><p className="mt-2 text-xs leading-5 text-[#8f837b]">Desain minimalis dengan nuansa hangat dan elegan.</p></div>
        </section>
        <section className="mt-5 rounded-[1.5rem] border border-[#e5dbd4] bg-white/90 p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-serif text-2xl">Jumlah foto</h2><p className="mt-1 text-xs text-[#8f837b]">Pilih jumlah momen yang ingin kamu abadikan.</p></div>
            <span className="text-lg text-[#c99a62]" aria-hidden="true">✧</span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">{[1, 2, 3, 4].map((count) => <button type="button" key={count} onClick={() => setPhotoCount(count)} aria-pressed={photoCount === count} className={`min-h-11 rounded-xl border text-sm font-semibold transition active:scale-95 ${photoCount === count ? "border-[#c99a62] bg-[#e4c08f] text-[#2b2927] shadow-sm" : "border-[#e5dbd4] bg-[#fbfaf8] text-[#756d67]"}`}>{count} foto</button>)}</div>
          <p className="mt-4 flex items-center gap-2 text-xs text-[#a07d58]"><span aria-hidden="true">💡</span> Rekomendasi: 3 foto untuk tampilan terbaik</p>
        </section>
        <GuestButton type="button" onClick={() => setStep("photo")} className="mt-5 flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#c99a62] text-[#2b2927] shadow-lg shadow-[#8d7565]/20 hover:bg-[#b88650]"><Camera size={18} /> Lanjut ke kamera <ArrowRight size={18} /></GuestButton>
      </div>
    </main>;
  }

  if (step === "video-mode") return <main className="min-h-screen bg-[#151413] px-5 py-10 text-white"><div className="guest-fade mx-auto max-w-lg"><button type="button" onClick={() => setStep("main-choice")} className="text-sm font-semibold text-[#e6cdbd]">← Kembali</button><p className="mt-10 text-xs font-semibold uppercase tracking-[0.24em] text-[#e6cdbd]">Video guestbook</p><h1 className="mt-4 font-serif text-5xl">Abadikan cerita</h1><p className="mt-4 text-sm leading-7 text-white/65">Rekam pesan singkat dengan kamera dan mikrofon.</p><div className="mt-9 grid gap-3"><button type="button" className="rounded-2xl border border-[#e6cdbd] bg-white/10 p-5 text-left"><strong className="block text-lg">Video biasa</strong><span className="mt-1 block text-sm text-white/55">Rekam video hingga {props.videoDuration} detik dengan suara.</span><span className="mt-3 inline-flex rounded-full bg-[#e6cdbd]/20 px-3 py-1 text-xs font-semibold text-[#e6cdbd]">Tersedia</span></button>{["Boomerang", "Foto Live"].map((label) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 opacity-60"><strong className="block text-lg">{label}</strong><span className="mt-1 block text-sm text-white/50">Mode ini belum tersedia di browser ini.</span><span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/45">Tidak tersedia</span></div>)}</div><GuestButton type="button" onClick={goToMemory} variant="secondary" className="mt-8 w-full border-white/20 bg-[#e6cdbd] text-[#2b2927]">Lanjut</GuestButton><p className="mt-4 text-center text-xs text-white/45">Mode video memakai format recorder yang didukung perangkatmu.</p></div></main>;

  return <main className="relative min-h-[100svh] min-h-[100dvh] overflow-x-hidden overflow-y-auto bg-[#f8f2ed] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5 text-[#2b2927] sm:px-6 sm:pt-8">
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full border border-[#c99a62]/15" />
      <div className="absolute -bottom-20 -left-16 h-40 w-40 rounded-full border border-[#c99a62]/10" />
      <span className="absolute right-[18%] top-[22%] text-xs text-[#c99a62]/35">✦</span>
      <span className="absolute left-[15%] bottom-[28%] text-[10px] text-[#c99a62]/30">✦</span>
      <div className="absolute inset-0 opacity-[.035] [background-image:radial-gradient(#8d7565_0.6px,transparent_0.6px)] [background-size:10px_10px]" />
    </div>
    <div className="guest-fade relative z-10 mx-auto flex max-w-lg flex-col">
      <button type="button" onClick={() => setStep(mainMode === "video" ? "video-mode" : "frame")} aria-label="Kembali ke langkah sebelumnya" className="grid h-10 w-10 place-items-center rounded-full border border-[#ded3c8] bg-white/90 text-[#6f5b4f] shadow-sm transition active:scale-95">←</button>
      <div className="mt-7 text-center sm:mt-10">
        <p className="font-serif text-4xl italic leading-none text-[#837b74]">Setelah {mainMode === "video" ? "video" : "foto"}</p>
        <h1 className="mt-2 font-serif text-[clamp(2.4rem,11vw,4rem)] leading-none text-[#2b2927]">Yuk tinggalkan pesan juga! <span className="text-[#c99a62]">♡</span></h1>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-[1.5] text-[#8f837b]">Pesanmu akan menjadi kenangan indah untuk kami 🤎</p>
      </div>
      {mainMode === "photo" && <section className="mx-auto mt-7 w-full max-w-[390px]">
        <div className="grid gap-4">
          {pendingPhotos.map((photo, index) => <div key={photo.id} className="relative overflow-hidden rounded-[1.5rem] border-4 border-white bg-white p-2 shadow-lg shadow-[#8d7565]/15"><PhotoPreview photoUrl={photo.url} template={props.frames.find((frame) => frame.id === selectedFrameId) ?? null} eventName={props.eventName} eventDate={props.eventDate} location={props.location} />{index === pendingPhotos.length - 1 && <span className="absolute bottom-4 right-4 grid h-7 w-7 place-items-center rounded-full bg-[#c99a62] text-sm font-bold text-white shadow-md">✓</span>}</div>)}
        </div>
      </section>}
      {props.allowVoiceNote && <section className="mt-6 rounded-[1.5rem] border border-[#e5dbd4] bg-white/90 p-5 shadow-sm">
        <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f3e7da] text-[#957c6c]"><Mic size={21} /></span><div><h2 className="text-lg font-semibold">Voice Note <span className="text-xs font-normal text-[#a08f84]">Opsional</span></h2><p className="mt-1 text-sm text-[#8f837b]">Titip pesan suara untuk pengantin</p></div></div>
        {memoryRecordingActive ? <div className="mt-5"><div className="flex items-center justify-between text-sm font-semibold text-[#8f6a50]"><span className="guest-pulse h-2.5 w-2.5 rounded-full bg-red-400" /> <span>{String(memorySeconds).padStart(2, "0")}s</span></div><div className="mt-3 flex h-8 items-center justify-center gap-1">{Array.from({ length: 22 }, (_, index) => <span key={index} className="w-1 rounded-full bg-[#c99a62]" style={{ height: `${10 + ((index * 7) % 20)}px` }} />)}</div><button type="button" onClick={stopMemoryRecording} className="mt-4 w-full rounded-full bg-[#332b27] px-4 py-3 text-sm font-semibold text-white">Stop</button></div> : memoryRecording ? <div className="mt-5 flex items-center gap-3"><button type="button" onClick={() => { const audio = document.getElementById("memory-voice-preview") as HTMLAudioElement | null; void audio?.play(); }} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#c99a62] text-white">▶</button><audio id="memory-voice-preview" src={memoryRecording.url} className="min-w-0 flex-1" controls /><button type="button" onClick={startMemoryRecording} className="text-xs font-semibold text-[#957c6c]">Rekam lagi</button></div> : <button type="button" onClick={startMemoryRecording} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#c99a62] bg-[#fff8ef] px-4 py-3 text-sm font-semibold text-[#6f5748]"><Mic size={18} /> Tekan untuk merekam pesan suara kamu</button>}
      </section>}
      {props.allowMessage && <section className="mt-4 rounded-[1.5rem] border border-[#e5dbd4] bg-white/90 p-5 shadow-sm">
        <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f3e7da] text-[#957c6c]"><Pencil size={20} /></span><div><h2 className="text-lg font-semibold">Teks Pesan <span className="text-xs font-normal text-[#a08f84]">Opsional</span></h2><p className="mt-1 text-sm text-[#8f837b]">Tulis ucapan dan doa terbaikmu</p></div></div>
        <textarea value={memoryText} onChange={(event) => setMemoryText(event.target.value)} rows={4} maxLength={500} placeholder="Tulis pesanmu di sini..." className="mt-5 w-full resize-none rounded-xl border border-[#eadfd8] bg-[#fffaf6] p-3 text-sm outline-none focus:border-[#c99a62]" /><p className="mt-1 text-right text-xs text-[#8f837b]">{memoryText.length} / 500</p>
      </section>}
      <p className="mt-5 rounded-full border border-[#ead7bd] bg-[#fff8ef] px-4 py-3 text-center text-xs text-[#9b7658]">♡ Pesanmu akan menjadi kenangan indah untuk kami.</p>
      <GuestButton type="button" onClick={continueMemory} disabled={memoryRecordingActive} className="mt-6 flex h-[56px] w-full items-center justify-center gap-2 rounded-full border border-[#5c4737] bg-[#332b27] font-sans text-base font-semibold tracking-normal text-white shadow-lg shadow-[#332b27]/15 hover:bg-[#493a31]">Lanjut <ArrowRight size={18} /></GuestButton>
    </div>
  </main>;
}
