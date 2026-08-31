import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/storage";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  const kind = request.nextUrl.searchParams.get("kind");
  if (kind !== "original" && kind !== "final") return NextResponse.json({ error: "Jenis file tidak valid." }, { status: 400 });
  const photo = await prisma.photo.findUnique({ where: { id: (await params).id } });
  const key = kind === "original" ? photo?.originalUrl : photo?.finalUrl;
  if (!photo || !key) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
  try {
    const data = await storage.readFile(key);
    return new NextResponse(new Uint8Array(data), { headers: { "Content-Type": "image/jpeg", "Content-Disposition": `attachment; filename="momen-${photo.id}-${kind}.jpg"` } });
  } catch { return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 }); }
}
