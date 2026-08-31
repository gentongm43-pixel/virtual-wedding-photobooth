"use client";

/* Authenticated QR image is served dynamically and should not be optimized or cached by next/image. */
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Copy, Download, Files, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = { eventId: string; eventCode: string; eventUrl: string };

export default function GuestAccess({ eventId, eventCode, eventUrl }: Props) {
  const router = useRouter();
  const [code, setCode] = useState(eventCode);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${label} disalin.`);
    } catch {
      setStatus("Gagal menyalin. Silakan salin secara manual.");
    }
  }

  async function regenerate() {
    if (!window.confirm("Regenerasi kode event? Kode lama tidak akan bisa digunakan lagi.")) return;
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch(`/api/admin/events/${eventId}/regenerate-code`, { method: "POST" });
      const result = (await response.json()) as { eventCode?: string; error?: string };
      if (!response.ok || !result.eventCode) throw new Error(result.error);
      setCode(result.eventCode);
      setStatus("Kode event berhasil diganti.");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error && error.message ? error.message : "Kode gagal diganti.");
    } finally {
      setBusy(false);
    }

  }

  async function duplicate() {
    if (!window.confirm("Duplikat event ini? Event baru akan memiliki slug dan kode yang berbeda.")) return;
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch(`/api/admin/events/${eventId}/duplicate`, { method: "POST" });
      const result = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error);
      router.push(`/admin/events/${result.id}`);
    } catch (error) {
      setStatus(error instanceof Error && error.message ? error.message : "Event gagal diduplikat.");
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#e8dfd8] bg-white p-6 sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#957c6c]">Guest access</p>
        <h2 className="mt-2 font-serif text-2xl">Bagikan event ke tamu</h2>
        <p className="mt-1 text-sm text-[#8f837b]">QR ini membuka URL publik event, bukan halaman admin.</p>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-[180px_1fr] md:items-start">
        <div className="rounded-xl border border-[#eee6e0] bg-white p-3">
          {/* The authenticated route returns a high-resolution image for download or display. */}
          <img src={`/api/admin/events/${eventId}/qr?format=png`} alt={`QR code untuk ${code}`} className="aspect-square w-full" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a19389]">Kode event</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="rounded-xl bg-[#f7f1ec] px-4 py-3 font-mono text-2xl font-bold tracking-[0.18em]">{code}</code>
              <button type="button" onClick={() => void copy(code, "Kode")} className="grid h-11 w-11 place-items-center rounded-xl border border-[#ded3cc]" aria-label="Salin kode event"><Copy size={16} /></button>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#a19389]">URL tamu</p>
            <div className="mt-2 flex items-center gap-2">
              <input readOnly value={eventUrl} className="min-w-0 flex-1 rounded-xl border border-[#ded3cc] px-3 py-3 text-sm text-[#756d67]" />
              <button type="button" onClick={() => void copy(eventUrl, "URL")} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#ded3cc]" aria-label="Salin URL event"><Copy size={16} /></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/api/admin/events/${eventId}/qr?format=png&download=1`} download className="inline-flex items-center gap-2 rounded-xl bg-[#2b2927] px-4 py-3 text-sm font-semibold text-white"><Download size={16} /> PNG</a>
            <a href={`/api/admin/events/${eventId}/qr?format=svg&download=1`} download className="inline-flex items-center gap-2 rounded-xl border border-[#ded3cc] px-4 py-3 text-sm font-semibold"><Download size={16} /> SVG</a>
            <button type="button" onClick={() => void regenerate()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-[#ded3cc] px-4 py-3 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} /> {busy ? "Mengganti..." : "Regenerasi kode"}</button>
            <button type="button" onClick={() => void duplicate()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-[#ded3cc] px-4 py-3 text-sm font-semibold disabled:opacity-50"><Files size={16} /> Duplikat event</button>
          </div>
          {status && <p role="status" className="text-sm text-[#756d67]">{status}</p>}
        </div>
      </div>
    </section>
  );
}
