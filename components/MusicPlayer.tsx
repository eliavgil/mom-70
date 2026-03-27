"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Song {
  id: string;
  name: string;
  songName: string;
  dedicator: string;
}

export default function MusicPlayer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch("/api/songs")
      .then((r) => r.json())
      .then((d) => setSongs(d.songs || []));
  }, []);

  const loadSong = useCallback(
    (index: number, autoplay: boolean) => {
      const audio = audioRef.current;
      if (!audio || !songs.length) return;
      audio.src = `/api/audio/${songs[index].id}`;
      audio.load();
      if (autoplay) {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        setIsPlaying(false);
      }
    },
    [songs]
  );

  useEffect(() => {
    if (songs.length) loadSong(currentIndex, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songs]);

  const goNext = useCallback(() => {
    const next = (currentIndex + 1) % songs.length;
    setCurrentIndex(next);
    loadSong(next, true);
  }, [currentIndex, songs.length, loadSong]);

  const goPrev = useCallback(() => {
    const audio = audioRef.current;
    // If more than 3s into song, restart; else go previous
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prev = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentIndex(prev);
    loadSong(prev, isPlaying);
  }, [currentIndex, songs.length, loadSong, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const val = Number(e.target.value);
    audio.currentTime = (val / 100) * duration;
    setProgress(val);
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!songs.length) return null;

  const current = songs[currentIndex];

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={goNext}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (!a) return;
          setCurrentTime(a.currentTime);
          setProgress((a.currentTime / (a.duration || 1)) * 100);
        }}
        onLoadedMetadata={() => {
          const a = audioRef.current;
          if (a) setDuration(a.duration);
        }}
      />

      {/* Floating player */}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 16,
          zIndex: 50,
          background: "linear-gradient(160deg, #1a0e04 0%, #2d1800 100%)",
          border: "1px solid rgba(180,140,60,0.45)",
          borderRadius: 18,
          boxShadow: isExpanded
            ? "0 12px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,160,60,0.2)"
            : "0 6px 24px rgba(0,0,0,0.6)",
          transition: "all 0.3s ease",
          minWidth: isExpanded ? 270 : 44,
          overflow: "hidden",
          direction: "ltr",
        }}
      >
        {/* Collapsed: just a music note button */}
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.3rem",
              color: isPlaying ? "#fbbf24" : "#c8a060",
            }}
            title="פתח נגן מוזיקה"
          >
            {isPlaying ? "🎵" : "🎶"}
          </button>
        ) : (
          <div style={{ padding: "12px 14px" }}>
            {/* Header row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span
                style={{ fontSize: "0.6rem", color: "#c8a060", fontWeight: 600, letterSpacing: "0.08em" }}
              >
                🎵 שירים ליומולדת 60
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#c8a060",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  lineHeight: 1,
                  padding: "2px 4px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Song info */}
            <div style={{ marginBottom: 10, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "#fff8e7",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  marginBottom: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 240,
                }}
              >
                {current.songName}
              </div>
              {current.dedicator && (
                <div style={{ fontSize: "0.68rem", color: "#d4a060" }}>
                  🎤 {current.dedicator}
                </div>
              )}
              <div style={{ fontSize: "0.6rem", color: "#8a6030", marginTop: 2 }}>
                {currentIndex + 1} / {songs.length}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 8 }}>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={handleSeek}
                style={{
                  width: "100%",
                  height: 3,
                  accentColor: "#d4a020",
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.58rem",
                  color: "#8a6030",
                  marginTop: 2,
                }}
              >
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ControlBtn onClick={goPrev} title="הקודם">⏮</ControlBtn>
              <button
                onClick={togglePlay}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#d4a020,#a07010)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 10px rgba(200,150,0,0.4)",
                  color: "#1a0e04",
                }}
                title={isPlaying ? "עצור" : "נגן"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <ControlBtn onClick={goNext} title="הבא">⏭</ControlBtn>
            </div>

            {/* Song list */}
            <SongList
              songs={songs}
              currentIndex={currentIndex}
              onSelect={(i) => {
                setCurrentIndex(i);
                loadSong(i, true);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

function ControlBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(200,160,60,0.25)",
        cursor: "pointer",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#c8a060",
      }}
    >
      {children}
    </button>
  );
}

function SongList({
  songs,
  currentIndex,
  onSelect,
}: {
  songs: Song[];
  currentIndex: number;
  onSelect: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-active="true"]`);
      activeEl?.scrollIntoView({ block: "nearest" });
    }
  }, [open, currentIndex]);

  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(200,160,60,0.2)",
          borderRadius: 8,
          padding: "5px 8px",
          color: "#c8a060",
          fontSize: "0.65rem",
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        {open ? "▲ סגור רשימה" : "▼ כל השירים"}
      </button>

      {open && (
        <div
          ref={listRef}
          style={{
            maxHeight: 180,
            overflowY: "auto",
            marginTop: 6,
            borderRadius: 8,
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(200,160,60,0.15)",
          }}
        >
          {songs.map((song, i) => (
            <button
              key={song.id}
              data-active={i === currentIndex}
              onClick={() => onSelect(i)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "7px 10px",
                background: i === currentIndex ? "rgba(212,160,32,0.18)" : "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                cursor: "pointer",
                color: i === currentIndex ? "#fbbf24" : "#c8a060",
              }}
            >
              <div style={{ fontSize: "0.7rem", fontWeight: 600 }}>
                {i === currentIndex ? "▶ " : ""}{song.songName}
              </div>
              {song.dedicator && (
                <div style={{ fontSize: "0.6rem", color: "#8a6030" }}>
                  {song.dedicator}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
