# SeeFood™ — Brand Guidelines

The brand system for SeeFood, the Visual Cuisine Intelligence Platform. The
source of truth for these tokens is [`app/globals.css`](app/globals.css); this
document explains their roles and usage. A live, rendered version is at
[`/brand`](https://seefood-hotdog-classifier.vercel.app/brand).

> **Principle:** a serious enterprise product for an inherently silly task. The
> restraint *is* the joke. Never wink at the user — the credibility is the punchline.

---

## Logo

The mark is a stylized frankfurter inside a **detection viewfinder** — computer
vision applied to a hot dog. Defined in [`components/Logo.tsx`](components/Logo.tsx).

- **Lockup:** glyph (navy rounded square) + "SeeFood™" wordmark + "Cuisine
  Intelligence" descriptor.
- **Clear space:** keep at least the height of the glyph clear on all sides.
- **Don'ts:** don't recolor the glyph outside brand navy/white, don't stretch,
  don't add effects, don't place the wordmark on low-contrast backgrounds.

## Color

Slate/navy neutrals + a single indigo accent + green/red semantics. **These are
the only colors in the system — do not introduce new hex values.**

| Token             | Hex       | Role                                            |
| ----------------- | --------- | ----------------------------------------------- |
| `--brand`         | `#1e3a8a` | Primary navy — logo, primary buttons, headings accent |
| `--brand-accent`  | `#4f46e5` | Indigo — links, focus, secondary emphasis       |
| `--foreground`    | `#0f172a` | Primary text (slate-900)                        |
| `--muted`         | `#64748b` | Secondary text, labels (slate-500)              |
| `--border`        | `#e2e8f0` | Hairlines, dividers, card borders (slate-200)   |
| `--surface`       | `#ffffff` | Cards, panels, elevated surfaces                |
| `--background`    | `#f6f7f9` | Page background                                 |
| `--positive`      | `#15803d` | "Hot Dog" verdict, success                      |
| `--positive-bg`   | `#f0fdf4` | Positive tint background                        |
| `--negative`      | `#b91c1c` | "Not Hot Dog" verdict, error, destructive       |
| `--negative-bg`   | `#fef2f2` | Negative tint background                        |

Dark-mode values are defined alongside these and ship in Phase 3.

## Typography

- **Sans — Inter** (`--font-sans`): all UI and marketing copy.
- **Mono — Geist Mono** (`--font-mono`): IDs, metrics, code, API examples.

Type ramp (as used across the app):

| Step        | Classes                                   | Usage                         |
| ----------- | ----------------------------------------- | ----------------------------- |
| Display     | `text-4xl sm:text-5xl font-bold tracking-tight` | Marketing hero            |
| H1          | `text-2xl font-bold tracking-tight`       | Page titles                   |
| H2          | `text-sm font-semibold`                   | Section/card headings         |
| Body        | `text-sm leading-relaxed`                 | Paragraph copy                |
| Label       | `text-xs font-medium uppercase tracking-wider text-muted` | Field labels, eyebrows |
| Mono value  | `font-mono`                               | Metrics, IDs                  |

## Spacing, radius, elevation

- **Spacing:** Tailwind's 4px base scale. Page gutters `px-6`; section rhythm
  `py-10`/`py-14`; card padding `p-5`/`p-6`.
- **Radius:** `--radius-sm` 6px (chips) · `--radius-md` 8px (buttons/inputs) ·
  `--radius-lg` 12px (cards) · `--radius-xl` 16px (hero surfaces).
- **Elevation:** `--shadow-sm` (resting cards) · `--shadow-md` (raised/hover) ·
  `--shadow-lg` (overlays). Soft, low-opacity slate shadows only.

## Layout

- Max content width `max-w-6xl` (marketing/dashboard), `max-w-2xl` (focused flows
  like the classifier). Card-based, generous whitespace, hairline borders over
  heavy shadows.

## Voice & tone

- **Serious, precise, enterprise.** "Deterministic verdicts." "Audit-ready."
  "Classification confidence." Treat hot-dog detection as mission-critical infra.
- Active voice, short sentences, no exclamation marks, no emoji in product copy.
- The humor comes entirely from the deadpan gap between the gravitas and the task.

## Imagery

- AI-generated via the Magnific pipeline ([`scripts/generate-marketing-images.mjs`](scripts/generate-marketing-images.mjs)),
  seeded with brand hexes for on-palette results. Abstract food-tech / vision
  motifs; navy/indigo dominant; clean, premium, never cartoonish.
- Always provide descriptive `alt` text. Imagery is progressive enhancement —
  pages must render gracefully without it.
