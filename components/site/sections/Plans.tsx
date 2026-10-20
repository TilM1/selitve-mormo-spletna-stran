"use client";

import Link from "next/link";
import { useState } from "react";
import { Droplet } from "@/components/ui/Droplet";
import { eur, includedInEveryVisit, monthlyPrice, plans, sizes, visitDuration, type Plan, type SizeKey } from "@/config/catalog";
import { signupHref } from "@/config/site";
import { plansCopy as c } from "@/content/home";

export function Plans() {
  const [size, setSize] = useState<SizeKey>("small");
  const featured = plans.find((p) => p.highlighted) ?? plans[0];
  const others = plans.filter((p) => p !== featured);

  return (
    <section id="paketi" className="section bg-fog !pt-[clamp(48px,6vw,88px)]">
      <div className="wrap">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <h2 className="t-headline reveal max-w-[15ch]">{c.headline}</h2>
            <p className="t-lead mt-5 max-w-[38ch] text-steel">{c.sub}</p>
          </div>

          <fieldset className="md:justify-self-end">
            <legend className="t-label mb-3 text-steel">{c.sizeLabel}</legend>
            <div className="inline-flex flex-wrap gap-1 rounded-[28px] bg-white p-1">
              {sizes.map((s) => (
                <label
                  key={s.key}
                  className={`t-label cursor-pointer rounded-full px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink ${
                    size === s.key ? "bg-ink text-white" : "text-ink hover:bg-fog"
                  }`}
                >
                  <input type="radio" name="size" value={s.key} checked={size === s.key} onChange={() => setSize(s.key)} className="sr-only" />
                  {s.short}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-[1.25fr_1fr]">
          {/* Featured plan: the tall dark panel */}
          <article className="gloss flex flex-col justify-between gap-12 rounded-2xl bg-ink p-7 text-white md:rounded-3xl md:p-12">
            <div>
              <p className="t-label inline-flex items-center gap-2 rounded-full bg-lime px-3 py-1.5 text-ink">
                <Droplet className="h-3 w-auto" />
                {c.popular}
              </p>
              <h3 className="t-headline mt-7">{featured.name}</h3>
              <p className="t-lead mt-4 max-w-[30ch] text-white/75">{featured.promise}</p>
            </div>
            <div>
              <PlanPrice plan={featured} size={size} className="text-lime" big />
              <p className="mt-2 text-white/70">{c.visits(featured.visits)}</p>
              <Link href={signupHref({ plan: featured.key, size })} className="btn btn-primary mt-8 w-full sm:w-auto">
                {c.cta(featured.name)}
              </Link>
            </div>
          </article>

          {/* The two quieter plans */}
          <div className="grid gap-4">
            {others.map((plan) => (
              <article key={plan.key} className="flex flex-col justify-between gap-8 rounded-2xl bg-white p-7 md:rounded-3xl md:p-9">
                <div>
                  <h3 className="t-title">{plan.name}</h3>
                  <p className="mt-2 max-w-[34ch] text-steel">{plan.promise}</p>
                  {plan.extras === null ? <p className="mt-2 text-sm text-steel">{c.premiumPending}</p> : null}
                </div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <PlanPrice plan={plan} size={size} />
                    <p className="mt-1 text-sm text-steel">{c.visits(plan.visits)}</p>
                  </div>
                  <Link href={signupHref({ plan: plan.key, size })} className="btn btn-ink btn-sm">
                    {c.cta(plan.name)}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Shared feature list, shown once instead of three times */}
        <div className="mt-14 grid gap-6 border-t border-mist pt-10 md:grid-cols-[1fr_2.2fr]">
          <div>
            <h3 className="t-title">{c.includedTitle}</h3>
            <p className="mt-2 text-steel">{visitDuration}</p>
          </div>
          <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {includedInEveryVisit.map((item) => (
              <li key={item} className="flex items-baseline gap-3">
                <Droplet className="h-[0.8em] w-auto shrink-0 translate-y-[1px] text-ink" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PlanPrice({ plan, size, className = "", big = false }: { plan: Plan; size: SizeKey; className?: string; big?: boolean }) {
  return (
    <p className={className}>
      <span className={`t-num ${big ? "text-[clamp(3.5rem,7vw,6rem)] leading-none" : "text-[2.5rem] leading-none"}`}>{eur(monthlyPrice(plan, size))}</span>
      <span className={`ml-2 ${big ? "text-white/70" : "text-steel"}`}>{c.perMonth}</span>
    </p>
  );
}
