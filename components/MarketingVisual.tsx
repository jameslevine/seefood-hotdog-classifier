import Image from "next/image";
import { existsSync } from "node:fs";
import { join } from "node:path";

// Renders a generated marketing image if it exists in public/marketing/,
// otherwise a branded gradient placeholder. This lets the landing page ship
// before the Magnific pipeline (Phase 0.3) has produced assets — imagery is
// progressive enhancement, never a hard dependency.
export function MarketingVisual({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string; // e.g. "/marketing/hero.webp"
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const exists = existsSync(join(process.cwd(), "public", src));

  if (!exists) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={`absolute inset-0 h-full w-full overflow-hidden bg-gradient-to-br from-brand via-brand-accent to-brand ${className}`}
      >
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 grid place-items-center">
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" className="text-white/80">
            <path
              d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <rect x="7" y="10.5" width="10" height="3" rx="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={`object-cover ${className}`}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
