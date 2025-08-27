import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { parse } from "csv-parse/sync";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Missing CSV file" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const rows = parse(buf, { columns: true, skip_empty_lines: true });
  let inserted = 0;
  for (const r of rows) {
    if (!r.dealerId) continue;
    await prisma.vehicle.create({
      data: {
        dealerId: String(r.dealerId),
        make: String(r.make||"").trim(),
        model: String(r.model||"").trim(),
        year: parseInt(String(r.year||"0"), 10) || 0,
        price: parseInt(String(r.price||"0"), 10) || 0,
        mileage: r.mileage ? parseInt(String(r.mileage), 10) : null,
        description: String(r.description||"").trim()
      }
    });
    inserted += 1;
  }
  return NextResponse.json({ ok: true, inserted });
}
