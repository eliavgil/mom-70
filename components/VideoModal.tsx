"use client";

import { useEffect } from "react";
import { MediaItem, formatDate } from "@/lib/parseFilename";

export default function VideoModal({
  item,
  onClose,
}: {
  item: MediaItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: "rgba(0,4,12,0.96)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white text-3xl leading-none hover:text-blue-300 transition-colors"
        aria-label="סגור"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        ✕
      </button>

      {/* Video */}
      <div
        className="w-full rounded overflow-hidden"
        style={{
          maxWidth: "min(96vw, 960px)",
          aspectRatio: "16 / 9",
          boxShadow:
            "0 0 0 3px rgba(255,255,255,0.1), 0 24px 60px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://drive.google.com/file/d/${item.id}/preview`}
          className="w-full h-full"
          allow="autoplay"
          allowFullScreen
          style={{ border: "none", display: "block" }}
          title={item.title}
        />
      </div>

      <div className="text-center mt-5">
        <div className="text-blue-300 text-sm">
          {formatDate(item.year, item.month, item.day)}
        </div>
        <div className="text-white text-xl font-bold mt-1">{item.title}</div>
      </div>
    </div>
  );
}
