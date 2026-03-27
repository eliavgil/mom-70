"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const currentYear = new Date().getFullYear();

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>(String(currentYear));
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function buildFilename() {
    if (!file || !title.trim() || !year) return null;
    const ext = file.name.split(".").pop() ?? "jpg";
    const datePart = month ? `${month} ${year}` : year;
    return `${datePart} - ${title.trim()}.${ext}`;
  }

  async function handleUpload() {
    const filename = buildFilename();
    if (!filename || !file) return;

    setError("");
    setUploading(true);
    setProgress("מעלה...");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("filename", filename);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());

      setProgress("הועלה בהצלחה!");
      setDone(true);
      router.refresh();
    } catch (e) {
      setError("שגיאה בהעלאה, נסה שוב");
      console.error(e);
    } finally {
      setUploading(false);
    }
  }

  const filename = buildFilename();
  const canUpload = !!filename && !uploading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,4,12,0.94)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-xl p-6 relative"
        style={{
          maxWidth: 480,
          background: "linear-gradient(135deg, #0d1f3c, #0a1628)",
          border: "1px solid rgba(100,180,255,0.2)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white/50 hover:text-white text-2xl leading-none transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          ✕
        </button>

        <h2 className="text-white text-xl font-bold mb-5">הוסף תמונה או סרטון</h2>

        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-semibold">הקובץ הועלה בהצלחה!</p>
            <p className="text-blue-300 text-sm mt-1">{filename}</p>
            <div className="flex gap-3 justify-center mt-5">
              <button
                onClick={() => { setDone(false); setFile(null); setTitle(""); setProgress(""); }}
                className="px-4 py-2 rounded-lg text-sm text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer" }}
              >
                העלה עוד
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: "#d4a020", color: "#1a0e00", border: "none", cursor: "pointer" }}
              >
                סגור
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* File picker */}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-lg py-4 text-center transition-colors"
                style={{
                  background: file ? "rgba(100,200,100,0.1)" : "rgba(255,255,255,0.05)",
                  border: `2px dashed ${file ? "rgba(100,200,100,0.4)" : "rgba(100,180,255,0.2)"}`,
                  color: file ? "#90e090" : "#a0c8f0",
                  cursor: "pointer",
                }}
              >
                {file ? (
                  <span>📎 {file.name}</span>
                ) : (
                  <span>לחץ לבחירת קובץ</span>
                )}
              </button>
            </div>

            {/* Date */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-blue-300 text-xs mb-1 block">חודש (אופציונלי)</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                    border: "1px solid rgba(100,180,255,0.2)",
                    outline: "none",
                  }}
                >
                  <option value="">— ללא —</option>
                  {HEBREW_MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div style={{ width: 100 }}>
                <label className="text-blue-300 text-xs mb-1 block">שנה</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min={1950}
                  max={2099}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                    border: "1px solid rgba(100,180,255,0.2)",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-blue-300 text-xs mb-1 block">כיתוב</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="לדוגמה: חתונה של יוני"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  border: "1px solid rgba(100,180,255,0.2)",
                  outline: "none",
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && canUpload) handleUpload(); }}
              />
            </div>

            {/* Filename preview */}
            {filename && (
              <p className="text-white/40 text-xs">
                שם הקובץ: <span className="text-white/70">{filename}</span>
              </p>
            )}

            {/* Error */}
            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!canUpload}
              className="w-full rounded-lg py-3 font-bold text-sm transition-opacity"
              style={{
                background: canUpload ? "#d4a020" : "rgba(255,255,255,0.1)",
                color: canUpload ? "#1a0e00" : "rgba(255,255,255,0.3)",
                border: "none",
                cursor: canUpload ? "pointer" : "default",
                opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? progress : "העלה"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
