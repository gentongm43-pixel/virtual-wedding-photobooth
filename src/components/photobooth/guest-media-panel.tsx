"use client";

/* Captured media uses runtime blob/external URLs that are not suitable for next/image. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, Heart, Mic, RefreshCw, Send, Video } from "lucide-react";
import Link from "next/link";
import type { GuestMode } from "./guest-experience";
import { GuestButton } from "./guest-ui";
import type { CapturedPhoto } from "./photo-session";
import { PhotoPreview, type PreviewTemplate } from "./photo-preview";

type Mode = Exclude<GuestMode, "photo">;
export type GuestMediaRecording = { mode: "video" | "voice"; blob: Blob; url: string; mimeType: string; durationMs: number };
export type GuestMediaItem = { mode: Mode; recording?: GuestMediaRecording; text?: string };
type Props = {
  eventId: string;
  eventName: string;
  eventDate: string;
  location?: string | null;
  sessionId: string | null;
  onBack: () => void;
  selectedModes: Mode[];
  pendingPhotos?: CapturedPhoto[];
  selectedFrameId?: string | null;
  selectedTemplate?: PreviewTemplate | null;
  allowVideo: boolean;
  videoDuration: number;
  allowVoiceNote: boolean;
  voiceNoteDuration: number;
  allowMessage: boolean;
  initialItems?: GuestMediaItem[];
  startInReview?: boolean;
};
type Item = GuestMediaItem;

function mimeFor(mode: "video" | "voice") {
  const types = mode === "video"
    ? ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
    : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export default function GuestMediaPanel({
  eventId,
  eventName,
  eventDate,
  location,
  sessionId,
  onBack,
  selectedModes,
  pendingPhotos = [],
  selectedFrameId = null,
  selectedTemplate = null,
  allowVideo,
  videoDuration,
  allowVoiceNote,
  voiceNoteDuration,
  allowMessage,
  initialItems = [],
  startInReview = false,
}: Props) {
  const [stage, setStage] = useState<"compose" | "review" | "sending" | "success">(startInReview || (pendingPhotos.length && !selectedModes.length) ? "review" : "compose");
  const [activeIndex, setActiveIndex] = useState(0);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [text, setText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [recordingMode, setRecordingMode] = useState<"video" | "voice" | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [failed, setFailed] = useState<Mode[]>([]);
  const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [sentItems, setSentItems] = useState<Mode[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const livePreviewRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const itemsRef = useRef<Item[]>([]);

  const options: { mode: Mode; label: string; description: string; enabled: boolean }[] = [
    { mode: "video", label: "Video", description: `Maks. ${videoDuration} detik`, enabled: allowVideo },
    { mode: "voice", label: "Voice note", description: `Maks. ${voiceNoteDuration} detik`, enabled: allowVoiceNote },
    { mode: "text", label: "Text", description: "Ucapan tertulis", enabled: allowMessage },
  ];
  const activeMode = selectedModes[activeIndex];
  const activeOption = options.find((option) => option.mode === activeMode);
  const activeItem = items.find((item) => item.mode === activeMode);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    itemsRef.current.forEach((item) => {
      if (item.recording) URL.revokeObjectURL(item.recording.url);
    });
  }, []);

  useEffect(() => {
    if (!livePreviewRef.current) return;
    livePreviewRef.current.srcObject = recordingMode === "video" && recording ? streamRef.current : null;
    if (recordingMode === "video" && recording) void livePreviewRef.current.play().catch(() => undefined);
  }, [recording, recordingMode]);

  function updateItem(mode: Mode, update: Partial<Item>) {
    setItems((current) => [...current.filter((item) => item.mode !== mode), { mode, ...update }]);
  }

  function startRecording(mode: "video" | "voice") {
    setError("");
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Browser membutuhkan HTTPS dan dukungan perekaman media.");
      return;
    }
    const mimeType = mimeFor(mode);
    if (!mimeType) {
      setError("Format rekaman tidak didukung browser ini.");
      return;
    }
    const streamPromise = new Promise<MediaStream>((resolve, reject) => {
      let settled = false;
      const timeout = window.setTimeout(() => { settled = true; reject(new Error("timeout")); }, 12000);
      void navigator.mediaDevices.getUserMedia({ video: mode === "video", audio: true }).then((stream) => {
        window.clearTimeout(timeout);
        if (settled) stream.getTracks().forEach((track) => track.stop());
        else { settled = true; resolve(stream); }
      }).catch((reason: unknown) => {
        window.clearTimeout(timeout);
        if (!settled) { settled = true; reject(reason); }
      });
    });
    void streamPromise.then((stream) => {
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      startedRef.current = Date.now();
      setRecordingMode(mode);
      setRecording(true);
      setSeconds(0);
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onerror = () => { setError("Rekaman gagal. Silakan coba lagi."); stopRecording(); };
      recorder.onstop = () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);
        setRecordingMode(null);
        recorderRef.current = null;
        const durationMs = Math.max(1, Date.now() - startedRef.current);
        const blob = new Blob(chunksRef.current, { type: mimeType });
        updateItem(mode, { recording: { mode, blob, mimeType, durationMs, url: URL.createObjectURL(blob) } });
      };
      recorder.start(250);
      const maxSeconds = mode === "video" ? videoDuration : voiceNoteDuration;
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedRef.current) / 1000);
        setSeconds(elapsed);
        if (elapsed >= maxSeconds && recorder.state === "recording") recorder.stop();
      }, 250);
    }).catch((reason: unknown) => {
      setError(reason instanceof Error && reason.message === "timeout"
        ? "Perangkat tidak merespons dalam 12 detik."
        : reason instanceof DOMException && reason.name === "NotAllowedError"
          ? "Izin perangkat ditolak. Izinkan akses lalu coba lagi."
          : "Perangkat tidak dapat digunakan.");
    });
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  function continueCurrent() {
    if (activeMode === "text") {
      if (!text.trim()) {
        setError("Tulis ucapan terlebih dahulu.");
        return;
      }
      updateItem("text", { text: text.trim() });
    } else if (!activeItem?.recording) {
      setError(`Lengkapi ${activeOption?.label ?? "kiriman"} terlebih dahulu.`);
      return;
    }
    setError("");
    if (activeIndex < selectedModes.length - 1) {
      setActiveIndex((index) => index + 1);
    } else {
      setItems((current) => activeMode === "text"
        ? [...current.filter((item) => item.mode !== "text"), { mode: "text", text: text.trim() }]
        : current);
      setStage("review");
    }
  }

  async function sendAll() {
    if (!sessionId || stage === "sending") return;
    setStage("sending");
    setError("");
    const failures: Mode[] = [];
    const photoFailures: string[] = [];
    for (const photo of pendingPhotos) {
      if (uploadedPhotos.includes(photo.id)) continue;
      try {
        const form = new FormData();
        form.append("file", photo.blob, `${photo.id}.jpg`);
        form.append("sessionId", sessionId);
        if (selectedFrameId) form.append("templateId", selectedFrameId);
        const response = await fetch(`/api/events/${eventId}/photos`, { method: "POST", body: form });
        if (!response.ok) photoFailures.push(photo.id);
        else setUploadedPhotos((current) => [...current, photo.id]);
      } catch {
        photoFailures.push(photo.id);
      }
    }
    for (const item of items) {
      if (sentItems.includes(item.mode)) continue;
      try {
        const form = new FormData();
        form.append("sessionId", sessionId);
        let url = "";
        if (item.mode === "text") {
          form.append("content", item.text ?? "");
          form.append("name", guestName.trim());
          url = `/api/events/${eventId}/messages`;
        } else if (item.recording) {
          form.append("file", item.recording.blob, `guest-${item.mode}.webm`);
          form.append("durationMs", String(item.recording.durationMs));
          url = `/api/events/${eventId}/${item.mode === "video" ? "videos" : "voice-notes"}`;
        } else {
          continue;
        }
        const response = await fetch(url, { method: "POST", body: form });
        if (!response.ok) failures.push(item.mode);
        else setSentItems((current) => [...current, item.mode]);
      } catch {
        failures.push(item.mode);
      }
    }
    if (failures.length || photoFailures.length) {
      setFailed(failures);
      setFailedPhotos(photoFailures);
      setError(`${failures.length + photoFailures.length} kiriman gagal. Periksa koneksi lalu coba lagi.`);
      setStage("review");
    } else {
      setFailed([]);
      await fetch(`/api/events/${eventId}/sessions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setStage("success");
    }
  }

  const style = { "--primary": "#2b2927", "--secondary": "#e6cdbd" } as CSSProperties;
  return <main className="relative min-h-screen overflow-hidden bg-[#f8f2ed] px-5 py-8 text-[#2b2927] sm:px-6 sm:py-10" style={style}>
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div className="absolute -right-12 -top-8 h-48 w-48 rotate-12 rounded-[45%] border-2 border-[#c99a62]/20" />
      <div className="absolute right-4 top-10 text-5xl text-[#d8b68a]/35">❀</div><div className="absolute right-16 top-24 text-3xl text-[#b99b77]/30">✦</div>
      <div className="absolute -bottom-14 -left-12 h-44 w-44 -rotate-12 rounded-[45%] border-2 border-[#c99a62]/15" />
      <div className="absolute bottom-14 left-5 text-5xl text-[#d8b68a]/30">❀</div><div className="absolute bottom-28 right-8 text-2xl text-[#b99b77]/25">✦</div>
    </div>
    <div className="guest-fade relative z-10 mx-auto max-w-lg rounded-[2rem] border border-[#eadfd8]/80 bg-[#fffdf9]/90 p-6 shadow-xl shadow-[#8d7565]/10 sm:p-10">
      {stage === "success" ? <div className="text-center">
        <div className="relative mx-auto w-fit"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#c99a62] text-white shadow-xl shadow-[#c99a62]/25"><Heart size={30} fill="currentColor" /></span><span className="absolute -right-7 top-2 text-xl text-[#c99a62]">✦</span><span className="absolute -left-7 bottom-2 text-sm text-[#c99a62]">✦</span></div>
        <h1 className="mt-7 font-serif text-[clamp(3.25rem,14vw,5rem)] leading-none tracking-[-.04em] text-[#2b2927]">Terima kasih</h1>
        <div className="mx-auto mt-6 flex max-w-[250px] items-center gap-3 text-[#c99a62]"><span className="h-px flex-1 bg-[#dec9b2]" /><span className="text-sm">♥</span><span className="h-px flex-1 bg-[#dec9b2]" /></div>
        <p className="mx-auto mt-6 max-w-xs text-[15px] leading-7 text-[#756d67]">Kenanganmu telah menjadi bagian<br />dari cerita <strong className="font-serif text-lg font-normal text-[#5c4737]">{eventName}</strong></p>
        <section className="relative mt-7 flex items-center gap-4 rounded-[1.5rem] border border-[#dec9b2] bg-[#fff8ef] p-4 text-left shadow-sm">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#ead7bd] text-[#b88650]">✓</span><div><h2 className="font-semibold text-[#5c4737]">Foto berhasil tersimpan!</h2><p className="mt-1 text-xs leading-5 text-[#8f837b]">Foto dan pesanmu telah berhasil ditambahkan ke galeri kenangan acara.</p></div><span className="absolute right-3 top-3 text-sm text-[#c99a62]">✦</span>
        </section>
        {pendingPhotos[0] && <div className="mx-auto mt-8 w-[min(78vw,270px)] rotate-[-3deg] bg-white p-3 pb-5 shadow-xl shadow-[#8d7565]/20"><div className="relative overflow-hidden bg-[#f1e6dc]"><img src={pendingPhotos[0].url} alt={`Foto ${eventName}`} className="aspect-[3/4] w-full object-contain" /><span className="absolute left-1/2 top-0 h-7 w-16 -translate-x-1/2 -translate-y-2 rotate-2 bg-[#e6cdbd]/80" /></div><p className="mt-3 font-serif text-lg italic text-[#8c6e52]">Terima kasih! ♡</p></div>}
        <div className="mx-auto mt-8 flex max-w-[250px] items-center gap-3 text-[#c99a62]"><span className="h-px flex-1 bg-[#dec9b2]" /><span className="text-sm">♥</span><span className="h-px flex-1 bg-[#dec9b2]" /></div>
        <p className="mt-5 text-sm leading-6 text-[#756d67]">Terima kasih telah berbagi momen<br />spesial bersama kami 🤎</p>
        <Link href={`/event/${eventId}/gallery`} className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#332b27] px-5 text-sm font-semibold text-white shadow-lg shadow-[#332b27]/20">Lihat Galeri Kenangan <span className="text-[#e6c08f]">→</span></Link>
        <div className="my-5 flex items-center gap-3 text-xs text-[#a08f84]"><span className="h-px flex-1 bg-[#eadfd8]" /><span>atau</span><span className="h-px flex-1 bg-[#eadfd8]" /></div>
        <button type="button" onClick={onBack} className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-[#c99a62] bg-[#fffaf6] px-5 text-sm font-semibold text-[#6f5748]"><RefreshCw size={17} /> Ambil Lagi Foto</button>
      </div> : <>
        <button type="button" onClick={() => stage === "review" ? setStage("compose") : onBack()} className="flex items-center gap-2 text-sm font-medium text-[#957c6c]"><ArrowLeft size={16} /> Kembali</button>
        <h1 className="mt-8 font-serif text-4xl">{stage === "compose" ? activeOption?.label : "Kenangan kamu ❤️"}</h1>
        <p className="mt-3 text-sm leading-6 text-[#8f837b]">{stage === "compose" ? `Pilihan ${activeIndex + 1} dari ${selectedModes.length}: ${activeOption?.label ?? ""}` : "Tidak ada yang dikirim sebelum kamu menekan Kirim Semua."}</p>
        {stage === "compose" && activeMode && <div className="mt-8 rounded-2xl border border-[#e5dbd4] p-4">
          {activeMode === "text" ? <><input value={guestName} onChange={(event) => setGuestName(event.target.value)} maxLength={100} placeholder="Nama (opsional)" className="mb-3 w-full border-b border-[#e5dbd4] pb-2 outline-none" /><textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} maxLength={500} placeholder="Tulis ucapan untuk pasangan..." className="w-full resize-none outline-none" /><p className="mt-2 text-right text-xs text-[#8f837b]">{text.length} / 500</p></> : activeItem?.recording ? <div className="flex items-center justify-between text-sm font-semibold"><span>{activeOption?.label} siap direview</span><button type="button" onClick={() => startRecording(activeMode)} className="text-[#957c6c]">Rekam lagi</button></div> : <button type="button" onClick={() => startRecording(activeMode)} className="flex w-full items-center gap-3 text-left font-semibold">{activeMode === "video" ? <Video size={19} /> : <Mic size={19} />} Rekam {activeOption?.label}</button>}
        </div>}
        {recordingMode === "video" && recording && <video ref={livePreviewRef} autoPlay muted playsInline className="mt-4 max-h-64 w-full rounded-xl bg-black object-contain" />}
        {recording && <div className="mt-5 rounded-[1.5rem] bg-[#2b2927] p-5 text-center text-sm font-semibold text-white shadow-lg"><div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-[#e6cdbd]"><span className="guest-pulse h-2.5 w-2.5 rounded-full bg-red-400" /> REC</div><div className="mt-3 font-serif text-3xl">{String(seconds).padStart(2, "0")}s <span className="text-sm font-sans text-white/45">/ {recordingMode === "video" ? videoDuration : voiceNoteDuration}s</span></div><div className="mt-4 flex h-8 items-center justify-center gap-1">{Array.from({ length: 18 }, (_, index) => <span key={index} className="w-1 rounded-full bg-[#e6cdbd]" style={{ height: `${10 + ((index * 7) % 20)}px` }} />)}</div><button type="button" onClick={stopRecording} className="mt-4 min-h-12 rounded-full bg-white px-8 text-sm font-semibold text-[#2b2927] active:scale-95">Stop</button></div>}
        {stage === "compose" && <GuestButton type="button" disabled={recording} onClick={continueCurrent} className="mt-8 w-full">{activeMode === "text" || activeIndex === selectedModes.length - 1 ? "Tinjau semua" : "Berikutnya"}</GuestButton>}
        {(stage === "review" || stage === "sending") && <><div className="mt-8 grid gap-4">{pendingPhotos.map((photo) => <div key={photo.id} className={`rounded-[1.5rem] border p-3 shadow-sm ${failedPhotos.includes(photo.id) ? "border-red-300 bg-red-50" : "border-[#e5dbd4] bg-white"}`}><PhotoPreview photoUrl={photo.url} template={selectedTemplate} eventName={eventName} eventDate={eventDate} location={location} /><p className="mt-2 text-xs text-[#8f837b]">{uploadedPhotos.includes(photo.id) ? "Siap dikirim" : failedPhotos.includes(photo.id) ? "Gagal dikirim" : "Menunggu dikirim"}</p></div>)}{items.map((item) => <div key={item.mode} className={`rounded-[1.5rem] border p-5 shadow-sm ${failed.includes(item.mode) ? "border-red-300 bg-red-50" : "border-[#e5dbd4] bg-white"}`}>{item.mode === "text" ? <><p className="font-serif text-xl leading-8">“{item.text}”</p>{guestName && <p className="mt-3 text-xs text-[#8f837b]">— {guestName}</p>}</> : item.recording && <>{item.mode === "video" ? <video controls playsInline src={item.recording.url} className="max-h-56 w-full rounded-xl bg-black object-contain" /> : <audio controls src={item.recording.url} className="w-full" />}<p className="mt-3 text-xs text-[#8f837b]">{failed.includes(item.mode) ? "Gagal dikirim" : "Siap dikirim"}</p></>}</div>)}</div>{error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<button type="button" disabled={stage === "sending"} onClick={() => void sendAll()} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2b2927] px-5 py-4 font-semibold text-white disabled:opacity-50">{stage === "sending" ? "Mengirim..." : failed.length || failedPhotos.length ? <><RefreshCw size={17} /> Kirim ulang yang gagal</> : <><Send size={17} /> Kirim Semua</>}</button></>}
        {error && stage === "compose" && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </>}
    </div>
  </main>;
}
