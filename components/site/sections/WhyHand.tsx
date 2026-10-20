import Image from "next/image";
import { why as c } from "@/content/home";
import doorImg from "@/public/img/door.jpg";

export function WhyHand() {
  return (
    <section className="bg-white pb-[clamp(88px,11vw,160px)]">
      <div className="wrap grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <Image
          src={doorImg}
          alt="Rožnata pena, ki spira blato z vrat avtomobila"
          sizes="(min-width: 1024px) 50vw, 100vw"
          placeholder="blur"
          className="aspect-[4/3] w-full rounded-2xl object-cover md:rounded-3xl lg:aspect-[5/6]"
        />
        <div>
          <h2 className="t-headline reveal max-w-[13ch]">{c.headline}</h2>
          <ul className="mt-10 flex flex-col">
            {c.points.map((p) => (
              <li key={p.title} className="border-t border-mist py-6">
                <h3 className="t-title">{p.title}</h3>
                <p className="mt-2 max-w-[42ch] text-steel">{p.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 max-w-[52ch] border-t border-mist pt-6 text-sm text-steel">{c.note}</p>
        </div>
      </div>
    </section>
  );
}
