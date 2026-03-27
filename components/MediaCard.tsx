"use client";

import { useRef, useEffect, useState } from "react";
import { MediaItem, formatDate } from "@/lib/parseFilename";

interface Props {
  item: MediaItem;
  index: number;
  editMode: boolean;
  onImageClick: () => void;
  onVideoClick: () => void;
  onEditClick: () => void;
}

export default function MediaCard({
  item,
  index,
  editMode,
  onImageClick,
  onVideoClick,
  onEditClick,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "60px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // In RTL: even index → card on RIGHT (natural start), odd → LEFT
  const onRight = index % 2 === 0;

  return (
    <div
      ref={ref}
      className="media-card-row flex items-center my-10 md:my-14"
      style={{
        flexDirection: onRight ? "row" : "row-reverse",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0)"
          : `translateY(28px) ${onRight ? "translateX(20px)" : "translateX(-20px)"}`,
        transition: "opacity 0.65s ease, transform 0.65s ease",
      }}
    >
      {/* ── Card half ── */}
      <div
        className="media-card-half flex-1 flex"
        style={{ justifyContent: onRight ? "flex-end" : "flex-start" }}
      >
        <div
          style={{
            paddingInlineEnd: onRight ? "1.75rem" : 0,
            paddingInlineStart: onRight ? 0 : "1.75rem",
          }}
        >
          <div style={{ position: "relative" }}>
            <WindowFrame
              item={item}
              onClick={editMode ? onEditClick : item.isVideo ? onVideoClick : onImageClick}
            />
            {editMode && (
              <button
                onClick={onEditClick}
                title="ערוך תאריך וכותרת"
                style={{
                  position: "absolute",
                  top: 6,
                  left: 6,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(37,99,235,0.92)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                  zIndex: 10,
                }}
              >
                ✏️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Dot on path ── */}
      <div className="media-card-dot relative flex-shrink-0 z-10">
        <div
          style={{
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: "white",
            border: "3px solid #7dd3fc",
            boxShadow: "0 0 10px rgba(125,211,252,0.9)",
          }}
        />
        {/* Horizontal connector line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            [onRight ? "right" : "left"]: "100%",
            width: "1.75rem",
            height: 1,
            background: "rgba(160,210,255,0.35)",
            transform: "translateY(-50%)",
          }}
        />
      </div>

      {/* ── Empty half ── */}
      <div className="media-card-empty flex-1" />
    </div>
  );
}

/* ────────────────────────────────────────────
   Window frame component
──────────────────────────────────────────── */
function WindowFrame({
  item,
  onClick,
}: {
  item: MediaItem;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const thumbUrl = `/api/thumb/${item.id}`;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="window-frame-btn block text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      style={{
        transform: hovered ? "scale(1.05) translateY(-5px)" : "scale(1)",
        transition: "transform 0.28s ease",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
      aria-label={item.title}
    >
      {/* Outer wooden frame */}
      <div
        style={{
          border: "8px solid #6b4726",
          borderRadius: 3,
          background: "#fff8e7",
          boxShadow: hovered
            ? "0 0 0 2px #8B6520, 0 0 36px rgba(255,195,80,0.55), 0 14px 40px rgba(0,0,0,0.75)"
            : "0 0 0 1px #4a2e0e, 0 0 0 rgba(0,0,0,0), 0 8px 24px rgba(0,0,0,0.65)",
          animation: "warmGlow 4s ease-in-out infinite",
        }}
      >
        {/* Photo / thumbnail */}
        <div
          style={{
            position: "relative",
            aspectRatio: "4 / 3",
            overflow: "hidden",
            background: "#1a0e04",
          }}
        >
          {imgError ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: "#c8a060", fontSize: "2.5rem" }}
            >
              {item.isVideo ? "🎬" : "🖼️"}
            </div>
          ) : (
            <img
              src={thumbUrl}
              alt={item.title}
              className="w-full h-full"
              loading="lazy"
              onError={() => setImgError(true)}
              style={{
                display: "block",
                objectFit: item.isVideo ? "contain" : (item.fit ?? "cover"),
              }}
            />
          )}

          {/* Video play button */}
          {item.isVideo && !imgError && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.28)" }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 44,
                  height: 44,
                  background: "rgba(255,255,255,0.92)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.45)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  style={{
                    width: 20,
                    height: 20,
                    fill: "#6b3a0a",
                    marginInlineStart: 3,
                  }}
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* Text indicator */}
          {item.description && (
            <div
              className="absolute"
              style={{
                top: 6,
                right: 6,
                background: "rgba(255,248,220,0.92)",
                borderRadius: "50%",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                border: "1px solid rgba(180,140,60,0.5)",
              }}
              title="יש טקסט מצורף"
            >
              ✍️
            </div>
          )}

          {/* Hover shimmer */}
          {hovered && (
            <div
              className="absolute inset-0"
              style={{ background: "rgba(255,210,100,0.08)" }}
            />
          )}
        </div>

        {/* Caption */}
        <div
          className="px-2 pt-1.5 pb-2 text-center"
          style={{ background: "#fff8e7" }}
        >
          <div
            style={{
              fontSize: "0.62rem",
              color: "#7a5010",
              fontWeight: 600,
              marginBottom: 2,
              letterSpacing: "0.03em",
            }}
          >
            {formatDate(item.year, item.month, item.day)}
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "#2d1400",
              fontWeight: 700,
              lineHeight: 1.35,
            }}
          >
            {item.title}
          </div>
        </div>
      </div>
    </button>
  );
}
