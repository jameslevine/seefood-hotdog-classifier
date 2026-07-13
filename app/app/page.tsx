import type { Metadata } from "next";
import Link from "next/link";
import { Classifier } from "@/components/Classifier";

export const metadata: Metadata = {
  title: "Classify — SeeFood™",
  description:
    "Upload an image and receive a definitive Hot Dog / Not Hot Dog verdict with a confidence score and rationale.",
};

export default function ClassifyApp() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-grid">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Powered by Amazon Bedrock · Claude Vision
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Visual Cuisine Intelligence,
              <br />
              <span className="text-brand">delivered with confidence.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
              SeeFood classifies any image with a single, definitive verdict:
              <span className="font-semibold text-foreground"> Hot Dog</span> or
              <span className="font-semibold text-foreground">
                {" "}
                Not Hot Dog
              </span>
              . Every classification is scored, explained, and logged for audit.
            </p>
          </div>
        </div>
      </section>

      {/* Classifier */}
      <section className="mx-auto max-w-2xl px-6 py-10">
        <Classifier />
        <p className="mt-6 text-center text-xs text-muted">
          Images are downscaled to a thumbnail for audit retention. We never
          store your original file.{" "}
          <Link
            href="/dashboard"
            className="font-medium text-brand-accent underline underline-offset-2"
          >
            View the classification dashboard →
          </Link>
        </p>
      </section>

      {/* Trust bar */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 sm:grid-cols-3">
          <Feature
            title="Deterministic verdicts"
            body="A binary, unambiguous classification every time — engineered for downstream automation."
          />
          <Feature
            title="Explainable AI"
            body="Each result ships with a model-confidence score and a concise analyst rationale."
          />
          <Feature
            title="Audit-ready"
            body="Every classification is persisted with a thumbnail, latency, and timestamp for compliance."
          />
        </div>
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
