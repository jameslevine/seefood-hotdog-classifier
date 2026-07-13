import Link from "next/link";
import { MarketingVisual } from "@/components/MarketingVisual";

export default function MarketingHome() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-grid">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              Powered by Amazon Bedrock · Claude Vision
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Is it a hot dog?
              <br />
              <span className="text-brand">Know for certain.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
              SeeFood is the enterprise-grade visual cuisine intelligence
              platform. Upload any image and receive a single, definitive
              verdict — scored, explained, and logged for audit.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Start classifying
              </Link>
              <Link
                href="/contact"
                className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-background"
              >
                Book a demo
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted">
              No credit card required · SOC 2 Type II · 99.9% uptime SLA
            </p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border shadow-lg">
            <MarketingVisual
              src="/marketing/hero.webp"
              alt="Abstract visualization of AI-powered food recognition"
              priority
            />
          </div>
        </div>
      </section>

      {/* Logo / social-proof strip */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-muted">
            Trusted by teams that take classification seriously
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            {["Nucleus", "Vertexon", "Meridian", "Halcyon", "Northwind"].map(
              (name) => (
                <span
                  key={name}
                  className="text-lg font-semibold tracking-tight text-muted"
                >
                  {name}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            One question. Answered definitively.
          </h2>
          <p className="mt-3 text-muted">
            Everything you need to operationalize hot dog detection at scale.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <FeatureCard
            img="/marketing/feature-deterministic.webp"
            imgAlt="Deterministic binary verdict visualization"
            title="Deterministic verdicts"
            body="A binary, unambiguous classification every time — engineered for downstream automation and zero ambiguity."
          />
          <FeatureCard
            img="/marketing/feature-explainable.webp"
            imgAlt="Explainable AI rationale visualization"
            title="Explainable AI"
            body="Every result ships with a model-confidence score and a concise analyst rationale you can act on."
          />
          <FeatureCard
            img="/marketing/feature-audit.webp"
            imgAlt="Audit trail and compliance visualization"
            title="Audit-ready by default"
            body="Each classification is persisted with a thumbnail, latency, and timestamp — a complete compliance trail."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              From upload to verdict in seconds
            </h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <Step
              n="01"
              title="Upload"
              body="Drag and drop any image, or integrate via our REST API."
            />
            <Step
              n="02"
              title="Analyze"
              body="Our vision engine runs inference on Amazon Bedrock in ~1 second."
            />
            <Step
              n="03"
              title="Act"
              body="Receive a verdict, confidence, and rationale — logged for audit."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="overflow-hidden rounded-xl border border-border bg-brand px-8 py-14 text-center shadow-lg">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ready to know for certain?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Join the teams operationalizing visual cuisine intelligence. Start
            free — no credit card required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-brand shadow-sm transition-opacity hover:opacity-90"
            >
              Start classifying
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  img,
  imgAlt,
  title,
  body,
}: {
  img: string;
  imgAlt: string;
  title: string;
  body: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="relative aspect-[16/10] border-b border-border">
        <MarketingVisual src={img} alt={imgAlt} />
      </div>
      <div className="p-6">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-mono text-sm font-semibold text-brand-accent">
        {n}
      </div>
      <h3 className="mt-2 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
