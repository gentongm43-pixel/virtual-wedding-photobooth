import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { createEventWithGeneratedCode, normalizeEventCode } from "../src/lib/event-code";

const prisma = new PrismaClient();

function svgData(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const PHOTOBOOTH_TEMPLATES = [
  {
    id: "default-wedding-template",
    name: "Warm Editorial",
    width: 1080,
    height: 1350,
    background: svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="#f7eee7"/><rect x="28" y="28" width="1024" height="1294" rx="18" fill="none" stroke="#b99a72" stroke-width="3"/><rect x="45" y="45" width="990" height="1260" rx="12" fill="none" stroke="#d9bd91"/><path d="M0 1140Q260 1035 540 1140T1080 1140V1350H0Z" fill="#ead8c8" fill-opacity=".78"/><g fill="none" stroke="#b99a72" stroke-width="4"><path d="M45 155V45h110M1035 155V45H925M45 1195v110h110M1035 1195v-110H925"/></g><g fill="#b99a72"><circle cx="78" cy="78" r="9"/><circle cx="1002" cy="78" r="9"/><circle cx="78" cy="1272" r="9"/><circle cx="1002" cy="1272" r="9"/></g></svg>`),
    textConfig: {
      photoArea: { x: 70, y: 105, width: 940, height: 900, fit: "cover" },
      decorations: ["thin-gold-border", "soft-arch"],
      texts: [
        { text: "{{eventName}}", x: 540, y: 1120, align: "center", fontSize: 48, color: "#332b27" },
        { text: "{{eventDate}}", x: 540, y: 1180, align: "center", fontSize: 32, color: "#725f53" },
        { text: "{{location}}", x: 540, y: 1230, align: "center", fontSize: 26, color: "#8d786b" },
      ],
    },
  },
  {
    id: "botanical-garden-template",
    name: "Botanical Garden",
    width: 1080,
    height: 1350,
    background: svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="#f3eee5"/><path d="M0 0h270Q180 130 0 210ZM1080 1350H810q90-130 270-210Z" fill="#d8cbb4" fill-opacity=".8"/><g fill="none" stroke="#9eaa8b" stroke-width="4" stroke-linecap="round"><path d="M30 260C120 180 170 100 205 18M1050 1090c-90 80-140 160-175 242"/></g><g fill="#b4c09b" fill-opacity=".8"><ellipse cx="95" cy="170" rx="22" ry="58" transform="rotate(-42 95 170)"/><ellipse cx="155" cy="92" rx="22" ry="58" transform="rotate(38 155 92)"/><ellipse cx="985" cy="1180" rx="22" ry="58" transform="rotate(-42 985 1180)"/><ellipse cx="925" cy="1255" rx="22" ry="58" transform="rotate(38 925 1255)"/></g><rect x="34" y="34" width="1012" height="1282" rx="28" fill="none" stroke="#b7a987" stroke-width="3" stroke-dasharray="8 12"/></svg>`),
    textConfig: {
      photoArea: { x: 78, y: 120, width: 924, height: 870, fit: "cover" },
      decorations: ["botanical-corners", "dashed-frame"],
      texts: [
        { text: "{{eventName}}", x: 540, y: 1095, align: "center", fontSize: 48, color: "#3f4c3a" },
        { text: "{{eventDate}}", x: 540, y: 1155, align: "center", fontSize: 32, color: "#6e765f" },
        { text: "{{location}}", x: 540, y: 1210, align: "center", fontSize: 26, color: "#8a8f78" },
      ],
    },
  },
  {
    id: "champagne-classic-template",
    name: "Champagne Classic",
    width: 1080,
    height: 1350,
    background: svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="#fbf4e5"/><rect x="25" y="25" width="1030" height="1300" fill="none" stroke="#c9a46a" stroke-width="5"/><rect x="52" y="52" width="976" height="1246" fill="none" stroke="#e2c894" stroke-width="2"/><circle cx="110" cy="110" r="38" fill="none" stroke="#c9a46a" stroke-width="3"/><circle cx="970" cy="110" r="38" fill="none" stroke="#c9a46a" stroke-width="3"/><circle cx="110" cy="1240" r="38" fill="none" stroke="#c9a46a" stroke-width="3"/><circle cx="970" cy="1240" r="38" fill="none" stroke="#c9a46a" stroke-width="3"/><path d="M160 1120h760" stroke="#d7b875" stroke-width="2"/><path d="M470 1060q70-55 140 0" fill="none" stroke="#c9a46a" stroke-width="3"/></svg>`),
    textConfig: {
      photoArea: { x: 92, y: 115, width: 896, height: 865, fit: "cover" },
      decorations: ["double-gold-frame", "corner-medallions"],
      texts: [
        { text: "{{eventName}}", x: 540, y: 1095, align: "center", fontSize: 50, color: "#5c4630" },
        { text: "{{eventDate}}", x: 540, y: 1160, align: "center", fontSize: 32, color: "#927344" },
        { text: "{{location}}", x: 540, y: 1215, align: "center", fontSize: 26, color: "#a88756" },
      ],
    },
  },
  {
    id: "romantic-polaroid-template",
    name: "Romantic Polaroid",
    width: 1080,
    height: 1350,
    background: svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="#f5e7e2"/><path d="M0 0h1080v170q-270 110-540 0T0 170Z" fill="#e5c3bc"/><path d="M0 1180q270-110 540 0t540 0v170H0Z" fill="#e9ccc5"/><g fill="#fff9f5" fill-opacity=".75"><circle cx="130" cy="130" r="14"/><circle cx="950" cy="130" r="14"/><circle cx="115" cy="1210" r="10"/><circle cx="965" cy="1210" r="10"/></g><rect x="35" y="35" width="1010" height="1280" rx="34" fill="none" stroke="#c7958b" stroke-width="3"/><path d="M80 1050q460 90 920 0" fill="none" stroke="#c7958b" stroke-width="2"/></svg>`),
    textConfig: {
      photoArea: { x: 105, y: 170, width: 870, height: 785, fit: "cover" },
      decorations: ["rounded-polaroid-border", "soft-pink-corners"],
      texts: [
        { text: "{{eventName}}", x: 540, y: 1085, align: "center", fontSize: 50, color: "#5a3e3a" },
        { text: "{{eventDate}}", x: 540, y: 1150, align: "center", fontSize: 32, color: "#8d625b" },
        { text: "{{location}}", x: 540, y: 1205, align: "center", fontSize: 26, color: "#a4776f" },
      ],
    },
  },
  {
    id: "modern-minimal-template",
    name: "Modern Minimal",
    width: 1080,
    height: 1350,
    background: svgData(`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect width="1080" height="1350" fill="#f8f7f3"/><rect x="38" y="38" width="1004" height="1274" fill="none" stroke="#68635d" stroke-width="2"/><path d="M38 1120h1004" stroke="#c6a878" stroke-width="3"/><path d="M80 90h220M780 1260h220" stroke="#c6a878" stroke-width="8"/><circle cx="540" cy="1080" r="9" fill="#c6a878"/><circle cx="510" cy="1080" r="3" fill="#68635d"/><circle cx="570" cy="1080" r="3" fill="#68635d"/></svg>`),
    textConfig: {
      photoArea: { x: 82, y: 92, width: 916, height: 930, fit: "cover" },
      decorations: ["minimal-line-frame", "gold-divider"],
      texts: [
        { text: "{{eventName}}", x: 540, y: 1170, align: "center", fontSize: 48, color: "#302e2b" },
        { text: "{{eventDate}}", x: 540, y: 1225, align: "center", fontSize: 31, color: "#625d56" },
        { text: "{{location}}", x: 540, y: 1270, align: "center", fontSize: 25, color: "#83796d" },
      ],
    },
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@momenkita.id";
  const password = process.env.ADMIN_PASSWORD ?? "ubah-password-ini";
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: await hash(password, 12), name: "Admin Momen Kita" },
  });
  for (const template of PHOTOBOOTH_TEMPLATES) {
    await prisma.template.upsert({
      where: { id: template.id },
      update: { name: template.name, width: template.width, height: template.height, background: template.background, textConfig: template.textConfig },
      create: template,
    });
  }
  const template = PHOTOBOOTH_TEMPLATES[0];
  const eventData = {
      name: "Auliya Insani Putri & Mahfud",
      date: new Date("2026-08-08T00:00:00.000Z"),
      location: "Bansari, Temanggung",
      description: "Terima kasih telah menjadi bagian dari hari istimewa kami.",
      primaryColor: "#2b2927",
      secondaryColor: "#e6cdbd",
      templateId: template.id,
      active: true,
      photoLimit: 3,
      saveOriginal: true,
      allowVideo: true,
      videoDuration: 30,
      allowVoiceNote: true,
      voiceNoteDuration: 60,
      allowMessage: true,
      allowPublicGallery: true,
      slug: "putri-mahfud",
    };
  const existingEvent = await prisma.event.findUnique({ where: { slug: eventData.slug } });
  if (existingEvent) {
    await prisma.event.update({ where: { id: existingEvent.id }, data: { ...eventData, eventCode: normalizeEventCode(eventData.name) } });
  } else {
    await createEventWithGeneratedCode(eventData);
  }
  console.log(`Admin siap: ${email}`);
}

main().finally(() => prisma.$disconnect());
