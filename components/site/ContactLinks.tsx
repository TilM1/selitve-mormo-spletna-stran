"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { sms, tel } from "@/config/site";
import { track } from "@/lib/track";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { children: ReactNode; place?: string };

// Every "call" and "SMS" link on the site goes through these, so the number and tracking live in one place.

export function CallLink({ children, place = "unknown", onClick, ...rest }: Props) {
  return (
    <a
      href={tel}
      onClick={(e) => {
        track("phone_click", { place });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export function SmsLink({ children, place = "unknown", onClick, ...rest }: Props) {
  return (
    <a
      href={sms}
      onClick={(e) => {
        track("sms_click", { place });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
