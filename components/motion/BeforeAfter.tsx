"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef } from "react";
import { Droplet } from "@/components/ui/Droplet";

// Drag to wipe between two images. A real range input sits on top,
// so it works with touch, mouse, keyboard and screen readers.
//
// When the slider scrolls into view it sweeps left and right by itself, clearly enough
// that nobody misses that it can be dragged. It stops for good as soon as the visitor touches it.

const HINT_PATH = [50, 18, 82, 50]; // positions in percent
const HINT_MS = 2600;
const HINT_MAX_RUNS = 3; // repeats when the slider comes back into view untouched

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function BeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
  beforeAlt,
  afterAlt,
  ariaLabel,
}: {
  before: StaticImageData;
  after: StaticImageData;
  beforeLabel: string;
  afterLabel: string;
  beforeAlt: string;
  afterAlt: string;
  ariaLabel: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const stopHint = useRef<() => void>(() => {});

  const setPos = (value: number) => box.current?.style.setProperty("--pos", `${value}%`);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let runs = 0;
    let running = false;

    const stop = () => {
      cancelAnimationFrame(frame);
      running = false;
    };
    stopHint.current = stop;

    const play = () => {
      if (touched.current || running || runs >= HINT_MAX_RUNS) return;
      running = true;
      runs += 1;
      const start = performance.now();
      const legs = HINT_PATH.length - 1;
      const tick = (now: number) => {
        const t = Math.min((now - start) / HINT_MS, 1);
        const leg = Math.min(Math.floor(t * legs), legs - 1);
        const local = ease(t * legs - leg);
        const value = HINT_PATH[leg] + (HINT_PATH[leg + 1] - HINT_PATH[leg]) * local;
        setPos(value);
        if (range.current) range.current.value = String(Math.round(value));
        if (t < 1 && !touched.current) frame = requestAnimationFrame(tick);
        else running = false;
      };
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([e]) => e.isIntersecting && play(), { threshold: 0.55 });
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  const takeOver = () => {
    touched.current = true;
    stopHint.current();
  };

  return (
    <div ref={box} className="ba">
      <Image src={after} alt={afterAlt} sizes="(min-width: 1400px) 1240px, 100vw" placeholder="blur" />
      <div className="ba__before">
        <Image src={before} alt={beforeAlt} sizes="(min-width: 1400px) 1240px, 100vw" placeholder="blur" />
      </div>
      <span className="ba__tag t-label left-4">{beforeLabel}</span>
      <span className="ba__tag t-label right-4">{afterLabel}</span>
      <div className="ba__line">
        <span className="ba__handle">
          <Droplet className="h-6 w-auto" />
        </span>
      </div>
      <input
        ref={range}
        className="ba__range"
        type="range"
        min={0}
        max={100}
        defaultValue={50}
        aria-label={ariaLabel}
        onPointerDown={takeOver}
        onKeyDown={takeOver}
        onInput={(e) => {
          takeOver();
          setPos(Number(e.currentTarget.value));
        }}
      />
    </div>
  );
}
