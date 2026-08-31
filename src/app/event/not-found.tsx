import Link from "next/link";

export default function EventNotFound() {
  return <main className="grid min-h-screen place-items-center bg-[#f8f2ed] px-6 text-center text-[#2b2927]"><div><h1 className="font-serif text-4xl">Event tidak ditemukan</h1><p className="mt-3 text-sm text-[#8f837b]">Tautan event mungkin sudah tidak berlaku.</p><Link href="/" className="mt-7 inline-flex rounded-xl bg-[#2b2927] px-5 py-3 text-sm font-semibold text-white">Kembali ke Beranda</Link></div></main>;
}
