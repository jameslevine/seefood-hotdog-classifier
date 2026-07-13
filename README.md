# SeeFood™ — Visual Cuisine Intelligence Platform

An enterprise-grade take on Jian Yang's legendary "Hot Dog / Not Hot Dog" app.
Upload an image; SeeFood returns a single definitive verdict — **Hot Dog** or
**Not Hot Dog** — with a model-confidence score, a one-sentence analyst
rationale, and a full audit trail.

- **Live app:** _(added after deploy)_
- **Classify:** `/` · **Dashboard:** `/dashboard` · **Health:** `/api/health`

---

## What it does

1. **Upload** an image (drag-and-drop or file picker; JPEG/PNG/GIF/WebP, ≤10 MB).
2. **Classify** — the image is downscaled and sent to a vision model on
   **Amazon Bedrock** (Claude Haiku 4.5). The model returns a structured verdict,
   a 0–100 confidence score, and a rationale.
3. **Persist** — a downscaled thumbnail is stored in **S3** and a metadata record
   in **DynamoDB** for the audit log.
4. **Review** — the **dashboard** shows operational KPIs (throughput, hot-dog
   rate, average confidence, average latency), a verdict-distribution bar, and a
   searchable table of recent classifications with thumbnails served via
   presigned S3 URLs.

## Architecture

```
Browser ──upload──▶  /api/classify  (Next.js Node serverless function)
                       1. validate + downscale (sharp)
                       2. Bedrock InvokeModel — Claude vision → {verdict, confidence, rationale}
                       3. put thumbnail  → S3
                       4. put record     → DynamoDB
                       5. return verdict JSON
Browser ◀── verdict ──┘

/dashboard ──▶ /api/records ──▶ DynamoDB scan → stats + recent records
                                 S3 presigned GET URLs for thumbnails
```

AWS credentials live **only** on the server (Next.js API routes / Vercel
functions). The browser never sees them.

### Stack
- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Amazon Bedrock** — Claude Haiku 4.5 vision (region `eu-west-2`)
- **Amazon DynamoDB** — classification audit log
- **Amazon S3** — thumbnail retention (private, presigned reads)
- **sharp** — server-side image downscaling
- **CloudFormation** — infrastructure as code (`infra/template.yaml`)
- Deployed on **Vercel**

## Infrastructure as Code

The DynamoDB table and S3 bucket are defined in
[`infra/template.yaml`](infra/template.yaml) (PAY_PER_REQUEST table with SSE and
point-in-time recovery; private bucket with public-access-block, SSE, and a
90-day lifecycle rule). Deploy the stack:

```bash
aws cloudformation deploy \
  --template-file infra/template.yaml \
  --stack-name seefood \
  --region eu-west-2

# Read back the resource names for your env vars
aws cloudformation describe-stacks --stack-name seefood \
  --region eu-west-2 --query "Stacks[0].Outputs"
```

Bedrock is a managed service and needs no resources — the app invokes it
directly with IAM credentials.

## Local development

```bash
cp .env.example .env.local        # fill in AWS credentials
npm install
npm run dev                       # http://localhost:3000
```

### Environment variables

| Variable                | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `AWS_REGION`            | AWS region (default `eu-west-2`)                   |
| `AWS_ACCESS_KEY_ID`     | IAM credentials for Bedrock / DynamoDB / S3        |
| `AWS_SECRET_ACCESS_KEY` | IAM secret                                         |
| `BEDROCK_MODEL_ID`      | Inference-profile model id (e.g. `eu.anthropic.claude-haiku-4-5-20251001-v1:0`) |
| `DDB_TABLE`             | DynamoDB table name (CloudFormation output)        |
| `S3_BUCKET`             | S3 bucket name (CloudFormation output)             |

> **Note on Bedrock model ids:** newer models require an *inference-profile* id
> (region-prefixed, e.g. `eu.anthropic.…`), not the bare `anthropic.…` id. The
> bare id fails with "on-demand throughput isn't supported."

The required IAM permissions are: `bedrock:InvokeModel`, `dynamodb:PutItem`,
`dynamodb:Scan`, `s3:PutObject`, and `s3:GetObject`.

## Product decisions

- **A verdict, not just a boolean.** Every classification carries a confidence
  score and a plain-language rationale — the difference between a toy and a
  product a business could actually audit.
- **Audit-first.** Enterprises need a paper trail. Every classification is
  logged; the dashboard turns that log into operational insight.
- **Privacy stance.** We retain only a downscaled thumbnail, never the original
  upload — a defensible position for a real product, and cheaper to store.
- **Deterministic model settings.** `temperature: 0` and a strict JSON contract
  make verdicts reproducible and machine-parseable.

## Known limitations & next steps

- **DynamoDB `Scan`** powers the dashboard. Fine at demo scale; the production
  path is a GSI keyed on a date bucket (e.g. `createdDate`) to query recent
  records and paginate without a full-table scan.
- **No authentication.** A real deployment would gate the app and the audit log
  behind SSO and per-tenant isolation.
- **No rate limiting.** The classify endpoint validates type/size but would need
  a per-client quota in production.
- **Single region.** Bedrock model availability is region-specific; the model id
  is env-configurable so the region is swappable.
