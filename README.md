# SeeFood™ — Visual Cuisine Intelligence Platform

An enterprise-grade take on Jian Yang's legendary "Hot Dog / Not Hot Dog" app.
Upload an image; SeeFood returns a single definitive verdict — **Hot Dog** or
**Not Hot Dog** — with a model-confidence score, a one-sentence analyst
rationale, and a full audit trail.

- **Live site:** https://seefood-hotdog-classifier.vercel.app
- **Source:** https://github.com/jameslevine/seefood-hotdog-classifier

| Route | What it is |
| ------------- | ----------------------------------------------------- |
| `/` | Marketing landing page |
| `/app` | The classifier (upload → verdict) |
| `/dashboard` | Audit log + operational metrics |
| `/api-access` | API documentation |
| `/keys` | Self-serve API-key management (requires sign-in) |
| `/login`, `/register` | Account auth (Amazon Cognito) |
| `/brand` | Living design-system style guide |
| `/contact` | Lead-capture / book-a-demo |
| `/api/health` | Liveness/readiness probe |

Companion docs: [`BRAND.md`](BRAND.md) (brand guidelines) · [`ROADMAP.md`](ROADMAP.md) (phased roadmap).

---

## Features

**Core**
- Image upload (drag-and-drop or picker; JPEG/PNG/GIF/WebP, ≤10 MB) → definitive
  **Hot Dog / Not Hot Dog** verdict via **Amazon Bedrock** (Claude Haiku 4.5 vision).
- Structured output: verdict + 0–100 confidence + one-sentence rationale, with
  defensive JSON parsing and a keyword fallback.

**Product**
- **Audit dashboard** — KPI tiles (throughput, hot-dog rate, avg confidence, avg
  latency), verdict-distribution bar, paginated records table with thumbnails.
- **Marketing site** — hero + feature sections with AI-generated on-brand imagery,
  social proof, and CTAs.
- **Lead capture** — book-a-demo / contact-sales form with validation + honeypot.
- **Living style guide** at `/brand`, rendered from the real design tokens.

**Platform / production-readiness**
- **Authentication** — Amazon Cognito user pool with a custom, branded
  login/register/confirm UI (not the hosted UI).
- **API keys** — self-serve key management (`/keys`); keys authorize programmatic
  access to `POST /api/classify`.
- **Persistence** — S3 thumbnails + DynamoDB audit log, queried via a
  **`byCreatedAt` GSI** (no full-table scans) with cursor pagination.
- **Infrastructure as Code** — everything (DynamoDB tables + GSIs, S3 bucket,
  Cognito pool/client) in one CloudFormation stack.
- **Testing** — Vitest unit + integration (AWS SDK mocked, >90% coverage gate) and
  Cypress E2E.
- **CI** — GitHub Actions runs lint, typecheck, tests, and build on every PR.
- **SEO** — per-route metadata, OpenGraph/Twitter cards, JSON-LD, sitemap, robots.

## Architecture

```text
Browser ──upload──▶  POST /api/classify  (Next.js Node serverless function)
                       0. (optional) verify Bearer API key → tenant context
                       1. validate + downscale (sharp)
                       2. Bedrock InvokeModel — Claude vision → {verdict, confidence, rationale}
                       3. put thumbnail  → S3
                       4. put record     → DynamoDB (with byCreatedAt GSI key)
                       5. return verdict JSON
Browser ◀── verdict ──┘

/dashboard ──▶ GET /api/records ──▶ DynamoDB Query (byCreatedAt GSI) → stats + page
                                     S3 presigned GET URLs for thumbnails

/login,/register ──▶ /api/auth/* ──▶ Cognito (SignUp / ConfirmSignUp / InitiateAuth)
                                      ID token stored in an httpOnly cookie,
                                      verified against the Cognito JWKS

/keys ──▶ /api/keys ──▶ DynamoDB apikeys table (byTenant GSI); raw key shown once
```

AWS credentials live **only** on the server. The browser never sees them.

### Stack
- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Amazon Bedrock** — Claude Haiku 4.5 vision (region `eu-west-2`)
- **Amazon Cognito** — user authentication
- **Amazon DynamoDB** — classifications (byCreatedAt GSI), API keys (byTenant GSI), leads
- **Amazon S3** — thumbnail retention (private, presigned reads)
- **sharp** — server-side image downscaling
- **CloudFormation** — infrastructure as code ([`infra/template.yaml`](infra/template.yaml))
- **Vitest** + **Cypress** — testing · **GitHub Actions** — CI
- Deployed on **Vercel**

## Using the API

Programmatic access uses a Bearer API key minted at `/keys`:

```bash
curl -X POST https://seefood-hotdog-classifier.vercel.app/api/classify \
  -H "Authorization: Bearer $SEEFOOD_API_KEY" \
  -F "image=@lunch.jpg"
```

```json
{
  "id": "a940a853-…",
  "verdict": "HOT_DOG",
  "confidence": 95,
  "rationale": "Image shows a cooked sausage with mustard in a sliced bun.",
  "latencyMs": 1997,
  "modelId": "eu.anthropic.claude-haiku-4-5-20251001-v1:0",
  "createdAt": "2026-07-13T12:58:33.211Z"
}
```

> The endpoint currently also accepts unauthenticated requests (evaluation mode).
> A supplied key must be valid; an invalid/revoked key returns 401.

## Infrastructure as Code

All AWS resources are defined in [`infra/template.yaml`](infra/template.yaml)
(DynamoDB tables with GSIs + SSE + PITR; private S3 bucket with public-access-block,
SSE, and a 90-day lifecycle; Cognito user pool + app client). Deploy / update:

```bash
aws cloudformation deploy \
  --template-file infra/template.yaml \
  --stack-name seefood \
  --region eu-west-2 \
  --capabilities CAPABILITY_NAMED_IAM

aws cloudformation describe-stacks --stack-name seefood \
  --region eu-west-2 --query "Stacks[0].Outputs"
```

Bedrock is a managed service and needs no resources — the app invokes it directly.

## Local development

```bash
cp .env.example .env.local        # fill in AWS credentials + stack outputs
npm install
npm run dev                       # http://localhost:3000
```

### Testing

```bash
npm test              # Vitest: unit + integration (AWS SDK mocked)
npm run test:watch    # watch mode
npm run e2e:open      # Cypress interactive (needs the dev server running)
npm run e2e           # Cypress headless
```

CI (`.github/workflows/ci.yml`) runs `lint`, `typecheck`, `test`, and `build` on
every PR; unit + integration tests are enforced with a 90% coverage threshold.
Cypress E2E is configured for local runs.

### Environment variables

| Variable | Purpose |
| ---------------------------- | ------------------------------------------- |
| `AWS_REGION` | AWS region (`eu-west-2`) |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM credentials (local) |
| `BEDROCK_MODEL_ID` | Inference-profile model id (e.g. `eu.anthropic.claude-haiku-4-5-20251001-v1:0`) |
| `DDB_TABLE` | Classifications table |
| `S3_BUCKET` | Thumbnail bucket |
| `LEADS_TABLE` | Leads table |
| `APIKEYS_TABLE` | API-keys table |
| `COGNITO_USER_POOL_ID` / `COGNITO_CLIENT_ID` / `COGNITO_REGION` | Cognito config |
| `MAGNIFIC_API_KEY` | (offline only) marketing-image generation |

> **Vercel note:** `AWS_*` / `AWS_REGION` are reserved on Vercel. Use the
> `APP_AWS_*` equivalents — [`lib/aws.ts`](lib/aws.ts) reads those first.
>
> **Bedrock note:** newer models require an *inference-profile* id (region-prefixed,
> e.g. `eu.anthropic.…`), not the bare `anthropic.…` id.

## Product decisions

- **A verdict, not just a boolean** — confidence + rationale make it auditable.
- **Audit-first** — every classification is logged; the dashboard turns the log
  into operational insight.
- **Privacy stance** — only a downscaled thumbnail is retained, never the original.
- **Deterministic model settings** — `temperature: 0` + a strict JSON contract.
- **AWS-native throughout** — one credential set powers vision, auth, storage,
  and data; consistent and easy to reason about.

## Roadmap (next)

See [`ROADMAP.md`](ROADMAP.md) for the full plan. Near-term:
- **Rate limiting** on `/api/classify` (per-tenant, DynamoDB fixed-window).
- **Scoped IAM** — replace the shared IAM user with a least-privilege role.
- **Eval harness** — labeled fixtures + tracked accuracy on prompt/model changes.
- **Human feedback** (👍/👎) → review queue; **batch upload**; **audit CSV export**;
  **webhooks**; **dark mode + a11y pass**.

## Known limitations

- **Auth scope** — email/password via Cognito is live; social/enterprise SSO,
  password-reset UX, and per-tenant dashboard scoping are future work.
- **No rate limiting yet** — the classify endpoint validates type/size but has no
  per-client quota (next on the roadmap).
- **Dashboard stats** aggregate all rows via the GSI; at very large scale this
  moves to a maintained counter item.
- **Single region** — Bedrock model availability is region-specific; the model id
  is env-configurable so the region is swappable.
