import { parseFilename, MediaItem } from "@/lib/parseFilename";
import { supabase } from "@/lib/supabase";
import Timeline from "@/components/Timeline";

export const dynamic = "force-dynamic";

async function fetchMediaItems(): Promise<MediaItem[]> {
  const API_KEY = process.env.GOOGLE_API_KEY;
  const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!API_KEY || !FOLDER_ID) {
    console.error("Missing GOOGLE_API_KEY or GOOGLE_DRIVE_FOLDER_ID");
    return [];
  }

  try {
    const [driveRes, { data: descRows }, { data: overrideRows }] = await Promise.all([
      fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
          `'${FOLDER_ID}' in parents and trashed=false`
        )}&key=${API_KEY}&fields=${encodeURIComponent(
          "files(id,name,mimeType)"
        )}&pageSize=1000`,
        { cache: "no-store" }
      ),
      supabase.from("descriptions").select("file_id, text"),
      supabase.from("overrides").select("file_id, title, year, month, day"),
    ]);

    const data = await driveRes.json();
    if (data.error) {
      console.error("Drive API error:", data.error.message);
      return [];
    }

    const descMap = new Map((descRows ?? []).map((r) => [r.file_id, r.text]));
    const overrideMap = new Map((overrideRows ?? []).map((r) => [r.file_id, r]));

    const items: MediaItem[] = [];
    for (const file of data.files ?? []) {
      const parsed = parseFilename(file.name);
      if (!parsed) continue;

      let { year, month, day, title } = parsed;

      // Apply overrides if they exist
      const ov = overrideMap.get(file.id);
      if (ov) {
        if (ov.title != null) title = ov.title;
        if (ov.year != null) year = ov.year;
        if (ov.month != null) month = ov.month;
        if (ov.day != null) day = ov.day;
      }

      items.push({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType ?? "",
        isVideo: (file.mimeType ?? "").startsWith("video/"),
        year,
        month,
        day,
        title,
        sortKey: year * 10000 + (month || 6) * 100 + (day || 0),
        description: descMap.get(file.id),
      });
    }

    return items.sort((a, b) => b.sortKey - a.sortKey);
  } catch (e) {
    console.error("Failed to fetch data:", e);
    return [];
  }
}

export default async function Home() {
  const items = await fetchMediaItems();
  return <Timeline items={items} />;
}
