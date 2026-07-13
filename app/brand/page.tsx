import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { StatTile } from "@/components/StatTile";
import { VerdictBadge } from "@/components/VerdictBadge";

export const metadata: Metadata = {
  title: "Brand & Design System — SeeFood™",
  description:
    "The living style guide for SeeFood: color, typography, spacing, elevation, and components — rendered from the same tokens the product ships.",
};

const COLORS: { name: string; varName: string; role: string; dark?: boolean }[] =
  [
    { name: "Brand", varName: "--brand", role: "Primary navy", dark: true },
    { name: "Accent", varName: "--brand-accent", role: "Indigo", dark: true },
    { name: "Foreground", varName: "--foreground", role: "Primary text", dark: true },
    { name: "Muted", varName: "--muted", role: "Secondary text", dark: true },
    { name: "Border", varName: "--border", role: "Hairlines" },
    { name: "Surface", varName: "--surface", role: "Cards" },
    { name: "Background", varName: "--background", role: "Page" },
    { name: "Positive", varName: "--positive", role: "Hot Dog / success", dark: true },
    { name: "Negative", varName: "--negative", role: "Not Hot Dog / error", dark: true },
  ];

const RADII = [
  { name: "sm", var: "--radius-sm", px: "6px" },
  { name: "md", var: "--radius-md", px: "8px" },
  { name: "lg", var: "--radius-lg", px: "12px" },
  { name: "xl", var: "--radius-xl", px: "16px" },
];

const SHADOWS = [
  { name: "sm", var: "--shadow-sm" },
  { name: "md", var: "--shadow-md" },
  { name: "lg", var: "--shadow-lg" },
];

const TYPE = [
  { label: "Display", cls: "text-4xl font-bold tracking-tight", sample: "Visual Cuisine Intelligence" },
  { label: "H1", cls: "text-2xl font-bold tracking-tight", sample: "Classification Dashboard" },
  { label: "H2", cls: "text-sm font-semibold", sample: "Recent classifications" },
  { label: "Body", cls: "text-sm leading-relaxed text-muted", sample: "Every classification is scored, explained, and logged for audit." },
  { label: "Label", cls: "text-xs font-medium uppercase tracking-wider text-muted", sample: "Model confidence" },
  { label: "Mono", cls: "font-mono text-sm", sample: "eu.anthropic.claude-haiku-4-5" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-10">
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function BrandPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Brand & Design System
        </h1>
        <p className="mt-2 text-muted">
          A living style guide, rendered from the same tokens the product ships
          (<code className="font-mono text-sm">app/globals.css</code>). If it
          looks right here, it looks right everywhere.
        </p>
      </div>

      <Section title="Logo">
        <div className="flex flex-wrap items-center gap-8 rounded-lg border border-border bg-surface p-8 shadow-sm">
          <Logo />
          <div className="rounded-lg bg-brand p-6">
            <Logo />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">
          Glyph: a frankfurter inside a detection viewfinder. Maintain clear
          space of at least the glyph height.
        </p>
      </Section>

      <Section title="Color">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {COLORS.map((c) => (
            <div
              key={c.varName}
              className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm"
            >
              <div
                className="h-20 w-full"
                style={{ background: `var(${c.varName})` }}
              />
              <div className="p-3">
                <div className="text-sm font-semibold text-foreground">
                  {c.name}
                </div>
                <div className="text-xs text-muted">{c.role}</div>
                <code className="mt-1 block font-mono text-[11px] text-muted">
                  {c.varName}
                </code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="space-y-5 rounded-lg border border-border bg-surface p-6 shadow-sm">
          {TYPE.map((t) => (
            <div
              key={t.label}
              className="flex flex-col gap-1 border-b border-border pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <span className="w-20 shrink-0 text-xs font-medium uppercase tracking-wider text-muted">
                {t.label}
              </span>
              <span className={t.cls}>{t.sample}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          Inter for UI &amp; marketing; Geist Mono for IDs, metrics, and code.
        </p>
      </Section>

      <Section title="Radius">
        <div className="flex flex-wrap gap-6">
          {RADII.map((r) => (
            <div key={r.name} className="text-center">
              <div
                className="h-20 w-20 border border-border bg-brand-accent/10"
                style={{ borderRadius: `var(${r.var})` }}
              />
              <div className="mt-2 text-xs font-medium text-foreground">
                {r.name}
              </div>
              <div className="text-xs text-muted">{r.px}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Elevation">
        <div className="flex flex-wrap gap-8">
          {SHADOWS.map((s) => (
            <div key={s.name} className="text-center">
              <div
                className="h-20 w-28 rounded-lg bg-surface"
                style={{ boxShadow: `var(${s.var})` }}
              />
              <div className="mt-3 text-xs font-medium text-foreground">
                shadow-{s.name}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Components">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Total scans" value="1,284" accent="brand" />
          <StatTile
            label="Hot dog rate"
            value="61%"
            sub="784 hot dog · 500 not"
            accent="positive"
          />
          <StatTile label="Avg. confidence" value="94%" />
          <StatTile label="Avg. latency" value="1,312 ms" sub="Bedrock" />
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-6 shadow-sm">
          <VerdictBadge verdict="HOT_DOG" />
          <VerdictBadge verdict="NOT_HOT_DOG" />
          <button className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90">
            Primary button
          </button>
          <button className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-background">
            Secondary button
          </button>
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted">
            Chip
          </span>
        </div>
      </Section>
    </div>
  );
}
