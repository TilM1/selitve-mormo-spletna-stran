import { BeforeAfter } from "@/components/motion/BeforeAfter";
import { beforeAfter as c } from "@/content/home";
import beforeImg from "@/public/img/before.jpg";
import afterImg from "@/public/img/after.jpg";

// before.jpg and after.jpg are a pixel-matched pair: same car, same angle, same framing.
export function BeforeAfterSection() {
  return (
    <section className="bg-graphite pb-[clamp(88px,11vw,160px)] text-white">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="t-headline reveal max-w-[14ch]">{c.headline}</h2>
          <p className="t-label text-white/60">{c.hint}</p>
        </div>
        <div className="mt-10 md:mt-14">
          <BeforeAfter before={beforeImg} after={afterImg} beforeLabel={c.before} afterLabel={c.after} beforeAlt={c.beforeAlt} afterAlt={c.afterAlt} ariaLabel={c.hint} />
        </div>
      </div>
    </section>
  );
}
