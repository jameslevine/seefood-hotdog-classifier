export function ConfidenceMeter({
  value,
  tone,
}: {
  value: number; // 0-100
  tone: "positive" | "negative";
}) {
  const color = tone === "positive" ? "bg-positive" : "bg-negative";
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
        <span className="uppercase tracking-wider text-muted">
          Model confidence
        </span>
        <span className="font-mono text-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full ${color} transition-[width] duration-700 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
