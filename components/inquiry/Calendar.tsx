"use client";

import { useMemo, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const WEEKDAYS = ["pon", "tor", "sre", "čet", "pet", "sob", "ned"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

export function Calendar({ value, min, onChange }: { value?: string; min: string; onChange: (iso: string) => void }) {
  const [minY, minM] = min.split("-").map(Number);
  const start = value ?? min;
  const [view, setView] = useState(() => {
    const [y, m] = start.split("-").map(Number);
    return { y, m: m - 1 };
  });
  const grid = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const first = new Date(Date.UTC(view.y, view.m, 1));
    const offset = (first.getUTCDay() + 6) % 7; // Monday first
    const count = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
    return { offset, count };
  }, [view]);

  const monthLabel = new Intl.DateTimeFormat("sl-SI", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(view.y, view.m, 1)),
  );
  const atMin = view.y === minY && view.m === minM - 1;
  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(Date.UTC(v.y, v.m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });

  // Arrow keys move between days, like a native date grid.
  const onKey = (e: React.KeyboardEvent<HTMLButtonElement>, day: number) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = day + step;
    if (next < 1 || next > days.count) return;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${next}"]:not(:disabled)`)?.focus();
  };

  return (
    <div className="w-full max-w-[380px]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={atMin}
          aria-label="Prejšnji mesec"
          className="grid h-11 w-11 place-items-center rounded-full hover:bg-fog disabled:opacity-30"
        >
          <CaretLeft size={18} weight="bold" />
        </button>
        <p className="font-bold capitalize" aria-live="polite">
          {monthLabel}
        </p>
        <button type="button" onClick={() => shift(1)} aria-label="Naslednji mesec" className="grid h-11 w-11 place-items-center rounded-full hover:bg-fog">
          <CaretRight size={18} weight="bold" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-steel" aria-hidden>
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div ref={grid} className="mt-1 grid grid-cols-7 gap-1" role="group" aria-label={`Izberite dan, ${monthLabel}`}>
        {Array.from({ length: days.offset }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: days.count }, (_, i) => {
          const d = i + 1;
          const date = iso(view.y, view.m, d);
          const past = date < min;
          const label = new Intl.DateTimeFormat("sl-SI", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
            new Date(Date.UTC(view.y, view.m, d)),
          );
          return (
            <button
              key={date}
              type="button"
              data-day={d}
              className="cal-day"
              disabled={past}
              data-today={date === min ? "" : undefined}
              aria-pressed={value === date}
              aria-label={label}
              onClick={() => onChange(date)}
              onKeyDown={(e) => onKey(e, d)}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
