export function getPublicEventUrl(slug: string, origin?: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const baseUrl = configuredUrl || (process.env.NODE_ENV !== "production" ? origin : undefined);
  if (!baseUrl) throw new Error("PUBLIC APP URL is not configured.");
  const parsed = new URL(baseUrl);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("PUBLIC APP URL must use http or https.");
  }
  return new URL(`/event/${encodeURIComponent(slug)}`, parsed).toString();
}
