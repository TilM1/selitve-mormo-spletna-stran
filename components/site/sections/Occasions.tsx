import { Droplet } from "@/components/ui/Droplet";
import { occasions } from "@/config/catalog";
import { occasionsCopy as c } from "@/content/home";

const tones = {
  lime: "bg-lime text-ink",
  ink: "bg-ink text-white",
  fog: "bg-fog text-ink",
  water: "bg-water text-ink",
} as const;

// Four tall posters in a sideways-scrolling row (native scroll-snap).
export function Occasions() {
  return (
    <section className="bg-white pb-[clamp(88px,11vw,160px)]">
      <div className="wrap">
        <h2 className="t-headline reveal">{c.headline}</h2>
        <p className="t-lead mt-5 max-w-[40ch] text-steel">{c.sub}</p>
      </div>
      <ul
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:px-[max(40px,calc((100vw-1320px)/2+40px))]"
        aria-label={c.headline}
        tabIndex={0}
      >
        {occasions.map((o, i) => (
          <li
            key={o.key}
            className={`snap-scale flex aspect-[4/5] w-[78vw] shrink-0 snap-center flex-col justify-between rounded-2xl p-7 sm:w-[44vw] md:rounded-3xl md:p-9 lg:w-[calc((min(100vw,1320px)-80px-48px)/4)] ${tones[o.tone]}`}
          >
            <div className="flex items-start justify-between">
              <span className="t-num text-xl opacity-60">0{i + 1}</span>
              <Droplet className="h-7 w-auto opacity-80" />
            </div>
            <div>
              <h3 className="t-headline !text-[clamp(1.9rem,2.6vw,2.6rem)]">{o.name}</h3>
              <p className="mt-3 opacity-75">{o.line}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="wrap">
        <p className="t-label mt-8 text-steel">{c.note}</p>
      </div>
    </section>
  );
}
