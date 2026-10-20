"use client";

import { useEffect, useState } from "react";
import { Check } from "@phosphor-icons/react";
import { checklist } from "@/content/home";

const KEY = "mormo-seznam-v1";

export function Checklist() {
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {}
  }, []);

  const toggle = (id: string) =>
    setDone((d) => {
      const next = d.includes(id) ? d.filter((x) => x !== id) : [...d, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

  const count = done.filter((id) => checklist.some((c) => c.id === id)).length;
  const total = checklist.length;
  const pct = Math.round((count / total) * 100);

  return (
    <section className="section bg-kraft-light" aria-labelledby="seznam-h">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+48px)] lg:col-span-5 lg:self-start">
          <h2 id="seznam-h" className="t-headline">
            Ste pripravljeni na selitev?
          </h2>
          <p className="t-lead mt-4 max-w-[40ch] text-[#4a3b2c]">Odkljukajte, kar ste že uredili. Seznam si zapomni vaš brskalnik.</p>

          <div className="mt-10 flex items-end gap-6">
            <svg viewBox="0 0 120 120" className="h-28 w-28 shrink-0 -rotate-90" aria-hidden>
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(138 100 64 / 0.25)" strokeWidth="12" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#111416"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                strokeDashoffset={2 * Math.PI * 52 * (1 - count / total)}
                style={{ transition: "stroke-dashoffset 420ms cubic-bezier(0.22,1,0.36,1)" }}
              />
            </svg>
            <div aria-live="polite">
              <p className="t-num text-5xl">
                {count}/{total}
              </p>
              <p className="mt-1 font-semibold">
                {count === total ? "Pripravljeni ste. Zdaj pa mi!" : count === 0 ? "Začnimo." : `${pct} % pripravljeno`}
              </p>
            </div>
          </div>
        </div>

        <ul className="grid gap-3 lg:col-span-7">
          {checklist.map((c) => {
            const on = done.includes(c.id);
            return (
              <li key={c.id}>
                <button type="button" role="checkbox" aria-checked={on} className="check-row" onClick={() => toggle(c.id)}>
                  <span className="check-box" aria-hidden>
                    <Check size={18} weight="bold" />
                  </span>
                  <span>
                    <span className="check-title block text-lg font-bold">{c.title}</span>
                    <span className="mt-1 block text-[#4a3b2c]">{c.tip}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
