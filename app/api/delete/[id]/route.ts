import { NextRequest, NextResponse } from "next/server";
import { getDrive } from "@/lib/driveUpload";
import { supabase } from "@/lib/supabase";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const drive = getDrive();
    await drive.files.delete({ fileId: id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Clean up Supabase records (ignore errors)
  await Promise.all([
    supabase.from("descriptions").delete().eq("file_id", id),
    supabase.from("overrides").delete().eq("file_id", id),
  ]);

  return NextResponse.json({ ok: true });
}
