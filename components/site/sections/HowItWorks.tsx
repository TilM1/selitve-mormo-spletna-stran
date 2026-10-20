import Image from "next/image";
import Link from "next/link";
import { howItWorks as c } from "@/content/home";
import aerialImg from "@/public/img/aerial.jpg";
import vanImg from "@/public/img/van.jpg";
import foamImg from "@/public/img/foam.jpg";

const images = [
  { src: aerialImg, alt: "Avto, parkiran na dovozu pred hišo" },
  { src: vanImg, alt: "Kombi Mormo.si prihaja do parkiranega avta" },
  { src: foamImg, alt: "Ročno nanašanje rožnate pene na avto" },
];

// Three steps side by side, all visible at once. On phones: compact rows with a small image.
export function HowItWorks() {
  return (
    <section id="kako-deluje" className="section bg-graphite text-white">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="t-headline reveal">{c.headline}</h2>
          <Link href="/#paketi" className="link-action text-lime">
            {c.link} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ol className="mt-10 grid gap-6 md:mt-14 md:grid-cols-3 md:gap-5">
          {c.steps.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[104px_1fr] items-center gap-5 md:block">
              <Image
                src={images[i].src}
                alt={images[i].alt}
                sizes="(min-width: 768px) 32vw, 104px"
                placeholder="blur"
                className="aspect-square w-full rounded-xl object-cover md:aspect-[4/3] md:rounded-3xl"
              />
              <div className="md:mt-6 md:flex md:gap-5">
                <span className="t-num block text-[2.25rem] leading-none text-lime md:text-[4rem]">{i + 1}</span>
                <div>
                  <h3 className="t-title mt-1 md:mt-2">{step.title}</h3>
                  <p className="mt-1 max-w-[30ch] text-white/75 md:mt-2">{step.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
