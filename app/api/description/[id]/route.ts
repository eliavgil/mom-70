import { supabase } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data } = await supabase
    .from("descriptions")
    .select("text")
    .eq("file_id", id)
    .single();

  return Response.json({ text: data?.text ?? null });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { text } = await req.json();

  if (text?.trim()) {
    await supabase.from("descriptions").upsert({
      file_id: id,
      text: text.trim(),
      updated_at: new Date().toISOString(),
    });
  } else {
    await supabase.from("descriptions").delete().eq("file_id", id);
  }

  return Response.json({ ok: true });
}
