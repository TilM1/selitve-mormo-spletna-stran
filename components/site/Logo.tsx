/* eslint-disable @next/next/no-img-element */
// The supplied brand files, served as-is. "dark" = for dark backgrounds (white type, lime box).

export function Logo({ variant = "dark", className }: { variant?: "dark" | "light"; className?: string }) {
  return (
    <img
      src={`/brand/selitve-mormo-logo-${variant}.svg`}
      alt="Selitve Mormo"
      width={11178}
      height={870}
      className={className}
      decoding="async"
    />
  );
}
