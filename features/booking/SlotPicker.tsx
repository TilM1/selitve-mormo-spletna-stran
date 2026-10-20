"use client";

import { useEffect, useState, useTransition } from "react";
import { fetchSlots, type Slot, type SlotsByDay } from "./slots";

// Calendar on the left, time slider on the right, fed with real availability from the
// shared calendar. Only days that still have a free time can be chosen.

const MONTHS = ["januar", "februar", "marec", "april", "maj", "junij", "julij", "avgust", "september", "oktober", "november", "december"];
const DAYS_SHORT = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];
const DAYS = ["nedelja", "ponedeljek", "torek", "sreda", "četrtek", "petek", "sobota"];
const pad = (n: number) => String(n).padStart(2, "0");

export function formatDay(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return `${DAYS[new Date(y, m - 1, d).getDay()]}, ${d}. ${MONTHS[m - 1]}`;
}

export type Picked = { iso: string; label: string };

export function SlotPicker({
  size,
  first,
  ignoreBooking,
  onChange,
}: {
  size: string;
  first: boolean;
  ignoreBooking?: string;
  onChange: (picked: Picked | null) => void;
}) {
  const [view, setView] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });
  const [days, setDays] = useState<SlotsByDay | null>(null);
  const [day, setDay] = useState("");
  const [index, setIndex] = useState(0);
  const [loading, startLoading] = useTransition();

  const monthKey = `${view.y}-${pad(view.m + 1)}`;
  useEffect(() => {
    let stale = false;
    startLoading(async () => {
      const result = await fetchSlots(monthKey, size, first, ignoreBooking);
      if (!stale) setDays(result);
    });
    return () => {
      stale = true;
    };
  }, [monthKey, size, first, ignoreBooking]);

  const slots: Slot[] = (day && days?.[day]) || [];
  const chosen = slots[Math.min(index, slots.length - 1)];

  const pick = (nextDay: string, nextIndex: number, list: Slot[]) => {
    setDay(nextDay);
    setIndex(nextIndex);
    const slot = list[nextIndex];
    onChange(slot ? { iso: slot.iso, label: `${formatDay(nextDay)} ob ${slot.time}` } : null);
  };

  const now = new Date();
  const canPrev = view.y > now.getFullYear() || view.m > now.getMonth();
  const canNext = (view.y - now.getFullYear()) * 12 + view.m - now.getMonth() < 2;
  const move = (by: number) => {
    const d = new Date(view.y, view.m + by, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setDays(null);
  };

  const leading = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const noneFree = days !== null && Object.keys(days).length === 0;

  return (
    <div className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
      <div className="rounded-3xl bg-white p-5 md:p-7">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => move(-1)} disabled={!canPrev} aria-label="Prejšnji mesec" className="grid h-11 w-11 place-items-center rounded-full hover:bg-fog disabled:invisible">
            ←
          </button>
          <p className="t-title !text-[1.15rem] first-letter:uppercase" aria-live="polite">
            {MONTHS[view.m]} {view.y}
          </p>
          <button type="button" onClick={() => move(1)} disabled={!canNext} aria-label="Naslednji mesec" className="grid h-11 w-11 place-items-center rounded-full hover:bg-fog disabled:invisible">
            →
          </button>
        </div>
        <div className={`mt-4 grid grid-cols-7 gap-1 text-center transition-opacity ${loading ? "opacity-50" : ""}`} aria-busy={loading}>
          {DAYS_SHORT.map((d) => (
            <span key={d} className="t-label pb-2 !text-[0.68rem] text-steel">
              {d}
            </span>
          ))}
          {Array.from({ length: leading }, (_, i) => (
            <span key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const key = `${monthKey}-${pad(i + 1)}`;
            const free = days?.[key];
            return (
              <button
                key={key}
                type="button"
                className="cal-day"
                disabled={!free?.length}
                aria-pressed={day === key}
                aria-label={`${formatDay(key)}${free?.length ? "" : ", ni prostih terminov"}`}
                onClick={() => pick(key, Math.min(index, free!.length - 1), free!)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        {noneFree ? <p className="mt-4 text-sm text-steel">Ta mesec ni več prostih terminov. Poglej naslednjega.</p> : null}
      </div>

      <div className="flex flex-col justify-between gap-8 rounded-3xl bg-white p-5 md:p-7">
        <div>
          <p className="t-label text-steel">Datum</p>
          <p className="t-title mt-2 first-letter:uppercase">{day ? formatDay(day) : "Izberi dan v koledarju"}</p>
        </div>
        <div>
          <label htmlFor="slot-time" className="t-label text-steel">
            Ura
          </label>
          <p className={`t-num mt-1 text-[clamp(3rem,7vw,4.5rem)] leading-none ${chosen ? "" : "text-mist"}`} aria-hidden="true">
            {chosen?.time ?? "–:––"}
          </p>
          <input
            id="slot-time"
            type="range"
            className="time-range mt-4"
            min={0}
            max={Math.max(slots.length - 1, 0)}
            step={1}
            value={Math.min(index, Math.max(slots.length - 1, 0))}
            disabled={slots.length < 2}
            aria-valuetext={chosen?.time}
            onChange={(e) => pick(day, Number(e.target.value), slots)}
          />
          <div className="flex justify-between text-sm text-steel">
            <span>{slots[0]?.time ?? ""}</span>
            <span>{slots.length > 1 ? `${slots.length} prostih terminov` : slots.length === 1 ? "en prost termin" : ""}</span>
            <span>{slots[slots.length - 1]?.time ?? ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
