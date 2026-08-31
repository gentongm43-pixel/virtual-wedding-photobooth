"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type TemplateOption = { id: string; name: string };
type EventInitial = { id: string; name: string; slug: string; date: string; location: string | null; description: string | null; coverImage: string | null; logo: string | null; primaryColor: string | null; secondaryColor: string | null; templateId: string | null; photoLimit: number; allowVideo: boolean; videoDuration: number; allowVoiceNote: boolean; voiceNoteDuration: number; allowMessage: boolean; allowPublicGallery: boolean; saveOriginal: boolean; active: boolean };

export default function EventForm({ templates, initial }: { templates: TemplateOption[]; initial?: EventInitial }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(initial ? `/api/admin/events/${initial.id}` : "/api/admin/events", { method: initial ? "PATCH" : "POST", body: form });
    if (response.ok) router.push("/admin/events");
    else { const data = await response.json().catch(() => ({})); setError(data.error ?? "Event gagal disimpan."); setSaving(false); }
  }
  return <form onSubmit={submit} className="space-y-6">
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-medium">Nama event<input name="name" required defaultValue={initial?.name} className="mt-2 w-full rounded-xl border border-[#ded3cc] px-4 py-3 outline-none focus:border-[#957c6c]" placeholder="Nama pasangan" /></label>
      <label className="text-sm font-medium">Slug <span className="font-normal text-[#a08f84]">(opsional untuk event baru)</span><input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required={Boolean(initial)} defaultValue={initial?.slug} className="mt-2 w-full rounded-xl border border-[#ded3cc] px-4 py-3 outline-none focus:border-[#957c6c]" placeholder="putri-mahfud" /><span className="mt-1 block text-xs font-normal text-[#a08f84]">Kosongkan saat membuat event agar dibuat otomatis dari nama.</span></label>
      <label className="text-sm font-medium">Tanggal<input name="date" required type="date" defaultValue={initial?.date} className="mt-2 w-full rounded-xl border border-[#ded3cc] px-4 py-3 outline-none focus:border-[#957c6c]" /></label>
      <label className="text-sm font-medium">Lokasi<input name="location" defaultValue={initial?.location ?? ""} className="mt-2 w-full rounded-xl border border-[#ded3cc] px-4 py-3 outline-none focus:border-[#957c6c]" placeholder="Kota / venue" /></label>
      <label className="text-sm font-medium sm:col-span-2">Deskripsi undangan<textarea name="description" defaultValue={initial?.description ?? ""} rows={3} className="mt-2 w-full rounded-xl border border-[#ded3cc] px-4 py-3 outline-none focus:border-[#957c6c]" placeholder="Cerita singkat untuk tamu" /></label>
      <label className="text-sm font-medium">URL cover image<input name="coverImage" type="url" defaultValue={initial?.coverImage ?? ""} className="mt-2 w-full rounded-xl border border-[#ded3cc] px-4 py-3 outline-none focus:border-[#957c6c]" placeholder="https://..." /></label>
      <label className="text-sm font-medium">URL logo<input name="logo" type="url" defaultValue={initial?.logo ?? ""} className="mt-2 w-full rounded-xl border border-[#ded3cc] px-4 py-3 outline-none focus:border-[#957c6c]" placeholder="https://..." /></label>
      <label className="text-sm font-medium">Warna utama<input name="primaryColor" type="text" pattern="#[0-9a-fA-F]{6}" defaultValue={initial?.primaryColor ?? "#2b2927"} className="mt-2 w-full rounded-xl border border-[#ded3cc] px-4 py-3 outline-none focus:border-[#957c6c]" /></label>
      <label className="text-sm font-medium">Warna sekunder<input name="secondaryColor" type="text" pattern="#[0-9a-fA-F]{6}" defaultValue={initial?.secondaryColor ?? "#e6cdbd"} className="mt-2 w-full rounded-xl border border-[#ded3cc] px-4 py-3 outline-none focus:border-[#957c6c]" /></label>
      <label className="text-sm font-medium">Template<select name="templateId" defaultValue={initial?.templateId ?? ""} className="mt-2 w-full rounded-xl border border-[#ded3cc] bg-white px-4 py-3 outline-none focus:border-[#957c6c]"><option value="">Tanpa template</option>{templates.map((template) => <option value={template.id} key={template.id}>{template.name}</option>)}</select></label>
      <label className="text-sm font-medium">Jumlah foto<select name="photoLimit" defaultValue={String(initial?.photoLimit ?? 1)} className="mt-2 w-full rounded-xl border border-[#ded3cc] bg-white px-4 py-3 outline-none focus:border-[#957c6c]">{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} foto</option>)}</select></label>
    </div>
    <div className="grid gap-4 border-t border-[#eee6e0] pt-6 sm:grid-cols-2">
      <div className="flex items-center gap-3"><label className="flex items-center gap-3 text-sm"><input type="checkbox" name="allowVideo" defaultChecked={initial?.allowVideo ?? true} className="h-4 w-4 accent-[#957c6c]" /> Izinkan video</label><input name="videoDuration" type="number" min="1" max="300" defaultValue={initial?.videoDuration ?? 30} className="w-24 rounded-lg border border-[#ded3cc] px-3 py-2 text-sm" aria-label="Durasi video (detik)" /><span className="text-xs text-[#8f837b]">detik</span></div>
      <div className="flex items-center gap-3"><label className="flex items-center gap-3 text-sm"><input type="checkbox" name="allowVoiceNote" defaultChecked={initial?.allowVoiceNote ?? true} className="h-4 w-4 accent-[#957c6c]" /> Izinkan voice note</label><input name="voiceNoteDuration" type="number" min="1" max="600" defaultValue={initial?.voiceNoteDuration ?? 60} className="w-24 rounded-lg border border-[#ded3cc] px-3 py-2 text-sm" aria-label="Durasi voice note (detik)" /><span className="text-xs text-[#8f837b]">detik</span></div>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="allowMessage" defaultChecked={initial?.allowMessage} className="h-4 w-4 accent-[#957c6c]" /> Izinkan ucapan</label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="allowPublicGallery" defaultChecked={initial?.allowPublicGallery ?? true} className="h-4 w-4 accent-[#957c6c]" /> Galeri publik</label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="saveOriginal" defaultChecked={initial?.saveOriginal} className="h-4 w-4 accent-[#957c6c]" /> Simpan original</label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="active" defaultChecked={initial?.active ?? true} className="h-4 w-4 accent-[#957c6c]" /> Event aktif</label>
    </div>
    {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <button disabled={saving} className="w-full rounded-xl bg-[#2b2927] px-4 py-3.5 font-semibold text-white disabled:opacity-60">{saving ? "Menyimpan..." : initial ? "Simpan perubahan" : "Simpan event"}</button>
  </form>;
}
