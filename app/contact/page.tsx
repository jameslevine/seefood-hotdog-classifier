import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Contact Sales — SeeFood™",
  description:
    "Book a demo of SeeFood, the enterprise visual cuisine intelligence platform. Talk to our team about volume, SLAs, and deployment.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Talk to our team
          </h1>
          <p className="mt-3 text-muted">
            See how SeeFood brings deterministic, audit-ready hot dog
            classification to your organization. Book a demo and we&apos;ll walk
            you through the platform.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              ["Enterprise volume", "100k+ classifications/day with a 99.9% SLA."],
              ["Deployment", "SaaS, VPC, or on-prem — your compliance, your call."],
              ["Audit & governance", "Full classification trail, exportable for compliance."],
            ].map(([title, body]) => (
              <li key={title} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-accent" />
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {title}
                  </div>
                  <div className="text-sm text-muted">{body}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <LeadForm source="contact" />
        </div>
      </div>
    </div>
  );
}
