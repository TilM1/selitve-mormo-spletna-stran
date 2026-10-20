import { site } from "@/config/site";
import { reviews as c } from "@/content/home";

// Hidden until there are real reviews: set site.show.reviews = true and fill content/home.ts.
export function Reviews() {
  if (!site.show.reviews || c.items.length === 0) return null;
  const [first, ...rest] = c.items;
  return (
    <section className="section bg-white">
      <div className="wrap">
        <h2 className="t-label text-steel">{c.headline}</h2>
        <figure className="mt-8">
          <blockquote className="t-headline max-w-[24ch]">„{first.quote}“</blockquote>
          <figcaption className="mt-6 text-steel">
            {first.name} · {first.car}
          </figcaption>
        </figure>
        {rest.length > 0 ? (
          <div className="mt-14 grid gap-8 border-t border-mist pt-10 md:grid-cols-3">
            {rest.slice(0, 3).map((r) => (
              <figure key={r.name}>
                <blockquote className="t-lead">„{r.quote}“</blockquote>
                <figcaption className="mt-3 text-sm text-steel">
                  {r.name} · {r.car}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
