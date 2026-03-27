export interface MediaItem {
  id: string;
  name: string;
  mimeType: string;
  isVideo: boolean;
  year: number;
  month: number;
  day: number;
  title: string;
  sortKey: number;
  description?: string;
}

const hebrewMonths: Record<string, number> = {
  ינואר: 1, פברואר: 2, מרץ: 3, אפריל: 4,
  מאי: 5, יוני: 6, יולי: 7, אוגוסט: 8,
  ספטמבר: 9, אוקטובר: 10, נובמבר: 11, דצמבר: 12,
};

const monthNames = [
  "", "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

export function parseFilename(
  filename: string
): { year: number; month: number; day: number; title: string } | null {
  const name = filename.replace(/\.[^.]+$/, "").trim();

  const sepIdx = name.indexOf(" - ");

  let datePart: string;
  let title: string;

  if (sepIdx === -1) {
    // No separator — try whole name as a date
    datePart = name;
    title = "";
  } else {
    datePart = name.substring(0, sepIdx).trim();
    title = name.substring(sepIdx + 3).trim();
    if (!datePart) return null;
  }

  const date = parseDate(datePart);
  if (!date) return null;

  // If no title, use year (or month+year) as title
  if (!title) title = formatDate(date.year, date.month, date.day);

  return { ...date, title };
}

function expandYear(y: number): number {
  if (y >= 100) return y;
  return y < 30 ? 2000 + y : 1900 + y;
}

function parseDate(s: string): { year: number; month: number; day: number } | null {
  // ── Full date with Hebrew month: "26 מרץ 2026", "26 מרץ 26" ──
  for (const [name, num] of Object.entries(hebrewMonths)) {
    // day + month + year: "26 מרץ 2026"
    const m1 = s.match(new RegExp(`^(\\d{1,2})\\s+${name}\\s+(\\d{2,4})$`));
    if (m1) return { day: +m1[1], month: num, year: expandYear(+m1[2]) };

    // month + year only: "מרץ 2020" or "2020 מרץ"
    const m2 = s.match(new RegExp(`^${name}\\s+(\\d{2,4})$`));
    if (m2) return { day: 0, month: num, year: expandYear(+m2[1]) };
    const m3 = s.match(new RegExp(`^(\\d{2,4})\\s+${name}$`));
    if (m3) return { day: 0, month: num, year: expandYear(+m3[1]) };
  }

  // ── Full numeric date: "26.3.2026", "26/3/2026", "26-3-2026" ──
  const full = s.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})$/);
  if (full) {
    return { day: +full[1], month: +full[2], year: expandYear(+full[3]) };
  }

  // ── Month + year only: "4/1999", "5.1970", "4-1999" or reversed "1999/4" ──
  const m =
    s.match(/^(\d{1,2})[\/\.\-](\d{4})$/) ||
    s.match(/^(\d{4})[\/\.\-](\d{1,2})$/);
  if (m) {
    const a = +m[1], b = +m[2];
    return a > 12
      ? { day: 0, year: a, month: b }
      : { day: 0, year: b, month: a };
  }

  // ── Year only: "1970" ──
  const y = s.match(/^(\d{4})$/);
  if (y) return { day: 0, year: +y[1], month: 0 };

  return null;
}

export function formatDate(year: number, month: number, day = 0): string {
  if (!month) return `${year}`;
  if (!day) return `${monthNames[month]} ${year}`;
  return `${day} ${monthNames[month]} ${year}`;
}
