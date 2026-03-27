import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const apiKey = process.env.GOOGLE_API_KEY;

  const range = req.headers.get("range");
  const fetchHeaders: Record<string, string> = {};
  if (range) fetchHeaders["range"] = range;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${apiKey}`,
    { headers: fetchHeaders }
  );

  const responseHeaders: Record<string, string> = {
    "Content-Type": res.headers.get("Content-Type") || "audio/mpeg",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
  };

  const contentLength = res.headers.get("Content-Length");
  if (contentLength) responseHeaders["Content-Length"] = contentLength;

  const contentRange = res.headers.get("Content-Range");
  if (contentRange) responseHeaders["Content-Range"] = contentRange;

  return new NextResponse(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}
