export function BadgeEmblem({ directoryName }: { directoryName: string }) {
  // Calculate ribbon width based on text length
  // ~7px per character for 11px Arial bold with 0.5 letter-spacing, plus padding
  const charWidth = 7;
  const padding = 20;
  const minWidth = 60;
  const ribbonWidth = Math.max(minWidth, directoryName.length * charWidth + padding);
  const ribbonX = 100 - ribbonWidth / 2;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 240"
      width="200"
      height="240"
    >
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1a4d8f', stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: '#0d2847', stopOpacity: 1 }}
          />
        </linearGradient>
        <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#d4af37', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#f4d03f', stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: '#c9a832', stopOpacity: 1 }}
          />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
        </filter>
      </defs>

      <path
        d="M100 10 L170 35 L170 100 Q170 160 100 210 Q30 160 30 100 L30 35 Z"
        fill="url(#shieldGradient)"
        stroke="#0a1f3d"
        strokeWidth="2"
        filter="url(#shadow)"
      />

      <path
        d="M100 25 L155 45 L155 100 Q155 150 100 190 Q45 150 45 100 L45 45 Z"
        fill="none"
        stroke="#2a6bb5"
        strokeWidth="1.5"
        opacity="0.4"
      />

      <circle cx="100" cy="90" r="35" fill="#fff" opacity="0.95" />
      <circle
        cx="100"
        cy="90"
        r="32"
        fill="none"
        stroke="url(#ribbonGradient)"
        strokeWidth="3"
      />

      <path
        d="M85 90 L95 100 L115 78"
        fill="none"
        stroke="url(#ribbonGradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M50 50 L150 50 L145 65 L55 65 Z"
        fill="url(#ribbonGradient)"
        stroke="#a08020"
        strokeWidth="1"
      />

      <text
        x="100"
        y="62"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        fontWeight="bold"
        fill="#0d2847"
        textAnchor="middle"
        letterSpacing="1"
      >
        PREMIUM
      </text>

      <text
        x="100"
        y="145"
        fontFamily="Arial, sans-serif"
        fontSize="16"
        fontWeight="bold"
        fill="#ffffff"
        textAnchor="middle"
        letterSpacing="2"
      >
        MEMBER
      </text>

      {/* Bottom ribbon for directory name */}
      <rect
        x={ribbonX}
        y="165"
        width={ribbonWidth}
        height="28"
        rx="3"
        fill="url(#ribbonGradient)"
        stroke="#a08020"
        strokeWidth="1"
      />

      {/* Directory name text - EDITABLE */}
      <text
        x="100"
        y="183"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontWeight="bold"
        fill="#0d2847"
        textAnchor="middle"
        letterSpacing="0.5"
      >
        {directoryName}
      </text>
    </svg>
  );
}
