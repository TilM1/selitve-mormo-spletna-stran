import Link from "next/link";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "./JsonLd";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Domov", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Drobtine" className="text-sm text-white/65">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden>/</span> : null}
              {i < all.length - 1 ? (
                <Link href={it.path} className="hover:text-white">
                  {it.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-white/90">
                  {it.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(all)} />
    </>
  );
}
