// SeeFood wordmark + glyph. The glyph is a stylized hot dog inside a
// "detection" viewfinder — a serious take on an inherently silly product.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-white shadow-sm">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          {/* viewfinder corners */}
          <path
            d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* sausage */}
          <rect
            x="7"
            y="10.5"
            width="10"
            height="3"
            rx="1.5"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          SeeFood
          <span className="align-super text-[9px] font-normal text-muted">
            ™
          </span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
          Cuisine Intelligence
        </span>
      </span>
    </span>
  );
}
