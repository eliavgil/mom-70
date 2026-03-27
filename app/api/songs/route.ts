import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const songsFolderId = process.env.GOOGLE_SONGS_FOLDER_ID;

  if (!apiKey || !songsFolderId) {
    return NextResponse.json({ songs: [] });
  }

  const query = encodeURIComponent(
    `'${songsFolderId}' in parents and trashed=false`
  );

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType)&orderBy=name&pageSize=100&key=${apiKey}`,
    { cache: "no-store" }
  );

  const data = await res.json();

  const songs = (data.files || [])
    .filter(
      (f: { name: string; mimeType: string }) =>
        f.mimeType?.includes("audio") || f.name?.toLowerCase().endsWith(".mp3")
    )
    .map((f: { id: string; name: string }) => {
      const base = f.name.replace(/\.mp3$/i, "");
      const dashIdx = base.indexOf(" - ");
      const songName = dashIdx !== -1 ? base.slice(0, dashIdx).trim() : base;
      const dedicator = dashIdx !== -1 ? base.slice(dashIdx + 3).trim() : "";
      return { id: f.id, name: base, songName, dedicator };
    });

  return NextResponse.json({ songs });
}
