import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const MAX_CODE_LENGTH = 120;

export function normalizeEventCode(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s*&\s*/g, "&")
    .replace(/[^\p{L}\p{N}&\s-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CODE_LENGTH);
}

export function slugifyEventName(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.slice(0, 100) || "event";
}

export async function generateUniqueEventSlug(name: string) {
  const base = slugifyEventName(name);
  let candidate = base;
  let suffix = 2;
  while (await prisma.event.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export function isGeneratedEventCode(code: string, eventName: string) {
  const base = normalizeEventCode(eventName);
  return code === base || new RegExp(`^${escapeRegExp(base)}-\\d+$`).test(code);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function generateUniqueEventCode(name: string, excludeId?: string, disallowCode?: string) {
  const base = normalizeEventCode(name);
  if (!base) throw new Error("Nama event tidak menghasilkan kode yang valid.");

  let candidate = base;
  let suffix = 2;
  while (true) {
    const existing = await prisma.event.findUnique({
      where: { eventCode: candidate },
      select: { id: true },
    });
    if ((!existing || existing.id === excludeId) && candidate !== disallowCode) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function createEventWithGeneratedCode(
  data: Omit<Prisma.EventUncheckedCreateInput, "eventCode">,
) {
  return prisma.event.create({
    data: { ...data, eventCode: await generateUniqueEventCode(data.name) },
  });
}

export async function updateEventWithGeneratedCode(
  id: string,
  data: Omit<Prisma.EventUncheckedUpdateInput, "eventCode">,
  current: { name: string; eventCode: string },
) {
  const eventCode = isGeneratedEventCode(current.eventCode, current.name)
    ? await generateUniqueEventCode(String(data.name ?? current.name), id)
    : current.eventCode;
  return prisma.event.update({ where: { id }, data: { ...data, eventCode } });
}
