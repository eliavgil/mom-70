export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const API_KEY = process.env.GOOGLE_API_KEY;

  // Fetch the thumbnailLink from Drive metadata
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?fields=thumbnailLink&key=${API_KEY}`
  );

  if (!metaRes.ok) return new Response("Not found", { status: 404 });

  const meta = await metaRes.json();
  if (!meta.thumbnailLink) return new Response("No thumbnail", { status: 404 });

  // Drive returns a small thumbnail (s220) — bump it up to s800
  const thumbUrl = meta.thumbnailLink.replace(/=s\d+$/, "=s800");

  const thumbRes = await fetch(thumbUrl);
  if (!thumbRes.ok) return new Response("Thumbnail fetch failed", { status: 502 });

  const body = await thumbRes.arrayBuffer();

  return new Response(body, {
    headers: {
      "Content-Type": thumbRes.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
