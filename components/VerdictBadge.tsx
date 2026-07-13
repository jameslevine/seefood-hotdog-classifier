import { VERDICT_LABEL, type Verdict } from "@/lib/types";

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const positive = verdict === "HOT_DOG";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        positive
          ? "bg-positive-bg text-positive"
          : "bg-negative-bg text-negative"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          positive ? "bg-positive" : "bg-negative"
        }`}
      />
      {VERDICT_LABEL[verdict]}
    </span>
  );
}
