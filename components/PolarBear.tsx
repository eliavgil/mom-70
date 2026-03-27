/**
 * Polar bear viewed from above, walking downward along the timeline.
 * Head (nose) points toward the bottom of the SVG.
 */
export default function PolarBear({ size = 90 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.5}
      viewBox="0 0 100 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >

      {/* ── Hind legs (upper sides) ── */}
      <ellipse
        cx="22" cy="38"
        rx="11" ry="18"
        fill="#DDE9F3" stroke="#B8CEDF" strokeWidth="1.5"
        transform="rotate(-28 22 38)"
      />
      <ellipse
        cx="78" cy="38"
        rx="11" ry="18"
        fill="#DDE9F3" stroke="#B8CEDF" strokeWidth="1.5"
        transform="rotate(28 78 38)"
      />

      {/* ── Body ── */}
      <ellipse
        cx="50" cy="72"
        rx="27" ry="42"
        fill="#EDF4F9" stroke="#B8CEDF" strokeWidth="2"
      />

      {/* ── Front legs (lower sides) ── */}
      <ellipse
        cx="20" cy="100"
        rx="11" ry="18"
        fill="#DDE9F3" stroke="#B8CEDF" strokeWidth="1.5"
        transform="rotate(22 20 100)"
      />
      <ellipse
        cx="80" cy="100"
        rx="11" ry="18"
        fill="#DDE9F3" stroke="#B8CEDF" strokeWidth="1.5"
        transform="rotate(-22 80 100)"
      />

      {/* ── Neck ── */}
      <ellipse cx="50" cy="118" rx="19" ry="13" fill="#EDF4F9" />

      {/* ── Head ── */}
      <circle
        cx="50" cy="132"
        r="16"
        fill="#EDF4F9" stroke="#B8CEDF" strokeWidth="2"
      />

      {/* ── Ears (on sides of head) ── */}
      <circle cx="35" cy="123" r="8" fill="#EDF4F9" stroke="#B8CEDF" strokeWidth="1.5" />
      <circle cx="65" cy="123" r="8" fill="#EDF4F9" stroke="#B8CEDF" strokeWidth="1.5" />

      {/* ── Eyes ── */}
      <circle cx="43" cy="129" r="3.5" fill="#1B2A38" />
      <circle cx="44.2" cy="127.8" r="1.2" fill="white" />

      <circle cx="57" cy="129" r="3.5" fill="#1B2A38" />
      <circle cx="58.2" cy="127.8" r="1.2" fill="white" />

      {/* ── Nose (bottom of head, pointing down) ── */}
      <ellipse cx="50" cy="142" rx="5" ry="3.5" fill="#1B2A38" />
      <ellipse cx="50" cy="141" rx="2" ry="1.2" fill="rgba(255,255,255,0.3)" />

    </svg>
  );
}
