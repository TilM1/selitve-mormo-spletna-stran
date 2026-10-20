import Image from "next/image";
import { oldVsNew as c } from "@/content/home";
import sloveniaImg from "@/public/img/slovenia.jpg";

// Two routes. The long, winding, dusty one is the old way; the short straight lime one is ours.
// The difference in length is the message.
export function OldVsNew() {
  return (
    <section id="zakaj" className="section dusty bg-asphalt text-white">
      <div className="wrap">
        <h2 className="t-headline reveal max-w-[18ch]">{c.headline}</h2>

        {/* Old way */}
        <div className="mt-16 md:mt-24">
          <p className="t-label text-dust">{c.oldLabel}</p>

          {/* Desktop: winding road */}
          <div className="relative mt-10 hidden h-[190px] md:block">
            <svg className="draw absolute inset-x-0 top-[35px] h-[120px] w-full" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
              <path
                d="M0 60 C 50 60, 50 12, 100 12 S 200 108, 300 108 S 400 12, 500 12 S 600 108, 700 108 S 800 12, 900 12 S 950 60, 1000 60"
                fill="none"
                stroke="var(--color-dust)"
                strokeWidth="3"
                strokeDasharray="2 9"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <ol className="contents">
              {c.oldSteps.map((step, i) => {
                const up = i % 2 === 0;
                return (
                  <li key={step} className="absolute -translate-x-1/2" style={{ left: `${10 + i * 20}%`, top: up ? 47 : 143 }}>
                    <span className="absolute left-1/2 top-0 block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-dust bg-asphalt" />
                    <span className={`t-title absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-white/90 ${up ? "bottom-5" : "top-5"}`}>
                      {step}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Mobile: the same road, vertical */}
          <ol className="mt-8 border-l-[3px] border-dotted border-dust md:hidden">
            {c.oldSteps.map((step) => (
              <li key={step} className="relative py-4 pl-7">
                <span className="absolute -left-[9.5px] top-1/2 block h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-dust bg-asphalt" />
                <span className="t-title text-white/90">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Our way */}
        <div className="mt-16 md:mt-24">
          <p className="t-label text-lime">{c.newLabel}</p>

          <div className="relative mt-10 hidden h-[70px] md:block md:w-[66%]">
            <span className="draw absolute inset-x-0 top-[6px] h-[3px] rounded-full bg-lime" />
            <ol className="contents">
              {c.newSteps.map((step, i) => (
                <li key={step} className="absolute" style={{ left: `${i * 50}%` }}>
                  <span className="absolute left-0 top-0 block h-4 w-4 -translate-x-1/2 rounded-full bg-lime" />
                  <span className={`t-title absolute top-8 whitespace-nowrap text-lime ${i === 0 ? "left-0" : i === 2 ? "right-0" : "left-0 -translate-x-1/2"}`}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <ol className="mt-8 border-l-[3px] border-lime md:hidden">
            {c.newSteps.map((step) => (
              <li key={step} className="relative py-4 pl-7">
                <span className="absolute -left-[9.5px] top-1/2 block h-4 w-4 -translate-y-1/2 rounded-full bg-lime" />
                <span className="t-title text-lime">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Closing */}
        <div className="mt-20 grid items-center gap-8 md:mt-32 md:grid-cols-[1fr_1.15fr] md:gap-14">
          <div className="reveal">
            <p className="t-display !text-[clamp(2.4rem,5.6vw,5.25rem)]">{c.closing}</p>
            <p className="t-lead mt-5 text-white/75">{c.closingSub}</p>
          </div>
          <Image
            src={sloveniaImg}
            alt="Obris Slovenije z označeno Ljubljano in okolico"
            sizes="(min-width: 768px) 55vw, 100vw"
            placeholder="blur"
            className="w-full rounded-2xl md:rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
}
