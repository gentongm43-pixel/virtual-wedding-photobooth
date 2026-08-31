"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_TEMPLATE } from "@/lib/image/template-config";

const starterConfig = JSON.stringify({
  photoSlots: DEFAULT_TEMPLATE.photoSlots,
  texts: DEFAULT_TEMPLATE.texts,
}, null, 2);

export default function TemplateForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      JSON.parse(String(form.get("textConfig")));
    } catch {
      setError("Konfigurasi JSON tidak valid.");
      return;
    }
    const response = await fetch("/api/admin/templates", { method: "POST", body: form });
    if (response.ok) router.refresh();
    else setError("Template gagal disimpan.");
  }
  return <form onSubmit={submit} className="mt-6 space-y-5"><div className="grid gap-4 sm:grid-cols-3"><label className="text-sm font-semibold text-[#4b4039]">Nama template<input required name="name" className="mt-2 w-full rounded-xl border border-[#ded3cc] bg-[#fffdfa] px-3 py-3 outline-none transition focus:border-[#c99a62] focus:ring-2 focus:ring-[#c99a62]/15" placeholder="Warm Editorial" /></label><label className="text-sm font-semibold text-[#4b4039]">Lebar kanvas<input required name="width" type="number" defaultValue="1080" className="mt-2 w-full rounded-xl border border-[#ded3cc] bg-[#fffdfa] px-3 py-3 outline-none transition focus:border-[#c99a62] focus:ring-2 focus:ring-[#c99a62]/15" /></label><label className="text-sm font-semibold text-[#4b4039]">Tinggi kanvas<input required name="height" type="number" defaultValue="1350" className="mt-2 w-full rounded-xl border border-[#ded3cc] bg-[#fffdfa] px-3 py-3 outline-none transition focus:border-[#c99a62] focus:ring-2 focus:ring-[#c99a62]/15" /></label></div><div className="grid gap-4 rounded-2xl border border-[#f0e5dc] bg-[#fcf8f4] p-4 sm:grid-cols-3"><label className="text-sm font-semibold text-[#4b4039]">Background<span className="mt-1 block text-[11px] font-normal text-[#a08f84]">Kanvas final</span><input name="background" type="url" className="mt-2 w-full rounded-xl border border-[#ded3cc] bg-white px-3 py-3 outline-none focus:border-[#c99a62]" placeholder="https://..." /></label><label className="text-sm font-semibold text-[#4b4039]">Overlay dekorasi<span className="mt-1 block text-[11px] font-normal text-[#a08f84]">Border / ornamen</span><input name="overlay" type="url" className="mt-2 w-full rounded-xl border border-[#ded3cc] bg-white px-3 py-3 outline-none focus:border-[#c99a62]" placeholder="https://..." /></label><label className="text-sm font-semibold text-[#4b4039]">Logo<span className="mt-1 block text-[11px] font-normal text-[#a08f84]">Opsional</span><input name="logo" type="url" className="mt-2 w-full rounded-xl border border-[#ded3cc] bg-white px-3 py-3 outline-none focus:border-[#c99a62]" placeholder="https://..." /></label></div><label className="block text-sm font-semibold text-[#4b4039]">Photo slots &amp; teks<span className="mt-1 block text-[11px] font-normal text-[#a08f84]">Gunakan `photoSlots` untuk satu atau beberapa area foto, lalu atur teks dinamis dengan `{"{{eventName}}"}`.</span><textarea required name="textConfig" defaultValue={starterConfig} rows={12} className="mt-2 w-full rounded-xl border border-[#ded3cc] bg-[#fffdfa] px-3 py-3 font-mono text-xs leading-5 outline-none focus:border-[#c99a62] focus:ring-2 focus:ring-[#c99a62]/15" /></label>{error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<button className="rounded-xl bg-[#2b2927] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#493a31]">Simpan template</button></form>;
}
