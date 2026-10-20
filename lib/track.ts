// Privacy-friendly event hook. Sends nothing unless an analytics script is installed
// (Plausible, or a Google Tag Manager dataLayer set up with consent).

export type TrackEvent =
  | "phone_click"
  | "sms_click"
  | "inquiry_started"
  | "inquiry_step_completed"
  | "inquiry_submitted"
  | "contact_form_submitted";

type W = Window & {
  plausible?: (e: string, o?: { props?: Record<string, string | number> }) => void;
  dataLayer?: Record<string, unknown>[];
};

export function track(event: TrackEvent, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const w = window as W;
  w.plausible?.(event, props ? { props } : undefined);
  w.dataLayer?.push({ event, ...props });
}
