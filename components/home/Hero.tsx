import Link from "next/link";
import { ArrowDown, Phone } from "@phosphor-icons/react/ssr";
import { inquiryHref, site } from "@/config/site";
import { CallLink } from "@/components/site/ContactLinks";
import { HeroVideoController } from "./HeroVideo";

// Server-rendered as plain HTML so `muted` is a real attribute before hydration;
// React does not render `muted`, which breaks iOS autoplay.
const heroVideoHtml = `<video class="hero__video" autoplay muted loop playsinline preload="metadata"
  poster="/hero/selitve-hero-poster.webp" aria-hidden="true" tabindex="-1" disablepictureinpicture disableremoteplayback>
  <source src="/hero/selitve-hero-720.webm" type="video/webm" media="(max-width: 900px)">
  <source src="/hero/selitve-hero-720.mp4" type="video/mp4" media="(max-width: 900px)">
  <source src="/hero/selitve-hero-1080.webm" type="video/webm">
  <source src="/hero/selitve-hero-1080.mp4" type="video/mp4">
</video>`;

export function Hero() {
  return (
    <section className="hero" aria-label="Selitve po Ljubljani in okolici">
      <div className="contents" dangerouslySetInnerHTML={{ __html: heroVideoHtml }} />
      <HeroVideoController />
      <div className="hero__overlay" aria-hidden />

      <div className="wrap hero__rise self-center py-8 md:py-10">
        <h1 className="hero__title max-w-[19ch]">
          Selitveni servis Ljubljana. <span className="text-white/80">Selitve brez zapletov.</span>
        </h1>
        <p className="mt-5 max-w-[42ch] text-[1.05rem] leading-relaxed text-white/85">
          Selitve stanovanj, pisarn in prevoz pohištva po Ljubljani ter okolici. Pomagamo pri prenašanju, zaščiti in prevozu vaših stvari.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <CallLink place="hero" className="btn btn-primary">
            <Phone size={20} weight="fill" aria-hidden />
            Pokličite nas
          </CallLink>
          <Link href={inquiryHref} className="btn btn-glass">
            Pošljite povpraševanje
          </Link>
        </div>
      </div>

      <div className="wrap flex items-end justify-between gap-8 pb-[max(28px,env(safe-area-inset-bottom))]">
        <div>
          <p className="text-lg font-semibold text-white/90">Zakaj Selitve Mormo?</p>
          <p className="hero__sig mt-2 lg:whitespace-nowrap">
            Ker mormo <span className="text-lime">delat!</span>
          </p>
          <CallLink
            place="hero-signature"
            className="t-num mt-4 inline-flex items-center gap-3 whitespace-nowrap text-[clamp(1.4rem,min(2.4vw,4.2svh),2rem)] decoration-lime decoration-2 underline-offset-8 hover:underline"
          >
            <span className="grid h-[1.4em] w-[1.4em] place-items-center rounded-full bg-lime text-ink" aria-hidden>
              <Phone size="0.62em" weight="fill" />
            </span>
            <span>
              <span className="sr-only">Pokličite </span>
              {site.phone.display}
            </span>
          </CallLink>
        </div>
        <Link
          href={inquiryHref}
          className="group hidden shrink-0 items-center gap-3 pb-2 text-sm font-semibold text-white/80 hover:text-white md:flex"
        >
          Izberite pot na zemljevidu
          <span className="grid h-11 w-11 place-items-center rounded-full border border-white/40 transition-transform group-hover:translate-y-1">
            <ArrowDown size={18} weight="bold" aria-hidden />
          </span>
        </Link>
      </div>
      <div id="hero-end" className="absolute inset-x-0 bottom-0 h-px" aria-hidden />
    </section>
  );
}
