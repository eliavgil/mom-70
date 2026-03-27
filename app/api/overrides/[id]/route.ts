import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { title, year, month, day } = body;

  const { error } = await supabase.from("overrides").upsert({
    file_id: id,
    title: title?.trim() || null,
    year: year ? Number(year) : null,
    month: month !== "" && month != null ? Number(month) : null,
    day: day ? Number(day) : null,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
