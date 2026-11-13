/**
 * Stylised temple-and-palm horizon (five stepped towers, as on the national
 * flag) used as the hero's foreground layer. Pure SVG, decorative only.
 */
function tower(cx: number, base: number, width: number, height: number) {
  // Stepped spire: 6 tiers narrowing to a point.
  const tiers = 6;
  const pts: string[] = [];
  const left: [number, number][] = [];
  for (let i = 0; i <= tiers; i++) {
    const w = width * (1 - i / (tiers + 0.6)) * 0.5;
    const y = base - (height * i) / tiers;
    const yNext = base - (height * (i + 1)) / tiers;
    left.push([cx - w, y], [cx - w, i < tiers ? (y + yNext) / 2 + 2 : y]);
  }
  left.forEach(([x, y]) => pts.push(`${x.toFixed(1)},${y.toFixed(1)}`));
  pts.push(`${cx},${(base - height - height * 0.18).toFixed(1)}`);
  [...left].reverse().forEach(([x, y]) => pts.push(`${(2 * cx - x).toFixed(1)},${y.toFixed(1)}`));
  return pts.join(" ");
}

function palm(x: number, base: number, h: number, lean: number) {
  const topX = x + lean;
  const topY = base - h;
  const trunk = `M${x - 2},${base} Q${x + lean * 0.3},${base - h * 0.5} ${topX - 1},${topY} L${topX + 1.5},${topY} Q${x + lean * 0.3 + 3},${base - h * 0.5} ${x + 3},${base} Z`;
  const fronds = [-150, -115, -80, -45, -10, 25]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      const len = h * 0.42;
      const ex = topX + Math.cos(r) * len;
      const ey = topY + Math.sin(r) * len * 0.55 + len * 0.25;
      const cx1 = topX + Math.cos(r) * len * 0.5;
      const cy1 = topY + Math.sin(r) * len * 0.5 - 6;
      return `M${topX},${topY} Q${cx1},${cy1} ${ex},${ey} Q${cx1},${cy1 + 5} ${topX},${topY + 2} Z`;
    })
    .join(" ");
  return `${trunk} ${fronds}`;
}

export function Skyline({ className = "" }: { className?: string }) {
  const base = 300;
  return (
    <svg viewBox="0 0 1600 320" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sky-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="1" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
      </defs>
      <g fill="url(#sky-fade)">
        {/* Distant gallery wall */}
        <path d={`M430,${base} V258 H560 V246 H1040 V258 H1170 V${base} Z`} />
        <polygon points={tower(560, 250, 70, 92)} />
        <polygon points={tower(1040, 250, 70, 92)} />
        <polygon points={tower(660, 246, 84, 128)} />
        <polygon points={tower(940, 246, 84, 128)} />
        <polygon points={tower(800, 246, 104, 176)} />
        <path d={palm(250, base, 150, 18)} />
        <path d={palm(320, base, 112, -14)} />
        <path d={palm(1300, base, 160, -20)} />
        <path d={palm(1385, base, 120, 12)} />
        <path d={palm(110, base, 96, 10)} />
        <path d={palm(1500, base, 104, -8)} />
        <rect x="0" y={base} width="1600" height="20" />
      </g>
    </svg>
  );
}
