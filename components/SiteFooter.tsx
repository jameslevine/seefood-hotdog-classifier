import { Logo } from "./Logo";

const BADGES = ["SOC 2 Type II", "GDPR Ready", "ISO 27001", "99.9% SLA"];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Enterprise visual cuisine intelligence. Deterministic hot dog
              classification at scale, backed by Amazon Bedrock.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
            <FooterCol
              title="Product"
              items={["Classify", "Dashboard", "API", "Pricing"]}
            />
            <FooterCol
              title="Company"
              items={["About", "Careers", "Press", "Contact"]}
            />
            <FooterCol
              title="Legal"
              items={["Privacy", "Terms", "DPA", "Security"]}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <span
                key={b}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted"
              >
                {b}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} SeeFood Technologies, Inc. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
        {title}
      </span>
      {items.map((i) => (
        <span key={i} className="text-muted">
          {i}
        </span>
      ))}
    </div>
  );
}
