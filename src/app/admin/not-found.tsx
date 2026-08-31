import Link from "next/link";

export default function AdminNotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#f7f5f2] px-6 text-center text-[#2b2927]"><div><h1 className="font-serif text-4xl">Halaman admin tidak ditemukan</h1><Link href="/admin/dashboard" className="mt-7 inline-flex rounded-xl bg-[#2b2927] px-5 py-3 text-sm font-semibold text-white">Kembali ke dashboard</Link></div></main>;
}
