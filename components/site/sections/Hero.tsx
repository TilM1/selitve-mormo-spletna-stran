import Link from "next/link";
import { HeroVideo, PORTRAIT_QUERY } from "@/components/motion/HeroVideo";
import { eur, lowestMonthly } from "@/config/catalog";
import { signupHref, site } from "@/config/site";
import { hero } from "@/content/home";

const V = "v2";

export function Hero() {
  return (
    <section className="hero" aria-label="Uvod">
      <div className="hero__media">
        {/* Poster = the first frame of the video. This image is the LCP element. */}
        <picture>
          <source media="(prefers-reduced-motion: reduce)" type="image/avif" srcSet={`/video/hero-still-1920.${V}.avif`} />
          <source media="(prefers-reduced-motion: reduce)" srcSet={`/video/hero-still-1920.${V}.jpg`} />
          <source media={PORTRAIT_QUERY} type="image/avif" srcSet={`/video/hero-poster-portrait-720.${V}.avif`} />
          <source media={PORTRAIT_QUERY} srcSet={`/video/hero-poster-portrait-720.${V}.jpg`} />
          <source type="image/avif" srcSet={`/video/hero-poster-1920.${V}.avif`} />
          <img src={`/video/hero-poster-1920.${V}.jpg`} alt="" fetchPriority="high" decoding="sync" />
        </picture>
        <HeroVideo />
      </div>
      <div className="hero__scrim" />

      <div className="hero__content">
        <div className="wrap hero__rise flex flex-col gap-4 md:gap-5">
          <h1 className="hero__title max-w-[13ch]">{hero.headline}</h1>
          <p className="max-w-[38ch] text-[clamp(1rem,1.3vw,1.2rem)] leading-snug text-white/85">{hero.sub}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/#paketi" className="btn btn-primary max-sm:flex-1">
              {hero.primary}
            </Link>
            <Link href="/#kako-deluje" className="btn btn-secondary max-sm:flex-1">
              {hero.secondary}
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-[0.95rem] text-white/85">
            <div className="flex flex-wrap gap-x-7 gap-y-2">
              {site.phone ? (
                <a href={`tel:${site.phone}`} className="link-action">
                  {hero.call}
                </a>
              ) : null}
              <Link href={signupHref({ enquiry: true })} className="link-action">
                {hero.enquiry}
              </Link>
            </div>
            <p className="t-label text-white/60">
              {site.area} · od {eur(lowestMonthly)} na mesec
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
