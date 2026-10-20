// All customer-facing times are Europe/Ljubljana, whatever the server's own clock says.

const TZ = "Europe/Ljubljana";
const dateKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const timeFmt = new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: false });
const longFmt = new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
const monthFmt = new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, month: "long" });
const shortFmt = new Intl.DateTimeFormat("sl-SI", { timeZone: TZ, day: "numeric", month: "numeric", year: "numeric" });

/** "2026-10-14" */
export const ljDateKey = (d: Date | string) => dateKeyFmt.format(new Date(d));
/** "13:30" */
export const ljTime = (d: Date | string) => timeFmt.format(new Date(d)).replace(".", ":");
/** "sreda, 14. oktober" */
export const ljDate = (d: Date | string) => longFmt.format(new Date(d));
/** "sreda, 14. oktober ob 13:30" */
export const ljDateTime = (d: Date | string) => `${ljDate(d)} ob ${ljTime(d)}`;
/** "oktober" */
export const ljMonth = (d: Date | string) => monthFmt.format(new Date(d));
/** "14. 10. 2026" */
export const ljShort = (d: Date | string) => shortFmt.format(new Date(d));
