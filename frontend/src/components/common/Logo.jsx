const THEMES = {
  // white wordmark — use on dark / gradient backgrounds (e.g. the Auth hero panel)
  dark: {
    ring: "#60A5FA",
    track: "rgba(255,255,255,0.15)",
    pulse: "#FFFFFF",
    dot: "#4ADE80",
    word: "#FFFFFF",
    sub: "#94A3B8",
    line: "#334155",
  },
  // navy wordmark — use on white / light backgrounds (e.g. the Sidebar)
  light: {
    ring: "#2563EB",
    track: "#DCE7FB",
    pulse: "#1D4ED8",
    dot: "#16A34A",
    word: "#0F172A",
    sub: "#475569",
    line: "#E2E8F0",
  },
};

/**
 * AutoCare Intelligence brand lockup (icon + wordmark), the "Primary horizontal" logo.
 * Drawn as inline SVG (not an <img>) so individual pieces can be animated with CSS.
 *
 * Props:
 *  - theme        "dark" (white text, dark backgrounds) | "light" (navy text, light backgrounds)
 *  - animated     true = fade/scale in on mount + a soft heartbeat pulse on the accent dot
 *  - glow         true = blurred pulsing glow behind the icon (pair with theme="dark")
 *  - showTagline  false = icon + "AutoCare" only, no "INTELLIGENCE" sub-line/divider (compact)
 *  - className    sizing, e.g. "h-10 w-auto"
 */
export default function Logo({
  theme = "dark",
  animated = false,
  glow = false,
  showTagline = true,
  className = "h-10 w-auto",
}) {
  const c = THEMES[theme];

  const svg = (
    <svg
      viewBox={showTagline ? "0 0 1000 260" : "0 0 760 260"}
      role="img"
      aria-label="AutoCare Intelligence"
      className={`${className} ${animated ? "logo-animate-in" : ""}`}
    >
      <g transform="translate(40,30)">
        <circle cx="100" cy="100" r="92" fill="none" stroke={c.track} strokeWidth="9.2" />
        <path
          d="M 29.52 159.14 A 92 92 0 1 1 170.48 159.14"
          fill="none"
          stroke={c.ring}
          strokeWidth="9.2"
          strokeLinecap="round"
        />
        <path
          d="M 47.10 105.52 L 70.38 105.52 L 82.01 77.92 L 95.77 120.70 L 108.46 97.79 L 119.04 105.52 L 152.90 105.52"
          fill="none"
          stroke={c.pulse}
          strokeWidth="6.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="151.84"
          cy="105.52"
          r="6.9"
          fill={c.dot}
          className={animated ? "logo-dot" : ""}
        />
      </g>

      <text x="270" y="122" fontFamily="Arial, Helvetica, sans-serif" fontSize="72" fontWeight="800" fill={c.word}>
        AutoCare
      </text>

      {showTagline && (
        <>
          <text
            x="272"
            y="178"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="34"
            fontWeight="600"
            letterSpacing="6"
            fill={c.sub}
          >
            INTELLIGENCE
          </text>
          <rect x="270" y="150" width="470" height="3" fill={c.line} />
        </>
      )}
    </svg>
  );

  if (!glow) return svg;

  return (
    <div className="relative inline-flex items-center">
      <div className="logo-glow pointer-events-none absolute left-[3%] top-[8%] h-[84%] w-[22%] rounded-full bg-brand-400/40 blur-2xl" />
      {svg}
    </div>
  );
}