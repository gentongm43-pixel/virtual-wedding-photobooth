import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { eventCreateSchema } from "@/lib/validation";
import { createEventWithGeneratedCode, generateUniqueEventSlug } from "@/lib/event-code";

export async function POST(request: Request) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const form = await request.formData();
  const parsed = eventCreateSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return NextResponse.json({ error: "Periksa kembali data event." }, { status: 400 });
  try {
    const event = await createEventWithGeneratedCode({ ...parsed.data, slug: parsed.data.slug || await generateUniqueEventSlug(parsed.data.name), location: parsed.data.location || null, description: parsed.data.description || null, coverImage: parsed.data.coverImage || null, logo: parsed.data.logo || null, primaryColor: parsed.data.primaryColor || null, secondaryColor: parsed.data.secondaryColor || null, templateId: parsed.data.templateId || null });
    return NextResponse.json({ id: event.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) return NextResponse.json({ error: "Slug event sudah digunakan." }, { status: 409 });
    throw error;
  }
}
