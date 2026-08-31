"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LoaderCircle } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (response.ok) router.push("/admin/dashboard");
    else { const result = await response.json().catch(() => ({})); setError(result.error ?? "Email atau password tidak valid."); setLoading(false); }
  }
  return <main className="grid min-h-screen place-items-center bg-[#fbfaf8] px-6"><div className="w-full max-w-md rounded-[2rem] border border-[#eadfd8] bg-white p-8 shadow-xl shadow-[#d8c8bd]/20 sm:p-10">
    <div className="mb-8 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#2b2927] text-[#f7eee7]"><Heart size={19} fill="currentColor" /></span><span className="font-serif text-xl">Momen Kita</span></div>
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#957c6c]">Ruang admin</p><h1 className="mt-3 font-serif text-4xl">Selamat datang kembali.</h1><p className="mt-3 text-sm leading-6 text-[#756d67]">Kelola event, galeri, dan ucapan tamu dari satu tempat.</p>
    <form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-medium">Email<input required name="email" type="email" className="mt-2 w-full rounded-xl border border-[#ded3cc] px-4 py-3 outline-none focus:border-[#957c6c]" placeholder="admin@momengita.id" /></label><label className="block text-sm font-medium">Password<input required name="password" type="password" className="mt-2 w-full rounded-xl border border-[#ded3cc] px-4 py-3 outline-none focus:border-[#957c6c]" placeholder="••••••••" /></label>{error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2b2927] px-4 py-3.5 font-semibold text-white transition hover:bg-[#47423e] disabled:opacity-60">{loading && <LoaderCircle size={17} className="animate-spin" />} Masuk ke dashboard</button></form>
  </div></main>;
}
