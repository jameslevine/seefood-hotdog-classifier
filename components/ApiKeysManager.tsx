"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { relativeTime } from "@/lib/format";

interface KeyRow {
  keyHash: string;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
}

export function ApiKeysManager() {
  const router = useRouter();
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/keys", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const res = await fetch("/api/keys", { cache: "no-store" });
      if (!active) return;
      if (res.ok) setKeys((await res.json()).keys);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Failed to create key.");
      return;
    }
    setNewKey(data.raw);
    setLabel("");
    load();
  }

  async function revoke(keyHash: string) {
    await fetch("/api/keys/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyHash }),
    });
    load();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* One-time reveal of a newly created key */}
      {newKey && (
        <div className="rounded-lg border border-brand-accent/40 bg-brand-accent/5 p-4">
          <p className="text-sm font-semibold text-foreground">
            Your new API key — copy it now, it won&apos;t be shown again.
          </p>
          <code className="mt-2 block break-all rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-foreground">
            {newKey}
          </code>
          <button
            onClick={() => setNewKey(null)}
            className="mt-2 text-xs font-medium text-brand-accent underline"
          >
            Done
          </button>
        </div>
      )}

      {/* Create form */}
      <form
        onSubmit={createKey}
        className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="label" className="text-sm font-medium text-foreground">
            Create a new key
          </label>
          <input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Production integration"
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:border-brand-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Create key
        </button>
      </form>

      {error && <p className="text-sm text-negative">{error}</p>}

      {/* Key list */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">
            Your keys
          </span>
          <button
            onClick={logout}
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </div>
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-muted">Loading…</div>
        ) : keys.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted">
            No keys yet. Create one above to call the API.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {keys.map((k) => (
              <li
                key={k.keyHash}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {k.label}
                    {k.revoked && (
                      <span className="ml-2 rounded-full bg-negative-bg px-2 py-0.5 text-xs font-medium text-negative">
                        Revoked
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    Created {relativeTime(k.createdAt)} ·{" "}
                    {k.lastUsedAt
                      ? `last used ${relativeTime(k.lastUsedAt)}`
                      : "never used"}
                  </div>
                </div>
                {!k.revoked && (
                  <button
                    onClick={() => revoke(k.keyHash)}
                    className="text-sm font-medium text-negative transition-opacity hover:opacity-80"
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
