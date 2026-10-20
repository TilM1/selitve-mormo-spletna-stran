// The droplet from the logo, reused as bullet, marker and handle.
export function Droplet({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="4674 -493 270 493" className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path fill="currentColor" d="M4809 -493 C4856 -419 4944 -196 4944 -135 A135 135 0 1 1 4674 -135 C4674 -196 4762 -419 4809 -493Z" />
    </svg>
  );
}
