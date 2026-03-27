"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MediaItem, formatDate } from "@/lib/parseFilename";

export default function Lightbox({
  item,
  onClose,
}: {
  item: MediaItem;
  onClose: () => void;
}) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState(`/api/img/${item.id}`);

  // Description state
  const [text, setText] = useState(item.description ?? "");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editing) setEditing(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, editing]);

  function openEdit() {
    setEditText(text);
    setError("");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/description/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText }),
      });
      if (!res.ok) throw new Error();
      setText(editText.trim());
      setEditing(false);
      router.refresh(); // update ✍️ indicator on cards
    } catch {
      setError("Save failed, try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,4,12,0.94)", backdropFilter: "blur(4px)" }}
      onClick={() => { if (!editing) onClose(); }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white text-3xl leading-none hover:text-blue-300 transition-colors"
        style={{ background: "none", border: "none", cursor: "pointer" }}
        aria-label="סגור"
      >
        ✕
      </button>

      {/* Content */}
      <div
        className="flex flex-col items-center overflow-y-auto"
        style={{ maxWidth: "min(96vw, 1000px)", maxHeight: "94vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spinner */}
        {!loaded && (
          <div className="flex items-center justify-center text-white"
            style={{ width: 300, height: 220, fontSize: "3rem" }}>
            <span style={{ animation: "bearWalk 1s ease-in-out infinite" }}>❄</span>
          </div>
        )}

        {/* Image */}
        <img
          src={src}
          alt={item.title}
          className="rounded"
          style={{
            maxWidth: "100%",
            maxHeight: "70vh",
            objectFit: "contain",
            display: loaded ? "block" : "none",
            boxShadow: "0 0 0 3px rgba(255,255,255,0.1), 0 24px 60px rgba(0,0,0,0.8)",
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setSrc("")}
        />

        {loaded && (
          <div className="w-full mt-4 px-2" style={{ maxWidth: 700 }}>
            {/* Date + title */}
            <div className="text-center">
              <div className="text-blue-300 text-sm">{formatDate(item.year, item.month, item.day)}</div>
              <div className="text-white text-xl font-bold mt-1">{item.title}</div>
            </div>

            {/* Description or edit form */}
            {editing ? (
              <div className="mt-4">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={4}
                  dir="rtl"
                  placeholder="Write something about this photo..."
                  className="w-full rounded p-3 text-sm resize-none"
                  style={{
                    background: "rgba(255,248,220,0.08)",
                    color: "#e8dfc0",
                    border: "1px solid rgba(255,220,100,0.3)",
                    outline: "none",
                  }}
                  autoFocus
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-1.5 rounded text-sm text-white/60 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-1.5 rounded text-sm font-semibold transition-opacity"
                    style={{
                      background: "#d4a020",
                      color: "#1a0e00",
                      border: "none",
                      cursor: saving ? "wait" : "pointer",
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
                {error && (
                  <p className="text-red-400 text-xs mt-1">{error}</p>
                )}
              </div>
            ) : (
              <div className="mt-3">
                {text && (
                  <div
                    className="text-right rounded p-3 mb-3"
                    style={{
                      background: "rgba(255,248,220,0.07)",
                      border: "1px solid rgba(255,220,100,0.2)",
                      color: "#e8dfc0",
                      fontSize: "0.95rem",
                      lineHeight: 1.75,
                      whiteSpace: "pre-wrap",
                    }}
                    dir="rtl"
                  >
                    {text}
                  </div>
                )}
                <div className="flex justify-center">
                  <button
                    onClick={openEdit}
                    className="text-sm text-white/40 hover:text-white/80 transition-colors flex items-center gap-1"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    <span>✏️</span>
                    <span>{text ? "Edit text" : "Add text"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
