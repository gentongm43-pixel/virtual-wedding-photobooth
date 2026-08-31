"use client";

/* Template assets are configured by administrators. */
/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import {
  configFromTemplateRecord,
  normalizeTemplate,
  resolveTemplateText,
  type TemplateText,
} from "@/lib/image/template-config";

export type PreviewTemplate = {
  id: string;
  name: string;
  width: number;
  height: number;
  background: string | null;
  overlay: string | null;
  logo: string | null;
  textConfig: {
    photoSlots?: { x: number; y: number; width: number; height: number }[];
    photoArea?: { x: number; y: number; width: number; height: number };
    texts?: TemplateText[];
  } | null;
};

export function PhotoPreview({
  photoUrl,
  photoUrls,
  template,
  eventName,
  eventDate,
  location,
}: {
  photoUrl?: string;
  photoUrls?: string[];
  template?: PreviewTemplate | null;
  eventName: string;
  eventDate: string;
  location?: string | null;
}) {
  const config = template ? configFromTemplateRecord(template) : normalizeTemplate();
  const { width, height, photoSlots, texts } = config;
  const variables = { eventName, eventDate, location: location ?? "" };
  const layerStyle = { aspectRatio: `${width} / ${height}` } as CSSProperties;
  return <div className="relative w-full overflow-hidden rounded-xl bg-[#f5ede7]" style={{ ...layerStyle, containerType: "inline-size" }}>
    {config.background && <img src={config.background} alt="" className="absolute inset-0 h-full w-full object-cover" />}
    {(photoUrls ?? (photoUrl ? [photoUrl] : [])).map((url, index) => {
      const area = photoSlots[index];
      return area ? <img key={`${url}-${index}`} src={url} alt="" className="absolute object-cover" style={{ left: `${(area.x / width) * 100}%`, top: `${(area.y / height) * 100}%`, width: `${(area.width / width) * 100}%`, height: `${(area.height / height) * 100}%` }} /> : null;
    })}
    {config.logo && <img src={config.logo} alt="" className="absolute left-1/2 top-[1.5%] max-h-[12%] max-w-[80%] -translate-x-1/2 object-contain" />}
    {texts.map((item, index) => <span key={`${item.text}-${index}`} className="absolute whitespace-nowrap font-semibold" style={{ left: `${(item.x / width) * 100}%`, top: `${(item.y / height) * 100}%`, transform: `${item.align === "left" ? "translate(0, -100%)" : item.align === "right" ? "translate(-100%, -100%)" : "translate(-50%, -100%)"}`, color: item.color ?? "#332b27", fontFamily: item.fontFamily ?? "Arial", fontSize: `clamp(0.45rem, ${(item.fontSize ?? 32) / width * 100}cqw, 2rem)`, textAlign: item.align ?? "center" }}>{resolveTemplateText(item.text, variables)}</span>)}
    {config.overlay && <img src={config.overlay} alt="" className="absolute inset-0 h-full w-full object-fill" />}
  </div>;
}
