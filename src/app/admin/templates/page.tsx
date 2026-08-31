import TemplateForm from "@/components/admin/template-form";
import { PhotoPreview, type PreviewTemplate } from "@/components/photobooth/photo-preview";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { configFromTemplateRecord } from "@/lib/image/template-config";

export default async function TemplatesPage() {
  await requireAdmin();
  const [templates, activeEvent] = await Promise.all([
    prisma.template.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { events: true } } } }),
    prisma.event.findFirst({ where: { active: true }, orderBy: { updatedAt: "desc" }, select: { name: true, date: true, location: true } }),
  ]);
  const previewEvent = activeEvent ?? { name: "Preview event", date: new Date(), location: null };
  return <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10 lg:px-12">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="text-sm font-medium text-[#957c6c]">Workspace / Design</p><h1 className="mt-2 font-serif text-4xl tracking-tight text-[#302b28]">Template Frame</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#8f837b]">Kelola frame photo booth dari satu konfigurasi yang dipakai oleh picker, kamera, preview, dan hasil akhir.</p></div>
      <span className="inline-flex w-fit items-center rounded-full border border-[#ead8bd] bg-[#fbf1e3] px-3 py-1.5 text-xs font-semibold text-[#9a754d]">{templates.length} template tersedia</span>
    </div>
    <section className="mt-8 rounded-[1.5rem] border border-[#eadfd8] bg-[#fffdfa] p-6 shadow-sm shadow-[#8d7565]/5 sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b28a5c]">Template editor</p><h2 className="mt-2 font-serif text-2xl text-[#302b28]">Buat template baru</h2><p className="mt-1 text-sm text-[#8f837b]">Simpan ukuran kanvas, slot foto, asset dekorasi, dan teks dalam konfigurasi yang sama.</p></div><span className="hidden rounded-full bg-[#f7eee6] px-3 py-1 text-xs font-semibold text-[#9a754d] sm:block">JSON terstruktur</span></div>
      <TemplateForm />
    </section>
    <section className="mt-8">
      <div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b28a5c]">Library</p><h2 className="mt-2 font-serif text-2xl text-[#302b28]">Frame yang tersedia</h2></div><p className="text-xs text-[#a08f84]">Preview memakai renderer aktual</p></div>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{templates.map((template, index) => {
        const config = configFromTemplateRecord(template);
        const preview: PreviewTemplate = { id: template.id, name: template.name, width: template.width, height: template.height, background: template.background, overlay: template.overlay, logo: template.logo, textConfig: { photoSlots: config.photoSlots, texts: config.texts } };
        return <article key={template.id} className="overflow-hidden rounded-[1.5rem] border border-[#eadfd8] bg-[#fffdfa] shadow-sm shadow-[#8d7565]/5 transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="bg-[#f4ebe3] p-4 sm:p-5"><PhotoPreview template={preview} eventName={previewEvent.name} eventDate={previewEvent.date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} location={previewEvent.location} /></div>
          <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-serif text-xl text-[#302b28]">{template.name}</h3><p className="mt-1 text-xs text-[#8f837b]">{template.width} × {template.height} · {template._count.events} event terhubung</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${template._count.events ? "bg-[#eaf5ed] text-[#4c8a5a]" : "bg-[#f5eee7] text-[#9a8576]"}`}>{template._count.events ? "Aktif" : "Siap dipilih"}</span></div><div className="mt-4 flex items-center justify-between border-t border-[#f0e7df] pt-4 text-xs text-[#a08f84]"><span>{index === 0 ? "Default event" : "Template frame"}</span><span className="font-semibold text-[#a77943]">Renderer aktif</span></div></div>
        </article>;
      })}</div>
    </section>
  </div>;
}
