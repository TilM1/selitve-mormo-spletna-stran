import Image from "next/image";
import { addonGroups, eur } from "@/config/catalog";
import { addonsCopy as c } from "@/content/home";
import vacuumImg from "@/public/img/vacuum.jpg";

// A typographic menu, not a grid of cards.
export function Addons() {
  return (
    <section id="storitve" className="section bg-white">
      <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
        <div className="lg:sticky lg:top-[14vh] lg:self-start">
          <h2 className="t-headline reveal max-w-[12ch]">{c.headline}</h2>
          <p className="t-lead mt-5 text-steel">{c.note}</p>
          <Image
            src={vacuumImg}
            alt="Sesanje usnjenega sedeža v avtu"
            sizes="(min-width: 1024px) 40vw, 100vw"
            placeholder="blur"
            className="mt-10 aspect-[4/3] w-full rounded-2xl object-cover md:rounded-3xl"
          />
        </div>
        <div className="flex flex-col gap-12">
          {addonGroups.map((group) => (
            <div key={group.title}>
              <h3 className="t-label text-steel">{group.title}</h3>
              <ul className="mt-4">
                {group.items.map((item) => (
                  <li key={item.key} className="flex items-baseline gap-3 border-b border-fog py-4">
                    <span className="t-title !text-[clamp(1.125rem,1.6vw,1.5rem)]">{item.name}</span>
                    <span className="leader" aria-hidden="true" />
                    <span className="t-num whitespace-nowrap text-[clamp(1.125rem,1.6vw,1.5rem)]">+{eur(item.price, item.priceTo)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
