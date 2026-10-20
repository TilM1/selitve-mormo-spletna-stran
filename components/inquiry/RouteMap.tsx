"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapData from "@/data/map.json";
import { places, placeById, type Place } from "@/lib/places";

// Interactive Slovenia map. Loaded only when the route step opens.
// Outline: geoBoundaries. Roads: real motorway geometry from OSM via OSRM, simplified.
// Clicks pick the nearest town within a fixed on-screen radius, so it works with fingers too.

type Props = {
  fromId?: string;
  toId?: string;
  target: "from" | "to";
  onPick: (id: string) => void;
};

const VW = Number(mapData.viewBox.split(" ")[2]);

function curve(a: Place, b: Place) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const bend = Math.min(0.18 * len, 60);
  const cx = (a.x + b.x) / 2 - (dy / len) * bend;
  const cy = (a.y + b.y) / 2 + (dx / len) * bend;
  // Length of the quadratic curve, sampled; good enough for the draw animation.
  let L = 0;
  let px = a.x;
  let py = a.y;
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const x = (1 - t) ** 2 * a.x + 2 * (1 - t) * t * cx + t ** 2 * b.x;
    const y = (1 - t) ** 2 * a.y + 2 * (1 - t) * t * cy + t ** 2 * b.y;
    L += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return { d: `M${a.x} ${a.y}Q${cx} ${cy} ${b.x} ${b.y}`, len: Math.ceil(L) };
}

export default function RouteMap({ fromId, toId, target, onPick }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const ghost = useRef<SVGLineElement>(null);
  // Map units per screen pixel; keeps pins and labels the same size on every screen.
  const [k, setK] = useState(1);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(VW / Math.max(e.contentRect.width, 1)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const from = placeById(fromId);
  const to = placeById(toId);
  const route = useMemo(() => (from && to ? curve(from, to) : null), [from, to]);
  const narrow = k > 1.8; // phone-sized map: only main towns are labelled

  const toMap = (clientX: number, clientY: number) => {
    const el = svg.current;
    const m = el?.getScreenCTM();
    if (!el || !m) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const nearest = (x: number, y: number) => {
    let best: Place | undefined;
    let bestD = Infinity;
    for (const p of places) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best && bestD <= 26 * k ? best : undefined;
  };

  // Pointer-following line from the start point, mouse only (no hover on touch screens).
  const onMove = (e: React.PointerEvent) => {
    const line = ghost.current;
    if (!line) return;
    if (e.pointerType !== "mouse" || !from || to) {
      line.style.display = "none";
      return;
    }
    const p = toMap(e.clientX, e.clientY);
    if (!p) return;
    const snap = nearest(p.x, p.y);
    line.setAttribute("x2", String(snap?.x ?? p.x));
    line.setAttribute("y2", String(snap?.y ?? p.y));
    line.style.display = "";
  };

  const onClick = (e: React.MouseEvent) => {
    if (e.detail === 0) return; // keyboard "click" is handled on the pin itself
    const p = toMap(e.clientX, e.clientY);
    const hit = p && nearest(p.x, p.y);
    if (hit) onPick(hit.id);
  };

  return (
    <div className="relative">
      <svg
        ref={svg}
        viewBox={mapData.viewBox}
        className="map-svg"
        role="group"
        aria-label={`Zemljevid Slovenije. Naslednji izbor: ${target === "from" ? "začetna lokacija" : "končna lokacija"}.`}
        onPointerMove={onMove}
        onPointerLeave={() => ghost.current && (ghost.current.style.display = "none")}
        onClick={onClick}
        style={{ cursor: "crosshair" }}
      >
        <path d={mapData.outline} className="map-land" />
        <g aria-hidden>
          {mapData.roads.map((r, i) => (
            <path key={`c${i}`} d={r.d} className="map-road-casing" style={{ strokeWidth: 4.5 * Math.min(k, 1.6) }} />
          ))}
          {mapData.roads.map((r, i) => (
            <path key={`r${i}`} d={r.d} className="map-road" style={{ strokeWidth: 1.6 * Math.min(k, 1.6) }} />
          ))}
        </g>

        {from && !to ? (
          <line ref={ghost} x1={from.x} y1={from.y} x2={from.x} y2={from.y} className="map-ghost" style={{ display: "none", strokeWidth: 2.5 * k }} />
        ) : null}

        {route ? (
          <g key={`${fromId}-${toId}`} aria-hidden style={{ ["--len" as string]: route.len }}>
            <path d={route.d} className="map-route" style={{ strokeWidth: 7 * k }} />
            <path d={route.d} className="map-route__line" style={{ strokeWidth: 4 * k }} />
          </g>
        ) : null}

        {places.map((p) => {
          const role = p.id === fromId ? "from" : p.id === toId ? "to" : undefined;
          const showLabel = p.major || role || !narrow;
          const anchorEnd = p.x > VW - 170;
          return (
            <g
              key={p.id}
              className="map-pin"
              data-role={role}
              role="button"
              tabIndex={0}
              aria-label={`${p.name}${role === "from" ? ", začetek" : role === "to" ? ", cilj" : ""}`}
              aria-pressed={!!role}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPick(p.id);
                }
              }}
            >
              <circle cx={p.x} cy={p.y} r={14 * k} fill="transparent" className="map-pin__ring" />
              <circle
                cx={p.x}
                cy={p.y}
                className="map-pin__dot"
                style={{ r: (role ? 7 : p.major ? 5.5 : 4) * k, strokeWidth: 2 * k } as React.CSSProperties}
              />
              {showLabel ? (
                <text
                  x={p.x + (anchorEnd ? -11 : 11) * k}
                  y={p.y + 5 * k}
                  textAnchor={anchorEnd ? "end" : "start"}
                  className="map-label"
                  data-minor={!p.major && !role && !narrow ? "" : undefined}
                  style={{ fontSize: (p.major || role ? 15 : 12.5) * k, strokeWidth: 4 * k }}
                >
                  {p.name}
                </text>
              ) : null}
            </g>
          );
        })}

        {from ? <Flag p={from} k={k} label="A" /> : null}
        {to ? <Flag p={to} k={k} label="B" /> : null}
      </svg>
      <p className="mt-2 text-xs text-steel">
        Glavne avtoceste prikazane poenostavljeno. Podatki © OpenStreetMap contributors, meja geoBoundaries.
      </p>
      <span className="sr-only" aria-live="polite">
        {from ? `Začetek: ${from.name}.` : ""} {to ? `Cilj: ${to.name}.` : ""}
      </span>
    </div>
  );
}

function Flag({ p, k, label }: { p: Place; k: number; label: string }) {
  const r = 11 * k;
  const y = p.y - 22 * k;
  return (
    <g aria-hidden pointerEvents="none">
      <line x1={p.x} y1={p.y} x2={p.x} y2={y + r} stroke="#111416" strokeWidth={2 * k} />
      <circle cx={p.x} cy={y} r={r} fill="#111416" />
      <text x={p.x} y={y + 4.5 * k} textAnchor="middle" fill="#D1FE17" style={{ fontSize: 13 * k, fontWeight: 800 }}>
        {label}
      </text>
    </g>
  );
}
