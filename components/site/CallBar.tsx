import Link from "next/link";
import { ClipboardText, Phone } from "@phosphor-icons/react/ssr";
import { inquiryHref } from "@/config/site";
import { CallLink } from "./ContactLinks";

// Mobile only. Hidden over the hero (its CTAs are already on screen), slides in after.
export function CallBar() {
  return (
    <div className="callbar" role="region" aria-label="Hitri kontakt">
      <CallLink place="callbar" className="btn btn-primary w-full">
        <Phone size={20} weight="fill" aria-hidden />
        Pokliči
      </CallLink>
      <Link href={inquiryHref} className="btn btn-ghost w-full text-white">
        <ClipboardText size={20} weight="bold" aria-hidden />
        Povpraševanje
      </Link>
    </div>
  );
}
