"use client";

import QrScanner from "qr-scanner";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = { onClose: () => void };

export default function QrScannerModal({ onClose }: Props) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const handledRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  const stop = useCallback((updateState = true) => {
    scannerRef.current?.stop();
    scannerRef.current?.destroy();
    scannerRef.current = null;
    const stream = videoRef.current?.srcObject;
    if (stream instanceof MediaStream) stream.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    if (updateState) setScanning(false);
  }, []);

  const close = useCallback(() => {
    stop();
    onClose();
  }, [onClose, stop]);

  function startScanning() {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setMessage("Scanner membutuhkan HTTPS atau localhost agar kamera dapat digunakan.");
      return;
    }
    setMessage("");
    setScanning(true);
  }

  const handleResult = useCallback(async (data: string) => {
    if (handledRef.current) return;
    handledRef.current = true;
    stop();
    let decoded: URL;
    try {
      decoded = new URL(data);
    } catch {
      setMessage("QR tidak berisi URL event yang valid.");
      handledRef.current = false;
      return;
    }
    let configuredOrigin = window.location.origin;
    try {
      if (process.env.NEXT_PUBLIC_APP_URL) configuredOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL).origin;
    } catch {
      // Fall back to the current origin when the optional public URL is malformed.
    }
    const match = decoded.pathname.match(/^\/event\/([^/]+)$/);
    let slug = "";
    try {
      slug = match?.[1] ? decodeURIComponent(match[1]) : "";
    } catch {
      setMessage("QR harus berupa URL publik event Momen Kita.");
      handledRef.current = false;
      return;
    }
    if (decoded.origin !== configuredOrigin || decoded.username || decoded.password || decoded.search || decoded.hash || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setMessage("QR harus berupa URL publik event Momen Kita.");
      handledRef.current = false;
      return;
    }
    setMessage("Memeriksa event...");
    try {
      const response = await fetch(`/api/events/lookup?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
      if (response.status === 404) {
        setMessage("Event tidak ditemukan.");
        handledRef.current = false;
        return;
      }
      if (response.status === 410) {
        setMessage("Event sedang tidak tersedia.");
        handledRef.current = false;
        return;
      }
      if (!response.ok) throw new Error("lookup failed");
      router.push(decoded.pathname);
    } catch {
      setMessage("Event tidak dapat diperiksa. Coba lagi.");
      handledRef.current = false;
    }
  }, [router, stop]);

  useEffect(() => {
    if (!scanning || !videoRef.current) return;
    handledRef.current = false;
    const video = videoRef.current;
    const scanner = new QrScanner(video, (result) => void handleResult(result.data), {
      preferredCamera: "environment",
      maxScansPerSecond: 8,
      highlightScanRegion: true,
      returnDetailedScanResult: true,
    });
    scannerRef.current = scanner;
    const timeout = window.setTimeout(() => {
      if (!handledRef.current) {
        stop();
        setMessage("QR belum ditemukan. Pastikan kode terlihat jelas lalu coba lagi.");
      }
    }, 30000);
    void scanner.start().catch(() => {
      window.clearTimeout(timeout);
      stop();
      setMessage("Kamera tidak dapat digunakan. Izinkan akses kamera lalu coba lagi.");
    });
    return () => {
      window.clearTimeout(timeout);
      scanner.stop();
      scanner.destroy();
      if (video.srcObject instanceof MediaStream) video.srcObject.getTracks().forEach((track) => track.stop());
      if (video.srcObject) video.srcObject = null;
      if (scannerRef.current === scanner) scannerRef.current = null;
    };
  }, [handleResult, scanning, stop]);

  useEffect(() => () => stop(false), [stop]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-5" role="dialog" aria-modal="true" aria-labelledby="qr-scanner-title">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 text-[#2b2927] shadow-2xl">
        <div className="flex items-center justify-between">
          <div><h2 id="qr-scanner-title" className="font-serif text-2xl">Scan QR Event</h2><p className="mt-1 text-sm text-[#8f837b]">Arahkan kamera ke QR dari penyelenggara.</p></div>
          <button type="button" onClick={close} className="grid h-10 w-10 place-items-center rounded-full bg-[#f7f1ec]" aria-label="Tutup scanner"><X size={18} /></button>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl bg-[#151413]">
          <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline aria-label="Pratinjau kamera scanner" />
        </div>
        {message && <p role="alert" className="mt-4 rounded-xl bg-[#f7f1ec] px-4 py-3 text-sm text-[#756d67]">{message}</p>}
        {!scanning && <button type="button" onClick={startScanning} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2b2927] px-5 py-3.5 font-semibold text-white"><Camera size={17} /> Aktifkan kamera</button>}
        {scanning && <button type="button" onClick={() => stop()} className="mt-5 w-full rounded-xl border border-[#ded3cc] px-5 py-3.5 text-sm font-semibold">Berhenti scan</button>}
      </div>
    </div>
  );
}
