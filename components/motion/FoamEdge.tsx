// A band of foam with a bubbly top edge and a clean, wiped bottom edge.
// Pure SVG, rendered on the server: three layers, moved only by CSS transforms.
// Bubbles are generated from a seed so the markup is identical on every render.

type Tone = "pink" | "pale" | "water";

const tones: Record<Tone, { back: string; mid: string; front: string }> = {
  pink: { back: "#FFD6EA", mid: "#FFB5D9", front: "#FF9ACB" },
  pale: { back: "#FFEAF4", mid: "#FFD6EA", front: "#FFC2DF" },
  water: { back: "#DDF2FB", mid: "#C3E8F8", front: "#A6DDF5" },
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 2880;
const H = 300;

function layer(seed: number, baseline: number, rMin: number, rMax: number, loose: number) {
  const r = rng(seed);
  const bubbles: { x: number; y: number; r: number }[] = [];
  for (let x = -40; x < W + 40; ) {
    const rad = rMin + r() * (rMax - rMin);
    bubbles.push({ x: Math.round(x), y: Math.round(baseline - r() * rad * 0.7), r: Math.round(rad) });
    x += rad * (0.75 + r() * 0.55);
  }
  // A few loose bubbles floating just above the edge.
  for (let i = 0; i < loose; i++) {
    bubbles.push({ x: Math.round(r() * W), y: Math.round(baseline - rMax - 10 - r() * 60), r: Math.round(5 + r() * 12) });
  }
  return bubbles;
}

export function FoamEdge({ tone = "pink", seed = 7, className = "" }: { tone?: Tone; seed?: number; className?: string }) {
  const c = tones[tone];
  const layers = [
    { cls: "foam__back", fill: c.back, baseline: 150, bubbles: layer(seed, 150, 44, 96, 10) },
    { cls: "foam__mid", fill: c.mid, baseline: 178, bubbles: layer(seed + 11, 178, 34, 76, 8) },
    { cls: "foam__front", fill: c.front, baseline: 208, bubbles: layer(seed + 23, 208, 26, 60, 6) },
  ];
  return (
    <div className={`foam ${className}`} aria-hidden="true">
      {layers.map((l) => (
        <svg key={l.cls} className={l.cls} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
          <g fill={l.fill}>
            {l.bubbles.map((b, i) => (
              <circle key={i} cx={b.x} cy={b.y} r={b.r} />
            ))}
            <rect x="0" y={l.baseline} width={W} height={H} />
          </g>
          <g fill="#fff" opacity="0.5">
            {l.bubbles
              .filter((_, i) => i % 3 === 0)
              .map((b, i) => (
                <ellipse key={i} cx={b.x - b.r * 0.32} cy={b.y - b.r * 0.42} rx={b.r * 0.2} ry={b.r * 0.11} transform={`rotate(-28 ${b.x - b.r * 0.32} ${b.y - b.r * 0.42})`} />
              ))}
          </g>
        </svg>
      ))}
      <div className="foam__base" style={{ background: c.front }} />
      <div className="foam__edge" />
    </div>
  );
}
