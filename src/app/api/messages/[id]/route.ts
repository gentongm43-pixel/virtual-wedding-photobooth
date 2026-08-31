import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 });
  await prisma.message.delete({ where: { id: (await params).id } });
  return NextResponse.json({ ok: true });
}
