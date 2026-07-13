"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StatTile } from "./StatTile";
import { VerdictBadge } from "./VerdictBadge";
import { relativeTime, absoluteTime } from "@/lib/format";
import type { Verdict } from "@/lib/types";

interface Record {
  id: string;
  verdict: Verdict;
  confidence: number;
  rationale: string;
  createdAt: string;
  latencyMs: number;
  thumbnailUrl?: string;
}

interface Stats {
  total: number;
  hotDogs: number;
  notHotDogs: number;
  hotDogRate: number;
  avgConfidence: number;
  avgLatencyMs: number;
}

export function Dashboard() {
  const [records, setRecords] = useState<Record[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/records?limit=100", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load records.");
      setRecords(data.records);
      setStats(data.stats);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/records?limit=100", {
          cache: "no-store",
        });
        const data = await res.json();
        if (!active) return;
        if (!res.ok) throw new Error(data?.error || "Failed to load records.");
        setRecords(data.records);
        setStats(data.stats);
        setError("");
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "Failed to load records.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Classification Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Audit log and operational metrics across all classifications.
          </p>
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-background disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-negative/30 bg-negative-bg px-4 py-3 text-sm text-negative">
          {error}
        </div>
      )}

      {/* KPI tiles */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading && !stats ? (
          Array.from({ length: 4 }).map((_, i) => <TileSkeleton key={i} />)
        ) : stats ? (
          <>
            <StatTile
              label="Total classifications"
              value={stats.total.toLocaleString()}
              accent="brand"
            />
            <StatTile
              label="Hot dog rate"
              value={`${Math.round(stats.hotDogRate * 100)}%`}
              sub={`${stats.hotDogs} hot dog · ${stats.notHotDogs} not`}
              accent="positive"
            />
            <StatTile
              label="Avg. confidence"
              value={`${stats.avgConfidence}%`}
            />
            <StatTile
              label="Avg. latency"
              value={`${stats.avgLatencyMs} ms`}
              sub="Bedrock inference"
            />
          </>
        ) : null}
      </div>

      {/* Verdict split bar */}
      {stats && stats.total > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="uppercase tracking-wider text-muted">
              Verdict distribution
            </span>
            <span className="text-muted">
              <span className="text-positive">{stats.hotDogs} Hot Dog</span>
              {" · "}
              <span className="text-negative">
                {stats.notHotDogs} Not Hot Dog
              </span>
            </span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-positive"
              style={{ width: `${stats.hotDogRate * 100}%` }}
            />
            <div
              className="h-full bg-negative"
              style={{ width: `${(1 - stats.hotDogRate) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Records table */}
      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">
            Recent classifications
          </h2>
          <span className="text-xs text-muted">
            {records.length} shown
          </span>
        </div>

        {loading && records.length === 0 ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : records.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Preview</th>
                  <th className="px-5 py-3 font-medium">Verdict</th>
                  <th className="px-5 py-3 font-medium">Confidence</th>
                  <th className="px-5 py-3 font-medium">Rationale</th>
                  <th className="px-5 py-3 font-medium">Latency</th>
                  <th className="px-5 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-background/60">
                    <td className="px-5 py-3">
                      {r.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.thumbnailUrl}
                          alt=""
                          className="h-11 w-11 rounded-md border border-border object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-md border border-border bg-background" />
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <VerdictBadge verdict={r.verdict} />
                    </td>
                    <td className="px-5 py-3 font-mono text-foreground">
                      {r.confidence}%
                    </td>
                    <td className="max-w-xs px-5 py-3 text-muted">
                      <span className="line-clamp-2">{r.rationale}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-muted">
                      {r.latencyMs} ms
                    </td>
                    <td
                      className="whitespace-nowrap px-5 py-3 text-muted"
                      title={absoluteTime(r.createdAt)}
                    >
                      {relativeTime(r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TileSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="h-3 w-24 rounded bg-border" />
      <div className="mt-3 h-8 w-16 rounded bg-border" />
      <span className="animate-shimmer" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="relative flex items-center gap-4 overflow-hidden px-5 py-3">
      <div className="h-11 w-11 rounded-md bg-border" />
      <div className="h-4 w-full max-w-xs rounded bg-border" />
      <span className="animate-shimmer" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-background text-muted">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M3 9h18"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-foreground">
        No classifications yet
      </p>
      <p className="max-w-xs text-sm text-muted">
        Once you classify an image, it will appear here with its verdict,
        confidence, and thumbnail.
      </p>
      <Link
        href="/app"
        className="mt-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
      >
        Classify an image
      </Link>
    </div>
  );
}
