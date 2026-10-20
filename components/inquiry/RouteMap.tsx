"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HandGrabbing } from "@phosphor-icons/react";
import mapData from "@/data/map.json";
import { places, placeById, type Place } from "@/lib/places";

// Interactive Slovenia map, loaded only when the route step opens.
// Primary interaction: press on the start town and drag to the destination.
// Fallbacks: tap one town, then another; keyboard Enter on a focused town; typing in the fields.
// Outline: geoBoundaries. Roads: real motorway geometry from OSM via OSRM, simplified.

type Props = {
  fromId?: string;
  toId?: string;
  onRoute: (fromId: string, toId: string) => void; // finished drag
  onPick: (id: string) => void; // tap or keyboard
};

const VW = Number(mapData.viewBox.split(" ")[2]);
const TAP_SLOP = 8; // px a pointer may move and still count as a tap

function curve(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
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

export default function RouteMap({ fromId, toId, onRoute, onPick }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const dragLine = useRef<SVGPathElement>(null);
  const dragCasing = useRef<SVGPathElement>(null);
  const drag = useRef<{ id: string; x: number; y: number; moved: boolean; pointerId: number } | null>(null);
  // Map units per screen pixel; keeps pins and labels the same size on every screen.
  const [k, setK] = useState(1);
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setK(VW / Math.max(e.contentRect.width, 1)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const from = placeById(fromId);
  const to = placeById(toId);
  const route = useMemo(() => (from && to && !dragFrom ? curve(from, to) : null), [from, to, dragFrom]);
  const narrow = k > 1.8; // phone-sized map: only main towns are labelled
  const showDemo = !touched && !fromId && !toId;

  // Demo gesture: Ljubljana to Maribor, shown until the first interaction.
  const demo = useMemo(() => {
    const a = placeById("ljubljana");
    const b = placeById("maribor");
    return a && b ? curve(a, b) : null;
  }, []);

  const toMap = (clientX: number, clientY: number) => {
    const m = svg.current?.getScreenCTM();
    if (!m) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const nearest = (x: number, y: number, radiusPx = 26) => {
    let best: Place | undefined;
    let bestD = Infinity;
    for (const p of places) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best && bestD <= radiusPx * k ? best : undefined;
  };

  const drawDrag = (a: Place, x: number, y: number) => {
    const { d } = curve(a, { x, y });
    dragLine.current?.setAttribute("d", d);
    dragCasing.current?.setAttribute("d", d);
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    setTouched(true);
    const p = toMap(e.clientX, e.clientY);
    const hit = p && nearest(p.x, p.y, 30);
    if (!hit) return;
    e.preventDefault();
    svg.current?.setPointerCapture(e.pointerId);
    drag.current = { id: hit.id, x: e.clientX, y: e.clientY, moved: false, pointerId: e.pointerId };
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < TAP_SLOP) return;
    const start = placeById(d.id);
    const p = toMap(e.clientX, e.clientY);
    if (!start || !p) return;
    if (!d.moved) {
      d.moved = true;
      setDragFrom(d.id);
    }
    const snap = nearest(p.x, p.y);
    const target = snap && snap.id !== d.id ? snap : undefined;
    setHover(target?.id ?? null);
    drawDrag(start, target?.x ?? p.x, target?.y ?? p.y);
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>, cancelled = false) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    if (svg.current?.hasPointerCapture(d.pointerId)) svg.current.releasePointerCapture(d.pointerId);
    setDragFrom(null);
    setHover(null);
    if (cancelled) return;
    if (!d.moved) {
      onPick(d.id); // a tap
      return;
    }
    const p = toMap(e.clientX, e.clientY);
    const end = p && nearest(p.x, p.y);
    if (end && end.id !== d.id) onRoute(d.id, end.id);
    else onPick(d.id); // dropped nowhere: keep the start, wait for a destination
  };

  const dragStart = placeById(dragFrom ?? undefined);
  const flagA = dragStart ?? from;
  const flagB = hover ? placeById(hover) : !dragFrom ? to : undefined;

  return (
    <div className="relative">
      <div
        className="pointer-events-none mb-3 flex w-fit max-w-full items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-lg sm:absolute sm:left-4 sm:top-4 sm:z-[1] sm:mb-0 sm:max-w-[calc(100%-32px)]"
        aria-hidden
      >
        <HandGrabbing size={18} weight="bold" className="shrink-0 text-lime" />
        <span>
          {dragStart
            ? hover
              ? `Spustite: ${placeById(hover)?.name}`
              : "Povlecite do cilja"
            : from && !to
              ? "Zdaj tapnite ali povlecite do cilja"
              : from && to
                ? "Pot izbrana. Povlecite znova za novo pot"
                : "Povlecite od začetka do cilja"}
        </span>
      </div>

      <svg
        ref={svg}
        viewBox={mapData.viewBox}
        className="map-svg map-svg--drag"
        role="group"
        aria-label="Zemljevid Slovenije. Povlecite od začetnega do končnega kraja ali izberite kraj s tipko Enter."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e)}
        onPointerCancel={(e) => endDrag(e, true)}
        data-dragging={dragFrom ? "" : undefined}
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

        {showDemo && demo ? (
          <g aria-hidden className="map-demo" style={{ ["--len" as string]: demo.len }}>
            <path id="map-demo-path" d={demo.d} className="map-demo__line" style={{ strokeWidth: 4 * k }} />
            <circle r={13 * k} className="map-demo__finger" style={{ strokeWidth: 2.5 * k }}>
              <animateMotion dur="2.6s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.15;0.75;1" calcMode="linear">
                <mpath href="#map-demo-path" />
              </animateMotion>
            </circle>
          </g>
        ) : null}

        {route ? (
          <g key={`${fromId}-${toId}`} aria-hidden style={{ ["--len" as string]: route.len }}>
            <path d={route.d} className="map-route" style={{ strokeWidth: 7 * k }} />
            <path d={route.d} className="map-route__line" style={{ strokeWidth: 4 * k }} />
          </g>
        ) : null}

        {dragStart ? (
          <g aria-hidden pointerEvents="none">
            <path ref={dragCasing} d="" fill="none" stroke="#111416" strokeLinecap="round" style={{ strokeWidth: 8 * k }} />
            <path ref={dragLine} d="" fill="none" stroke="#D1FE17" strokeLinecap="round" style={{ strokeWidth: 4.5 * k }} />
          </g>
        ) : null}

        {places.map((p) => {
          const role = p.id === (dragFrom ?? fromId) ? "from" : p.id === hover || (!dragFrom && p.id === toId) ? "to" : undefined;
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
                  setTouched(true);
                  onPick(p.id);
                }
              }}
            >
              <circle cx={p.x} cy={p.y} r={14 * k} fill="transparent" className="map-pin__ring" />
              <circle
                cx={p.x}
                cy={p.y}
                className="map-pin__dot"
                style={{ r: (role ? 8 : p.major ? 6 : 4.5) * k, strokeWidth: 2 * k } as React.CSSProperties}
              />
              {showLabel ? (
                <text
                  x={p.x + (anchorEnd ? -12 : 12) * k}
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

        {flagA ? <Flag p={flagA} k={k} label="A" /> : null}
        {flagB ? <Flag p={flagB} k={k} label="B" /> : null}
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
