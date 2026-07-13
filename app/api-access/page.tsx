import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Access — SeeFood™",
  description: "Integrate SeeFood classification into your own systems.",
};

const CURL = `curl -X POST https://seefood-hotdog-classifier.vercel.app/api/classify \\
  -H "Authorization: Bearer $SEEFOOD_API_KEY" \\
  -F "image=@lunch.jpg"`;

const RESPONSE = `{
  "id": "a940a853-be50-46c7-9efe-a550eaa8a9f9",
  "verdict": "HOT_DOG",
  "confidence": 95,
  "rationale": "Image shows a cooked sausage with mustard in a sliced bun.",
  "latencyMs": 1997,
  "modelId": "eu.anthropic.claude-haiku-4-5-20251001-v1:0",
  "createdAt": "2026-07-13T12:58:33.211Z"
}`;

export default function ApiAccessPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center gap-2 text-xs font-medium text-muted">
        <Link href="/" className="hover:text-foreground">
          SeeFood
        </Link>
        <span>/</span>
        <span className="text-foreground">API Access</span>
      </div>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
        Classification API
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Integrate deterministic hot dog classification into your own pipelines.
        A single REST endpoint returns a verdict, confidence score, and
        rationale for any image.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-xs">
        <Pill>REST</Pill>
        <Pill>JSON</Pill>
        <Pill>multipart/form-data</Pill>
        <Pill>≤ 10 MB / image</Pill>
      </div>

      {/* Endpoint */}
      <section className="mt-10">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-brand px-2 py-1 font-mono text-xs font-semibold text-white">
            POST
          </span>
          <code className="font-mono text-sm text-foreground">
            /api/classify
          </code>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <CodeBlock title="Request" code={CURL} />
          <CodeBlock title="200 · Response" code={RESPONSE} />
        </div>
      </section>

      {/* Fields */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Response fields
        </h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-border">
              <Field
                name="verdict"
                type="string"
                desc={`"HOT_DOG" or "NOT_HOT_DOG" — the definitive classification.`}
              />
              <Field
                name="confidence"
                type="integer"
                desc="0–100. The model's confidence in the stated verdict."
              />
              <Field
                name="rationale"
                type="string"
                desc="One-sentence, human-readable explanation of the decision."
              />
              <Field
                name="latencyMs"
                type="integer"
                desc="End-to-end server processing time in milliseconds."
              />
              <Field
                name="id"
                type="string"
                desc="Unique classification identifier, retained in the audit log."
              />
            </tbody>
          </table>
        </div>
      </section>

      {/* Tiers */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Plans
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Tier name="Developer" price="Free" items={["100 req / day", "Community support", "Shared throughput"]} />
          <Tier
            name="Business"
            price="$0.004 / req"
            highlight
            items={["100k req / day", "99.9% SLA", "Priority routing", "Audit exports"]}
          />
          <Tier name="Enterprise" price="Custom" items={["Unlimited volume", "Dedicated capacity", "SSO & DPA", "VPC deployment"]} />
        </div>
      </section>

      <div className="mt-10 rounded-xl border border-border bg-surface p-5 text-sm text-muted">
        <span className="font-semibold text-foreground">Note:</span> the API
        requires authentication. Create a free account, then mint a key on the{" "}
        <Link href="/keys" className="font-medium text-brand-accent underline underline-offset-2">
          API Keys
        </Link>{" "}
        page and pass it as a Bearer token. Per-key rate limiting is on the
        roadmap.{" "}
        <Link
          href="/app"
          className="font-medium text-brand-accent underline underline-offset-2"
        >
          Try the classifier →
        </Link>
      </div>
    </div>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-border bg-surface px-2.5 py-1 font-medium text-muted">
      {children}
    </span>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border bg-background px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted">
        {title}
      </div>
      <pre className="overflow-x-auto bg-[#0f172a] p-4 text-xs leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Field({
  name,
  type,
  desc,
}: {
  name: string;
  type: string;
  desc: string;
}) {
  return (
    <tr>
      <td className="whitespace-nowrap px-4 py-3 align-top font-mono text-sm text-foreground">
        {name}
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top font-mono text-xs text-muted">
        {type}
      </td>
      <td className="px-4 py-3 align-top text-muted">{desc}</td>
    </tr>
  );
}

function Tier({
  name,
  price,
  items,
  highlight,
}: {
  name: string;
  price: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-surface p-5 shadow-sm ${
        highlight ? "border-brand-accent ring-1 ring-brand-accent/30" : "border-border"
      }`}
    >
      <div className="text-sm font-semibold text-foreground">{name}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">
        {price}
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-muted">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-accent" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
