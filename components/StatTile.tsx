export function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "positive" | "negative" | "brand";
}) {
  const valueColor =
    accent === "positive"
      ? "text-positive"
      : accent === "negative"
        ? "text-negative"
        : accent === "brand"
          ? "text-brand"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className={`mt-2 text-3xl font-bold tracking-tight ${valueColor}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}
