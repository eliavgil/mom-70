export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const API_KEY = process.env.GOOGLE_API_KEY;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${API_KEY}`
  );

  if (!res.ok) {
    return new Response("Not found", { status: 404 });
  }

  const body = await res.arrayBuffer();
  const contentType = res.headers.get("content-type") ?? "image/jpeg";

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
