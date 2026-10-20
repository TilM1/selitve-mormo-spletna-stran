// Telephone input without a heavy library. Accepts Slovenian national numbers ("064 195 960", "01 234 56 78")
// and international numbers ("+386 30 555 543", "0043 660 1234567"). Returns E.164 or null.

export function normalizePhone(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/[^\d\s()+\-./]/.test(raw)) return null;

  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.indexOf("+") > 0) return null;
  if (digits.startsWith("00")) digits = "+" + digits.slice(2);

  if (digits.startsWith("+")) {
    const n = digits.slice(1);
    if (n.startsWith("386")) {
      const national = n.slice(3).replace(/^0/, "");
      return /^\d{8}$/.test(national) ? `+386${national}` : null;
    }
    return /^[1-9]\d{6,14}$/.test(n) ? `+${n}` : null;
  }

  // National Slovenian format: 0 + 8 digits (mobile 0xx xxx xxx, landline 0x xxx xx xx).
  if (/^0\d{8}$/.test(digits)) return `+386${digits.slice(1)}`;
  return null;
}
