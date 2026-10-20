import Image from "next/image";
import { AI_LABEL, type Photo } from "@/content/photos";

// One photo treatment for the whole site: 20px radius, a faint outline for depth on any background,
// and the AI label under generated images.
export function Figure({
  photo,
  sizes,
  className = "",
  imgClassName = "",
  tone = "light",
  priority,
}: {
  photo: Photo;
  sizes: string;
  className?: string;
  imgClassName?: string;
  tone?: "light" | "dark";
  priority?: boolean;
}) {
  return (
    <figure className={className}>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        priority={priority}
        className={`h-auto w-full rounded-[20px] object-cover outline outline-1 -outline-offset-1 ${
          tone === "dark" ? "outline-white/10" : "outline-black/10"
        } ${imgClassName}`}
      />
      {photo.ai ? (
        <figcaption className={`mt-2 text-xs ${tone === "dark" ? "text-white/55" : "text-steel"}`}>{AI_LABEL}</figcaption>
      ) : null}
    </figure>
  );
}
