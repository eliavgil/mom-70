import { uploadToDrive } from "@/lib/driveUpload";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const filename = form.get("filename") as string | null;

    if (!file || !filename) {
      return new Response("Missing file or filename", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToDrive(buffer, filename, file.type);

    return Response.json({ ok: true, id: result.id, name: result.name });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Upload error:", msg);
    return new Response(msg, { status: 500 });
  }
}
