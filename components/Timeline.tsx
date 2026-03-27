"use client";

import { useState, useEffect } from "react";
import { MediaItem } from "@/lib/parseFilename";
import MediaCard from "./MediaCard";
import Lightbox from "./Lightbox";
import VideoModal from "./VideoModal";
import MusicPlayer from "./MusicPlayer";
import PolarBear from "./PolarBear";
import UploadModal from "./UploadModal";
import EditModal from "./EditModal";

/* ── deterministic pseudo-random ── */
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

/* Round to N decimal places to reduce precision noise */
function r(n: number, decimals = 3) {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

function buildSnowflakes(count: number) {
  const chars = ["❄", "❅", "❆", "·", "∗"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: r(seededRand(i * 3) * 100),
    duration: r(9 + seededRand(i * 7) * 8),
    delay: r(-(seededRand(i * 11) * 12)),
    size: r(0.55 + seededRand(i * 13) * 1.1),
    char: chars[i % chars.length],
  }));
}

function buildStars(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: r(seededRand(i * 17) * 100),
    top: r(seededRand(i * 19) * 65),
    size: 1 + Math.floor(seededRand(i * 23) * 2.5),
    delay: r(seededRand(i * 29) * 4),
    duration: r(2 + seededRand(i * 31) * 3),
  }));
}

/* ── Year banner shown when decade changes ── */
function YearBanner({ year }: { year: number }) {
  return (
    <div className="flex items-center justify-center my-6 relative z-20">
      <div
        className="px-6 py-1 rounded-full text-sm font-bold tracking-wider"
        style={{
          background: "rgba(15,40,80,0.85)",
          border: "1px solid rgba(120,200,255,0.4)",
          color: "#a8d8f0",
          boxShadow: "0 0 12px rgba(100,180,255,0.2)",
        }}
      >
        {year}
      </div>
    </div>
  );
}

export default function Timeline({ items: initialItems }: { items: MediaItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [bearY, setBearY] = useState(8);
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [videoItem, setVideoItem] = useState<MediaItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  // Render decorative elements only on client to avoid SSR/hydration mismatch
  const [snowflakes, setSnowflakes] = useState<ReturnType<typeof buildSnowflakes>>([]);
  const [stars, setStars] = useState<ReturnType<typeof buildStars>>([]);

  useEffect(() => {
    setSnowflakes(buildSnowflakes(45));
    setStars(buildStars(90));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? 7 + (window.scrollY / max) * 80 : 7;
      setBearY(pct);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* group items by year for year banners */
  const rendered: React.ReactNode[] = [];
  let lastYear = 0;
  let cardIndex = 0;
  for (const item of items) {
    if (item.year !== lastYear) {
      rendered.push(<YearBanner key={`yr-${item.year}`} year={item.year} />);
      lastYear = item.year;
    }
    const idx = cardIndex++;
    rendered.push(
      <MediaCard
        key={item.id}
        item={item}
        index={idx}
        editMode={editMode}
        onImageClick={() => setLightboxItem(item)}
        onVideoClick={() => setVideoItem(item)}
        onEditClick={() => setEditItem(item)}
        onDeleted={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
      />
    );
  }

  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          "linear-gradient(180deg, #04080f 0%, #071220 25%, #0a1c38 60%, #112855 100%)",
      }}
    >
      {/* ── Stars ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Snowflakes ── */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
        {snowflakes.map((s) => (
          <span
            key={s.id}
            className="absolute select-none text-white"
            style={{
              left: `${s.left}%`,
              top: "-30px",
              fontSize: `${s.size}rem`,
              animation: `snowfall ${s.duration}s linear ${s.delay}s infinite`,
              opacity: 0.65,
            }}
          >
            {s.char}
          </span>
        ))}
      </div>

      {/* ── Timeline path ── */}
      <div
        className="fixed top-0 bottom-0 pointer-events-none z-20"
        style={{
          left: "50%",
          width: 2,
          transform: "translateX(-50%)",
          background:
            "linear-gradient(to bottom, transparent, rgba(160,210,255,0.35) 8%, rgba(160,210,255,0.35) 92%, transparent)",
          animation: "pathPulse 3.5s ease-in-out infinite",
        }}
      />

      {/* ── Polar bear ── */}
      <div
        className="fixed pointer-events-none z-30"
        style={{
          left: "50%",
          top: `${bearY}vh`,
          transform: "translate(-50%, -50%)",
          transition: "top 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)",
          filter: "drop-shadow(0 0 16px rgba(200,240,255,0.8))",
        }}
      >
        <div style={{ animation: "bearWalk 1s ease-in-out infinite" }}>
          <PolarBear size={42} />
        </div>
      </div>

      {/* ── Header ── */}
      <header className="relative z-20 text-center pt-20 pb-10 px-4">
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight px-2"
          style={{ textShadow: "0 0 50px rgba(100,200,255,0.55)" }}
        >
          🎂 מזל טוב מאמזו מאמז 🎂
        </h1>
        <p className="mt-3 text-lg sm:text-xl md:text-3xl font-light text-blue-200 opacity-90">
          70 שנה עברו, ממשיכים לעוד 70
        </p>
        <div
          className="mt-10 text-blue-300 text-3xl"
          style={{ animation: "bearWalk 1.5s ease-in-out infinite" }}
        >
          ↓
        </div>
      </header>

      {/* ── Cards ── */}
      <main className="relative z-20 pb-40 max-w-5xl mx-auto px-4">
        {items.length === 0 ? (
          <div className="text-center text-blue-200 py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl font-medium">לא נמצאו תמונות</p>
            <p className="text-sm mt-2 opacity-60">
              ודא שהתיקייה ב-Drive ציבורית ושהקבצים ממוינים בפורמט הנכון
            </p>
          </div>
        ) : (
          rendered
        )}
      </main>

      {/* ── Upload button ── */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed z-40 flex items-center justify-center rounded-full transition-transform hover:scale-110"
        style={{
          bottom: 20,
          left: 16,
          width: 44,
          height: 44,
          fontSize: "1.4rem",
          background: "linear-gradient(135deg, #d4a020, #a07010)",
          boxShadow: "0 4px 20px rgba(200,150,0,0.4)",
          border: "none",
          cursor: "pointer",
        }}
        title="הוסף תמונה"
      >
        +
      </button>

      {/* ── Edit mode toggle ── */}
      <button
        onClick={() => setEditMode((v) => !v)}
        className="fixed z-40 flex items-center justify-center rounded-full transition-transform hover:scale-110"
        style={{
          bottom: 74,
          left: 16,
          width: 44,
          height: 44,
          fontSize: "1rem",
          background: editMode
            ? "linear-gradient(135deg,#1d4ed8,#1e3a8a)"
            : "rgba(30,58,138,0.7)",
          boxShadow: editMode
            ? "0 0 0 3px rgba(96,165,250,0.6), 0 4px 20px rgba(37,99,235,0.5)"
            : "0 4px 20px rgba(0,0,0,0.4)",
          border: editMode ? "2px solid #60a5fa" : "2px solid rgba(96,165,250,0.3)",
          cursor: "pointer",
          color: "white",
        }}
        title={editMode ? "צא ממצב עריכה" : "מצב עריכה"}
      >
        ✏️
      </button>

      {editMode && (
        <div
          className="fixed z-40 text-xs text-blue-200 font-medium"
          style={{ bottom: 126, left: 10, background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "3px 7px" }}
        >
          לחץ על תמונה לעריכה
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {editItem && <EditModal item={editItem} onClose={() => setEditItem(null)} />}

      {lightboxItem && (
        <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
      )}
      {videoItem && (
        <VideoModal item={videoItem} onClose={() => setVideoItem(null)} />
      )}

      <MusicPlayer />
    </div>
  );
}
