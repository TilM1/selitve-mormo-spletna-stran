"use client";

import { useMemo, useState } from "react";
import { booking, hours } from "./schema";

// Calendar on the left, time slider on the right.
// The customer proposes a first appointment; we confirm it afterwards.
// When real availability exists (the booking database), only `isOpen` and the
// slider's range need to read from it.

const MONTHS = ["januar", "februar", "marec", "april", "maj", "junij", "julij", "avgust", "september", "oktober", "november", "december"];
const DAYS_SHORT = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];
const DAYS = ["nedelja", "ponedeljek", "torek", "sreda", "četrtek", "petek", "sobota"];

const pad = (n: number) => String(n).padStart(2, "0");
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export function formatDate(key: string) {
  const d = fromKey(key);
  return `${DAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}
export const formatTime = (halfHours: number) => `${Math.floor(halfHours / 2)}:${halfHours % 2 ? "30" : "00"}`;

export function DateTimePicker({
  date,
  time,
  onChange,
}: {
  date: string;
  time: number; // in half-hours since midnight (18 = 9:00)
  onChange: (next: { date: string; time: number }) => void;
}) {
  const { first, last } = useMemo(() => {
    const t = new Date();
    const day = (offset: number) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + offset);
    return { first: day(booking.leadDays), last: day(booking.horizonDays) };
  }, []);

  const [view, setView] = useState(() => {
    const d = date ? fromKey(date) : first;
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const isOpen = (d: Date) => d >= first && d <= last;
  const maxFor = (_key: string) => hours.close * 2;

  const leading = (view.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const canPrev = view > new Date(first.getFullYear(), first.getMonth(), 1);
  const canNext = new Date(view.getFullYear(), view.getMonth() + 1, 1) <= last;
  const move = (by: number) => setView(new Date(view.getFullYear(), view.getMonth() + by, 1));

  const max = maxFor(date);
  const shownTime = Math.min(time, max);

  return (
    <div className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
      {/* Calendar */}
      <div className="rounded-3xl bg-white p-5 md:p-7">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => move(-1)} disabled={!canPrev} aria-label="Prejšnji mesec" className="grid h-11 w-11 place-items-center rounded-full hover:bg-fog disabled:invisible">
            ←
          </button>
          <p className="t-title !text-[1.15rem] first-letter:uppercase" aria-live="polite">
            {MONTHS[view.getMonth()]} {view.getFullYear()}
          </p>
          <button type="button" onClick={() => move(1)} disabled={!canNext} aria-label="Naslednji mesec" className="grid h-11 w-11 place-items-center rounded-full hover:bg-fog disabled:invisible">
            →
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center">
          {DAYS_SHORT.map((d) => (
            <span key={d} className="t-label pb-2 !text-[0.68rem] text-steel">
              {d}
            </span>
          ))}
          {Array.from({ length: leading }, (_, i) => (
            <span key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = new Date(view.getFullYear(), view.getMonth(), i + 1);
            const key = toKey(d);
            return (
              <button
                key={key}
                type="button"
                className="cal-day"
                disabled={!isOpen(d)}
                aria-pressed={date === key}
                aria-label={formatDate(key)}
                onClick={() => onChange({ date: key, time: Math.min(time, maxFor(key)) })}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time */}
      <div className="flex flex-col justify-between gap-8 rounded-3xl bg-white p-5 md:p-7">
        <div>
          <p className="t-label text-steel">Datum</p>
          <p className="t-title mt-2 first-letter:uppercase">{date ? formatDate(date) : "Izberi dan v koledarju"}</p>
        </div>
        <div>
          <label htmlFor="time" className="t-label text-steel">
            Ura
          </label>
          <p className={`t-num mt-1 text-[clamp(3rem,7vw,4.5rem)] leading-none ${date ? "" : "text-mist"}`} aria-hidden="true">
            {formatTime(shownTime)}
          </p>
          <input
            id="time"
            type="range"
            className="time-range mt-4"
            min={hours.open * 2}
            max={max}
            step={1}
            value={shownTime}
            disabled={!date}
            aria-valuetext={formatTime(shownTime)}
            onChange={(e) => onChange({ date, time: Number(e.target.value) })}
          />
          <div className="flex justify-between text-sm text-steel">
            <span>{formatTime(hours.open * 2)}</span>
            <span>{formatTime(max)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
