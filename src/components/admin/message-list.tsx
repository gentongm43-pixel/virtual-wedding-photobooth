"use client";

import { useState } from "react";

type Message = { id: string; name: string | null; content: string; createdAt: string; eventName: string };
export default function MessageList({ messages }: { messages: Message[] }) {
  const [items, setItems] = useState(messages);
  async function remove(id: string) {
    if (!window.confirm("Hapus ucapan ini?")) return;
    const response = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((item) => item.id !== id));
  }
  if (!items.length) return <p className="rounded-xl bg-white p-8 text-center text-sm text-[#8f837b]">Belum ada ucapan.</p>;
  return <div className="grid gap-4">{items.map((message) => <article key={message.id} className="rounded-2xl border border-[#e8dfd8] bg-white p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{message.name || "Tamu"}</p><p className="mt-1 text-xs text-[#957c6c]">{message.eventName} · {new Date(message.createdAt).toLocaleString("id-ID")}</p></div><button type="button" onClick={() => void remove(message.id)} className="text-xs font-semibold text-red-700">Hapus</button></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#756d67]">{message.content}</p></article>)}</div>;
}
