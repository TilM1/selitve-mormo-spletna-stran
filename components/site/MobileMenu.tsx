"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";
import { CallLink, SmsLink } from "./ContactLinks";

type Item = { href: string; label: string };

export function MobileMenu({ items, services }: { items: Item[]; services: Item[] }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.getElementById("mobile-menu")?.querySelector("a")?.focus();
    document.body.style.overflow = "hidden";
    document.documentElement.setAttribute("data-menu-open", "");
    return () => {
      document.documentElement.removeAttribute("data-menu-open");
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Zapri meni" : "Odpri meni"}
        onClick={() => setOpen((v) => !v)}
        className="grid h-[44px] w-[44px] place-items-center rounded-full"
      >
        <span className="relative block h-3 w-5" aria-hidden>
          <span className={`absolute left-0 h-[2px] w-5 bg-current transition-transform duration-200 ${open ? "top-[5px] rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 h-[2px] w-5 bg-current transition-transform duration-200 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
        </span>
      </button>
      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Meni"
          className="fixed inset-x-0 bottom-0 top-[var(--nav-h)] z-40 overflow-y-auto bg-ink px-4 pb-12 pt-4 text-white"
        >
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={close} className="t-title block border-b border-white/10 py-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="t-label mt-8 text-white/60">Storitve</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4">
            {services.map((s) => (
              <li key={s.href}>
                <Link href={s.href} onClick={close} className="block py-2.5 text-white/85">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3">
            <CallLink place="menu" className="btn btn-primary btn-lg">
              Pokličite nas {site.phone.display}
            </CallLink>
            <SmsLink place="menu" className="btn btn-ghost btn-lg">
              Pošljite SMS
            </SmsLink>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
