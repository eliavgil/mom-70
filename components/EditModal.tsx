"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MediaItem } from "@/lib/parseFilename";

const hebrewMonths = [
  { value: 0, label: "—" },
  { value: 1, label: "ינואר" },
  { value: 2, label: "פברואר" },
  { value: 3, label: "מרץ" },
  { value: 4, label: "אפריל" },
  { value: 5, label: "מאי" },
  { value: 6, label: "יוני" },
  { value: 7, label: "יולי" },
  { value: 8, label: "אוגוסט" },
  { value: 9, label: "ספטמבר" },
  { value: 10, label: "אוקטובר" },
  { value: 11, label: "נובמבר" },
  { value: 12, label: "דצמבר" },
];

interface Props {
  item: MediaItem;
  onClose: () => void;
}

export default function EditModal({ item, onClose }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title);
  const [year, setYear] = useState(String(item.year));
  const [month, setMonth] = useState(item.month);
  const [day, setDay] = useState(item.day ? String(item.day) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim() || !year) {
      setError("כותרת ושנה הם שדות חובה");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/overrides/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          year: Number(year),
          month: month,
          day: day ? Number(day) : 0,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בשמירה, נסה שוב");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 text-right"
        style={{
          background: "linear-gradient(160deg,#0d2040,#0a1830)",
          border: "1px solid rgba(120,200,255,0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        }}
      >
        <h2 className="text-white text-lg font-bold mb-5">עריכת תאריך וכותרת</h2>

        {/* Title */}
        <label className="block text-blue-200 text-sm mb-1">כותרת</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg px-3 py-2 mb-4 text-right text-sm"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(120,200,255,0.3)",
            color: "white",
            outline: "none",
          }}
        />

        {/* Year */}
        <label className="block text-blue-200 text-sm mb-1">שנה</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="1985"
          className="w-full rounded-lg px-3 py-2 mb-4 text-right text-sm"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(120,200,255,0.3)",
            color: "white",
            outline: "none",
          }}
        />

        {/* Month */}
        <label className="block text-blue-200 text-sm mb-1">חודש</label>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="w-full rounded-lg px-3 py-2 mb-4 text-right text-sm"
          style={{
            background: "#0d2040",
            border: "1px solid rgba(120,200,255,0.3)",
            color: "white",
            outline: "none",
          }}
        >
          {hebrewMonths.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Day */}
        <label className="block text-blue-200 text-sm mb-1">יום (אופציונלי)</label>
        <input
          type="number"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          placeholder="1–31"
          min={1}
          max={31}
          className="w-full rounded-lg px-3 py-2 mb-5 text-right text-sm"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(120,200,255,0.3)",
            color: "white",
            outline: "none",
          }}
        />

        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl py-2 text-sm font-bold transition-opacity"
            style={{
              background: "linear-gradient(135deg,#2563eb,#1e40af)",
              color: "white",
              opacity: saving ? 0.6 : 1,
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "שומר..." : "שמור"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2 text-sm font-bold"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "#a0c4e8",
              border: "1px solid rgba(120,200,255,0.2)",
              cursor: "pointer",
            }}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
