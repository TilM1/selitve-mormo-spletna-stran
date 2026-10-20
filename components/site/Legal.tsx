// Shared layout for the legal pages.
export function Legal({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <section className="bg-white pb-24 pt-[calc(var(--nav-h)+56px)] md:pt-[calc(var(--nav-h)+88px)]">
      <div className="wrap">
        <div className="mx-auto max-w-[760px]">
          <h1 className="t-headline">{title}</h1>
          <p className="mt-3 text-steel">Veljavno od {updated}</p>
          <div className="legal mt-10">{children}</div>
        </div>
      </div>
    </section>
  );
}
