import { ConfidenceMeter } from "./ConfidenceMeter";
import { VERDICT_LABEL, type ClassifyResponse } from "@/lib/types";

export function VerdictCard({
  result,
  previewUrl,
}: {
  result: ClassifyResponse;
  previewUrl: string;
}) {
  const positive = result.verdict === "HOT_DOG";
  const tone = positive ? "positive" : "negative";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {/* Verdict banner */}
      <div
        className={`flex items-center gap-3 px-6 py-5 ${
          positive
            ? "bg-positive-bg text-positive"
            : "bg-negative-bg text-negative"
        }`}
      >
        <VerdictIcon positive={positive} />
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
            Classification result
          </div>
          <div className="text-2xl font-bold leading-tight">
            {VERDICT_LABEL[result.verdict]}
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-6 sm:grid-cols-[128px_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Submitted for classification"
          className="h-32 w-32 rounded-lg border border-border object-cover"
        />
        <div className="flex flex-col justify-between gap-4">
          <ConfidenceMeter value={result.confidence} tone={tone} />
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
              Analyst rationale
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {result.rationale}
            </p>
          </div>
        </div>
      </div>

      {/* Metadata strip */}
      <dl className="grid grid-cols-3 divide-x divide-border border-t border-border text-center">
        <Meta label="Latency" value={`${result.latencyMs} ms`} />
        <Meta label="Model" value={shortModel(result.modelId)} />
        <Meta label="Classification ID" value={result.id.slice(0, 8)} mono />
      </dl>
    </div>
  );
}

function Meta({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="px-3 py-3">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd
        className={`mt-0.5 truncate text-sm text-foreground ${
          mono ? "font-mono" : ""
        }`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function shortModel(id: string): string {
  if (id.includes("haiku")) return "Claude Haiku 4.5";
  if (id.includes("sonnet")) return "Claude Sonnet";
  if (id.includes("opus")) return "Claude Opus";
  return id.split(".").pop() ?? id;
}

function VerdictIcon({ positive }: { positive: boolean }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/70 shadow-sm">
      {positive ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6 9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}
