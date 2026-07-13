"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app";

  const [status, setStatus] = useState<"idle" | "busy">("idle");
  const [error, setError] = useState("");
  // Registration has a second step: email confirmation code.
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [pending, setPending] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Request failed.");
    return data;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    try {
      if (mode === "login") {
        await post("/api/auth/login", { email, password });
        router.push(next);
        router.refresh();
      } else {
        const data = await post("/api/auth/register", { email, password });
        if (data.userConfirmed) {
          // Auto-confirmed: log straight in.
          await post("/api/auth/login", { email, password });
          router.push(next);
          router.refresh();
        } else {
          setPending({ email, password });
          setNeedsConfirm(true);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setStatus("idle");
    }
  }

  async function onConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    setError("");
    const code = String(new FormData(e.currentTarget).get("code"));
    try {
      await post("/api/auth/confirm", { email: pending.email, code });
      await post("/api/auth/login", pending);
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed.");
    } finally {
      setStatus("idle");
    }
  }

  if (needsConfirm) {
    return (
      <form onSubmit={onConfirm} className="flex flex-col gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Confirm your email
          </h1>
          <p className="mt-1 text-sm text-muted">
            We sent a code to {pending.email}. Enter it below.
          </p>
        </div>
        <Input name="code" label="Confirmation code" autoComplete="one-time-code" />
        {error && <p className="text-sm text-negative">{error}</p>}
        <Submit busy={status === "busy"}>Confirm &amp; continue</Submit>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          {mode === "login" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "login"
            ? "Welcome back to SeeFood."
            : "Start classifying in minutes."}
        </p>
      </div>

      <Input name="email" type="email" label="Work email" autoComplete="email" />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />

      {error && <p className="text-sm text-negative">{error}</p>}

      <Submit busy={status === "busy"}>
        {mode === "login" ? "Sign in" : "Create account"}
      </Submit>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link href="/register" className="font-medium text-brand-accent">
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-accent">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function Input({
  name,
  label,
  type = "text",
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-brand-accent"
      />
    </div>
  );
}

function Submit({
  busy,
  children,
}: {
  busy: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {busy ? "Please wait…" : children}
    </button>
  );
}
