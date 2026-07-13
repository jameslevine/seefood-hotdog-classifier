"use client";

import { useState } from "react";

export function LeadForm({ source = "landing" }: { source?: string }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          message: data.get("message"),
          company_website: data.get("company_website"), // honeypot
          source,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Submission failed.");
      setStatus("done");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-positive/30 bg-positive-bg p-6 text-center">
        <p className="text-sm font-semibold text-positive">
          Thanks — we&apos;ll be in touch shortly.
        </p>
        <p className="mt-1 text-sm text-muted">
          A member of our team will reach out to schedule your demo.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Honeypot — visually hidden, off-screen, not tab-reachable */}
      <div aria-hidden className="absolute left-[-9999px]" tabIndex={-1}>
        <label>
          Company website
          <input
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" required autoComplete="name" />
        <Field
          label="Work email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <Field label="Company" name="company" autoComplete="organization" />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          What are you looking to classify?
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-brand-accent"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-negative">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Book a demo"}
      </button>
      <p className="text-xs text-muted">
        By submitting, you agree to be contacted about SeeFood. We never share
        your details.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-negative"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-brand-accent"
      />
    </div>
  );
}
