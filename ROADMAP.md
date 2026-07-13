# SeeFood™ — Roadmap

The MVP satisfies the four criteria we were graded on. This roadmap deepens each
one from "works and looks the part" toward "a product you could actually sell and
operate." It is organized by those same four pillars, then sequenced into phases
so every phase ships something usable.

**Legend:** ✅ shipped (MVP) · 🔜 next · 🔭 later

---

## Pillar 1 — Fully functional (reliable core)

The classifier works today; reliability is about making it *stay* correct and
degrade gracefully under real-world inputs.

- ✅ Definitive verdict + confidence + rationale via Bedrock (Claude Haiku 4.5)
- ✅ Input validation (type, size), defensive JSON parsing, best-effort persistence
- 🔜 **Eval harness + accuracy metric** — a labeled test set (hot dogs, near-misses:
  corn dogs, sausages, subs, hamburgers) run on every prompt/model change, with a
  tracked accuracy number. Turns "seems to work" into a regression-guarded metric.
- 🔜 **Retry & timeout policy** for Bedrock calls (transient throttling, cold starts)
  with a clear user-facing failure state.
- 🔭 **Model routing / fallback** — cheap model first, escalate to a stronger model
  when confidence is low; multi-region or multi-provider fallback for resilience.
- 🔭 **Human-in-the-loop feedback** — thumbs up/down on a verdict, stored against the
  record, feeding the eval set and a "needs review" queue for low-confidence results.

## Pillar 2 — Deployed and accessible

Live on Vercel today; the next steps make deploys safe, repeatable, and observable.

- ✅ Live on Vercel, AWS-native backend, CloudFormation IaC for table + bucket
- 🔜 **CI pipeline** — typecheck, lint, and build on every PR; block merge on failure.
- 🔜 **Preview deployments** — Vercel preview per PR for review before production.
- 🔜 **Observability** — structured logs with end-to-end request IDs (the UI already
  surfaces a classification ID), latency/error metrics, and a real health signal
  behind the "All systems operational" badge (currently static).
- 🔭 **Uptime & alerting** — synthetic checks on `/api/health` and `/api/classify`,
  paging on error-rate or latency SLO breaches.
- 🔭 **CDN/caching + regional strategy** — pin Bedrock region explicitly per the model
  availability constraint; document the failover region.

## Pillar 3 — Corporate / enterprise aesthetic

The shell looks the part; depth here is about the details enterprises notice.

- ✅ Branded shell (nav, footer, compliance badges), verdict card, dashboard, API page
- 🔜 **Dark mode** — token system already supports it; add the theme toggle.
- 🔜 **Accessibility pass** — keyboard nav (dropzone is already focusable), ARIA on
  the results/table, contrast audit, reduced-motion support.
- 🔜 **Empty/loading/error polish everywhere** — consistent skeletons and toasts across
  dashboard and batch flows.
- 🔭 **Reporting view** — a printable/exportable "compliance report" per time range,
  reinforcing the audit story.
- 🔭 **Onboarding & settings** — org profile, branding, retention controls surfaced in UI.

## Pillar 4 — Production-ready mindset

The biggest gap between demo and product. These are the items flagged as "known
limitations" in the README, plus the operational must-haves.

- 🔜 **Authentication & multi-tenancy** — SSO (or API keys at minimum) so the classifier
  and audit log are not world-open. **Everything below depends on this.**
- 🔜 **Rate limiting on `/api/classify`** — per-key token bucket (the API page already
  advertises quotas; make them real).
- 🔜 **Dashboard at scale: GSI-by-date** — replace the full-table `Scan` with a
  `createdDate` GSI to query recent records and paginate. Cheap now, painful later.
- 🔜 **Secrets & least privilege** — move from a shared IAM user to a scoped role
  (Bedrock invoke + this table + this bucket only); rotate keys.
- 🔭 **Data governance** — per-tenant retention config (privacy stance is stated; make
  it enforceable), deletion API, region-of-residence controls.
- 🔭 **Cost & drift monitoring** — track spend per tenant and verdict-distribution drift
  over time.

---

## Suggested phasing

Each phase is shippable and leaves the product in a better, demoable state.

### Phase 1 — Make it safe to run for real
Auth/API keys · rate limiting · GSI-by-date · CI + preview deploys · scoped IAM role.
*Outcome: the app can be exposed to real users without abuse or a scan-cost surprise.*

### Phase 2 — Make it provably good
Eval harness + accuracy metric · retry/timeout policy · structured logging + request IDs
· human feedback (👍/👎). *Outcome: a tracked quality number and a feedback loop.*

### Phase 3 — Make it a product
Batch upload · audit export (CSV/JSON) · webhooks · confidence thresholds + review queue
· dark mode + a11y pass. *Outcome: features a business would pay for.*

### Phase 4 — Make it enterprise-grade
Uptime/alerting on SLOs · model routing + fallback · data governance (retention/deletion)
· cost & drift monitoring · compliance reporting. *Outcome: operable at scale under an SLA.*

---

## Explicitly out of scope (for now)

- Training a custom model — the Bedrock vision model is more than sufficient; a custom
  model only earns its keep once the eval harness proves a specific accuracy gap.
- Mobile apps — the web app is responsive; native is unwarranted until there's demand.
