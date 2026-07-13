"use client";

import { useCallback, useRef, useState } from "react";
import { VerdictCard } from "./VerdictCard";
import type { ClassifyResponse } from "@/lib/types";

type Status = "idle" | "preview" | "analyzing" | "done" | "error";

const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_MB = 10;

export function Classifier() {
  const [status, setStatus] = useState<Status>("idle");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<ClassifyResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStatus("idle");
    setPreviewUrl("");
    setFileName("");
    setResult(null);
    setError("");
    fileRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  }, [previewUrl]);

  const classify = useCallback(async (file: File) => {
    setStatus("analyzing");
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch("/api/classify", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Classification failed.");
      setResult(data as ClassifyResponse);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }, []);

  const accept = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!ACCEPTED.includes(file.type)) {
        setError("Unsupported file type. Use JPEG, PNG, GIF, or WebP.");
        setStatus("error");
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`File too large. Maximum size is ${MAX_MB} MB.`);
        setStatus("error");
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      fileRef.current = file;
      setPreviewUrl(url);
      setFileName(file.name);
      setResult(null);
      setStatus("preview");
      // Auto-classify immediately for a snappy single-action flow.
      void classify(file);
    },
    [classify, previewUrl],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      accept(e.dataTransfer.files?.[0]);
    },
    [accept],
  );

  const busy = status === "analyzing";

  return (
    <div className="flex flex-col gap-6">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload an image to classify"
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy)
            inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? "border-brand-accent bg-brand-accent/5"
            : "border-border bg-surface hover:border-brand-accent/60"
        } ${busy ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          onChange={(e) => accept(e.target.files?.[0])}
        />

        {previewUrl && status !== "idle" ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-40 rounded-lg border border-border object-contain shadow-sm"
            />
            <p className="max-w-xs truncate text-sm font-medium text-foreground">
              {fileName}
            </p>
            {!busy && (
              <p className="text-xs text-muted">
                Click or drop to classify a different image
              </p>
            )}
          </>
        ) : (
          <>
            <UploadGlyph />
            <div>
              <p className="text-base font-semibold text-foreground">
                Drop an image here, or click to browse
              </p>
              <p className="mt-1 text-sm text-muted">
                JPEG, PNG, GIF, or WebP · up to {MAX_MB} MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Analyzing state */}
      {busy && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          <Spinner />
          <span>
            Analyzing image with the SeeFood vision engine… running inference on
            Amazon Bedrock.
          </span>
        </div>
      )}

      {/* Error state */}
      {status === "error" && (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-negative/30 bg-negative-bg px-4 py-3">
          <p className="text-sm text-negative">{error}</p>
          <button
            onClick={reset}
            className="shrink-0 text-sm font-medium text-negative underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Result */}
      {status === "done" && result && previewUrl && (
        <div className="flex flex-col gap-4">
          <VerdictCard result={result} previewUrl={previewUrl} />
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-background"
            >
              Classify another image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadGlyph() {
  return (
    <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-accent/10 text-brand-accent">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 16V4m0 0L7 9m5-5 5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 shrink-0 animate-spin text-brand-accent"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
