# Open Your Eyes — Agent Playbook

> **What is this?** Drop this file into any project. An AI agent will scan the codebase, figure out what services it depends on, determine what credentials are missing, and walk you through collecting only what's needed. Works for web apps, mobile apps, APIs, monorepos — whatever it finds.

---

## 0. Philosophy

1. **Read the project first, ask questions second.** The codebase already tells you 80% of what's needed. Don't ask the user "do you use Stripe?" when there's a `@stripe/stripe-js` in package.json.

2. **Provider-agnostic.** Don't prescribe providers. Discover what the project already uses. If it imports `firebase`, don't suggest Supabase. If the deploy config says Netlify, don't push Vercel.

3. **Only collect what's missing.** If `~/.open-your-eyes/secrets.env` already has a valid `STRIPE_SECRET_KEY`, don't ask for it again. Validate what exists, collect what doesn't.

4. **Adapt to project type.** A static site needs hosting + DNS. A SaaS app needs that plus database, auth, payments, email. A mobile app needs app store credentials. A CLI tool might need nothing. Let the project tell you.

---

## 1. Project Scan

When this playbook is present in a project, the agent should **automatically scan the codebase** before asking any questions. Here's how.

### Step 1: Detect Project Type

Scan for these markers to classify the project:

```
PROJECT TYPE DETECTION:

Web App (SPA/SSR):
  → package.json with react, vue, svelte, angular, next, nuxt, sveltekit, astro
  → vite.config.*, next.config.*, nuxt.config.*

Static Site / Marketing:
  → index.html at root, no framework deps
  → hugo.toml, _config.yml (Jekyll), mkdocs.yml

Mobile App (iOS):
  → *.xcodeproj, *.xcworkspace, Podfile, Package.swift
  → ios/ directory with Info.plist

Mobile App (Android):
  → build.gradle, settings.gradle, AndroidManifest.xml
  → android/ directory

Cross-Platform Mobile:
  → capacitor.config.*, ionic.config.json
  → app.json with "expo" key (React Native/Expo)
  → pubspec.yaml (Flutter)
  → .csproj with Xamarin/MAUI references

Desktop App:
  → electron-builder.yml, electron.vite.config.*
  → tauri.conf.json
  → Package.swift with .macOS platform

API / Backend:
  → main.go, cmd/ directory (Go)
  → manage.py, wsgi.py (Django/Python)
  → Gemfile with rails (Ruby)
  → server.ts, server.js at root with express/fastify/hono
  → Cargo.toml (Rust)

Monorepo:
  → pnpm-workspace.yaml, lerna.json, nx.json, turbo.json
  → apps/ or packages/ directories
  → (scan each sub-project recursively)

Containerized:
  → Dockerfile, docker-compose.yml, compose.yaml

Serverless:
  → serverless.yml, sam-template.yaml, netlify/functions/, vercel.json with functions
  → supabase/functions/ (Supabase Edge Functions)
  → wrangler.toml (Cloudflare Workers)
```

### Step 2: Detect Services & Dependencies

Scan dependency files and source code for service integrations:

```
DEPENDENCY → SERVICE MAPPING:

Package managers (scan these files):
  → package.json, requirements.txt, Pipfile, Gemfile, go.mod,
    Cargo.toml, pubspec.yaml, Podfile, build.gradle, *.csproj

Source code patterns (grep for these):
  → import statements, require() calls, SDK initializations,
    environment variable references (process.env.*, os.environ, etc.)

---

HOSTING / DEPLOY:
  vercel.json, .vercel/                          → Vercel
  netlify.toml, _redirects                       → Netlify
  wrangler.toml                                  → Cloudflare Workers/Pages
  fly.toml                                       → Fly.io
  app.yaml (with "runtime:")                     → Google App Engine
  Procfile                                       → Heroku
  render.yaml                                    → Render
  railway.json, railway.toml                     → Railway
  .platform.app.yaml                             → Platform.sh
  Dockerfile (alone, no other deploy config)     → needs container registry + host
  .htaccess, .php files                          → traditional webhost (Apache)
  nginx.conf                                     → traditional webhost (nginx)

DNS / DOMAINS:
  (Rarely in code — ask the user)

DATABASE:
  @supabase/supabase-js, supabase-py             → Supabase
  @prisma/client + DATABASE_URL                  → check connection string for provider
  pg, postgres, psycopg2                         → PostgreSQL (where?)
  mysql2, mysqlclient                            → MySQL (where?)
  mongoose, mongodb                              → MongoDB (Atlas? self-hosted?)
  @planetscale/database                          → PlanetScale
  @neondatabase/serverless                       → Neon
  @libsql/client, @turso                         → Turso
  firebase-admin, firebase/firestore             → Firebase/Firestore
  drizzle-orm, typeorm, sequelize, knex          → check their config for connection target
  better-sqlite3, sqlite3                        → SQLite (local, no credentials needed)

AUTH:
  @supabase/auth-helpers, @supabase/ssr          → Supabase Auth
  next-auth, @auth/core                          → NextAuth (check providers config)
  firebase/auth                                  → Firebase Auth
  @clerk/*, @clerk                               → Clerk
  auth0, @auth0/*                                → Auth0
  passport, passport-*                           → Passport.js (check strategies)
  @kinde-oss/*                                   → Kinde
  lucia, @lucia-auth/*                           → Lucia (self-hosted, check adapter)

PAYMENTS:
  @stripe/stripe-js, stripe                      → Stripe
  @paypal/checkout-server-sdk                    → PayPal
  @mollie/api-client                             → Mollie
  @lemonsqueezy/lemonsqueezy.js                  → LemonSqueezy
  paddle-sdk, @paddle/*                          → Paddle
  razorpay                                       → Razorpay

EMAIL:
  resend                                         → Resend
  @sendgrid/mail                                 → SendGrid
  postmark, postmark.js                          → Postmark
  nodemailer                                     → SMTP (check config for provider)
  @aws-sdk/client-ses                            → AWS SES
  mailgun.js, mailgun-js                         → Mailgun

STORAGE / FILE UPLOADS:
  @supabase/storage-js                           → Supabase Storage
  @aws-sdk/client-s3, aws-sdk (S3)              → AWS S3 (or compatible: R2, MinIO, etc.)
  @google-cloud/storage                          → Google Cloud Storage
  @azure/storage-blob                            → Azure Blob Storage
  firebase/storage                               → Firebase Storage
  cloudinary                                     → Cloudinary
  uploadthing, @uploadthing/*                    → UploadThing

ANALYTICS:
  posthog-js, posthog-node                       → PostHog
  plausible-tracker                              → Plausible
  @vercel/analytics                              → Vercel Analytics
  mixpanel, mixpanel-browser                     → Mixpanel
  @segment/analytics-next                        → Segment
  firebase/analytics                             → Google Analytics (via Firebase)

ERROR MONITORING:
  @sentry/*, sentry-sdk                          → Sentry
  @highlight-run/*                               → Highlight
  logrocket                                      → LogRocket
  @datadog/browser-rum                           → Datadog
  bugsnag, @bugsnag/*                            → Bugsnag

PUSH NOTIFICATIONS:
  firebase/messaging                             → Firebase Cloud Messaging
  @onesignal/*                                   → OneSignal
  web-push                                       → Web Push (needs VAPID keys)
  expo-notifications                             → Expo Push

CMS / CONTENT:
  @sanity/client                                 → Sanity
  contentful                                     → Contentful
  @strapi/*                                      → Strapi
  @keystonejs/*                                  → Keystone

SEARCH:
  algoliasearch                                  → Algolia
  meilisearch                                    → Meilisearch
  typesense                                      → Typesense

AI / ML:
  openai                                         → OpenAI
  @anthropic-ai/sdk                              → Anthropic
  @google/generative-ai                          → Google AI
  replicate                                      → Replicate
  @huggingface/*                                 → Hugging Face

CI/CD:
  .github/workflows/                             → GitHub Actions
  .gitlab-ci.yml                                 → GitLab CI
  .circleci/                                     → CircleCI
  bitbucket-pipelines.yml                        → Bitbucket Pipelines

MOBILE-SPECIFIC:
  *.xcodeproj + exportOptions.plist              → Apple Developer (signing, provisioning)
  google-services.json                           → Firebase (Android)
  GoogleService-Info.plist                       → Firebase (iOS)
  fastlane/                                      → Fastlane (needs store credentials)
  eas.json                                       → Expo Application Services
  android/app/build.gradle with signingConfigs   → Android Keystore
```

### Step 3: Detect Existing Configuration

Check for credentials that already exist:

```
CHECK THESE LOCATIONS (in order):

1. ~/.open-your-eyes/secrets.env          ← our credential store
2. .env, .env.local, .env.development     ← project-level env files
3. Environment variables in shell          ← already exported
4. Config files with credential fields     ← e.g., supabase/config.toml
5. CI/CD secrets                           ← .github/workflows (reference names only)
6. vercel.json / netlify.toml env sections ← deploy-time env vars

DO NOT read or log actual values from .env files — just note which keys exist.
For ~/.open-your-eyes/secrets.env, validate that stored keys still work.
```

### Step 4: Build the Requirements Matrix

Combine everything into a clear picture:

```
EXAMPLE OUTPUT:

Project Type: Next.js web app (App Router) with Supabase + Stripe
Deploy Target: Vercel (vercel.json found)

┌─────────────┬──────────────┬─────────────────┬──────────────┐
│ Role        │ Provider     │ Detected Via    │ Credentials  │
├─────────────┼──────────────┼─────────────────┼──────────────┤
│ Hosting     │ Vercel       │ vercel.json     │ ✗ MISSING    │
│ DNS         │ ???          │ (not in code)   │ ✗ ASK USER   │
│ Database    │ Supabase     │ package.json    │ ✓ in .env    │
│ Auth        │ Supabase     │ @supabase/ssr   │ ✓ in .env    │
│ Payments    │ Stripe       │ stripe in deps  │ ✗ MISSING    │
│ Email       │ Resend       │ resend in deps  │ ✗ MISSING    │
│ Analytics   │ PostHog      │ posthog-js      │ ✓ in .env    │
│ Errors      │ —            │ not detected    │ — SKIP       │
└─────────────┴──────────────┴─────────────────┴──────────────┘

ACTION NEEDED:
1. Collect: Vercel API token
2. Ask: Where is your DNS managed? Collect DNS credentials
3. Collect: Stripe secret key + publishable key
4. Collect: Resend API key
```

---

## 2. The Conversation

After the scan, the agent presents findings and fills gaps.

### Open With Scan Results

> I've scanned your project. Here's what I found:
>
> [show the requirements matrix from Step 4]
>
> I need to collect credentials for [N] services. For the ones I detected automatically, I'll just need API keys. I also have a couple questions about things I couldn't determine from the code.

### For Each Missing Credential

Follow the protocol from the previous version:

1. **If provider is known** (detected from code): research that provider's API, guide user to exact credentials page, validate, store
2. **If provider is unknown** (role needed but not clear which provider): ask the user what they use, then research
3. **If role isn't needed**: skip entirely — don't collect credentials for services the project doesn't use

### Questions Only for What Code Can't Tell You

These are things that typically aren't in source code:

- **DNS provider** — "Your domain is referenced in the code but I can't tell where DNS is managed. Where do you manage DNS for `yourdomain.com`?"
- **Domain registrar** — only matters if the user wants the agent to buy new domains
- **Deploy credentials** — even if the deploy target is detected, the API key isn't in code
- **Existing accounts** — "I see your project uses Supabase but there are no credentials configured. Do you already have a Supabase project for this, or should we create one?"

---

## 3. Platform-Specific Requirements

The scan may detect platform-specific needs beyond standard web services.

### Mobile Apps (iOS)

If `*.xcodeproj` or `ios/` is detected:

```
REQUIRED:
├── Apple Developer Account ($99/year)
│   ├── Team ID
│   ├── App Store Connect API Key (.p8 file + Key ID + Issuer ID)
│   │   → App Store Connect → Users and Access → Integrations → App Store Connect API
│   ├── Signing Certificate (distribution)
│   └── Provisioning Profile
│
├── If using Fastlane:
│   ├── MATCH_PASSWORD (for cert encryption)
│   ├── MATCH_GIT_URL (for cert storage repo)
│   └── APP_STORE_CONNECT_API_KEY_PATH
│
├── If using Expo EAS:
│   ├── EXPO_TOKEN
│   └── Apple credentials (EAS can manage these interactively)
│
└── If push notifications:
    └── APNs key (.p8) — often same as App Store Connect API key
```

Agent guide:
> Your project has an iOS target. To deploy to the App Store, I'll need access to your Apple Developer account. Here's what we need:
>
> 1. **App Store Connect API Key** — this lets me submit builds and manage app metadata
>    - Go to [App Store Connect](https://appstoreconnect.apple.com/) → Users and Access → Integrations → App Store Connect API
>    - Click "Generate API Key"
>    - Role: "App Manager" (or "Admin" for full access)
>    - Download the `.p8` file — **it can only be downloaded once**
>    - Note the **Key ID** and **Issuer ID** shown on the page

### Mobile Apps (Android)

If `android/` or `build.gradle` is detected:

```
REQUIRED:
├── Google Play Console ($25 one-time)
│   ├── Service Account JSON key
│   │   → Google Cloud Console → IAM → Service Accounts
│   │   → Grant "Service Account User" role
│   │   → Google Play Console → Setup → API access → link the service account
│   └── Upload Keystore (.jks or .keystore)
│       ├── ANDROID_KEYSTORE_PATH
│       ├── ANDROID_KEYSTORE_PASSWORD
│       ├── ANDROID_KEY_ALIAS
│       └── ANDROID_KEY_PASSWORD
│
├── If using Fastlane:
│   └── SUPPLY_JSON_KEY (path to service account JSON)
│
└── If using Expo EAS:
    └── EXPO_TOKEN + Google Service Account JSON
```

### Desktop Apps (Electron)

If `electron-builder.yml` or `electron` dep detected:

```
REQUIRED:
├── Code Signing:
│   ├── macOS: Apple Developer ID certificate
│   │   ├── CSC_LINK (base64 .p12 certificate)
│   │   ├── CSC_KEY_PASSWORD
│   │   └── APPLE_ID + APPLE_APP_SPECIFIC_PASSWORD (for notarization)
│   ├── Windows: Code signing certificate (.pfx)
│   │   ├── WIN_CSC_LINK
│   │   └── WIN_CSC_KEY_PASSWORD
│   └── Linux: GPG key (optional)
│
├── Auto-Update:
│   └── GitHub token (for releases) or S3 bucket credentials
│
└── Distribution:
    ├── Mac App Store: Apple Developer account (same as iOS)
    ├── Microsoft Store: Microsoft Partner Center account
    └── Snap Store: snapcraft login token
```

### Desktop Apps (Tauri)

If `tauri.conf.json` detected:

```
REQUIRED:
├── Code Signing (same as Electron, platform-dependent)
├── TAURI_SIGNING_PRIVATE_KEY (for auto-updater)
├── TAURI_SIGNING_PRIVATE_KEY_PASSWORD
└── GitHub token (if using GitHub releases for distribution)
```

### Chrome Extensions / Browser Add-ons

If `manifest.json` with `"manifest_version"` detected:

```
REQUIRED:
├── Chrome Web Store:
│   ├── Chrome Web Store Developer account ($5 one-time)
│   ├── OAuth2 client credentials (client_id, client_secret, refresh_token)
│   │   → Chrome Web Store API uses OAuth, not simple API keys
│   └── Extension ID (after first upload)
│
├── Firefox Add-ons:
│   ├── addons.mozilla.org account (free)
│   ├── JWT API credentials (issuer + secret)
│   │   → addons.mozilla.org → Developer Hub → Manage API Keys
│   └── Extension ID / GUID
│
└── Edge Add-ons:
    └── Microsoft Partner Center (same as Windows desktop)
```

### CLI Tools / Libraries (Publishing)

If the project appears to be a publishable package:

```
REQUIRED:
├── npm: NPM_TOKEN
│   → npmjs.com → Access Tokens → Generate New Token (Automation)
├── PyPI: PYPI_API_TOKEN
│   → pypi.org → Account Settings → API tokens
├── crates.io: CARGO_REGISTRY_TOKEN
│   → crates.io → Account Settings → API Tokens
├── RubyGems: GEM_HOST_API_KEY
│   → rubygems.org → Profile → API Keys
└── Go: (no token needed, uses git)
```

### Containerized Apps

If `Dockerfile` detected without a deploy target:

```
REQUIRED:
├── Container Registry:
│   ├── Docker Hub: DOCKER_USERNAME + DOCKER_PASSWORD/TOKEN
│   ├── GitHub Container Registry: GITHUB_TOKEN (with packages scope)
│   ├── Google Artifact Registry: GCP service account JSON
│   ├── AWS ECR: AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
│   └── Self-hosted: REGISTRY_URL + credentials
│
└── Container Host (where to run it):
    ├── Fly.io: FLY_API_TOKEN
    ├── Railway: RAILWAY_TOKEN
    ├── Google Cloud Run: GCP service account JSON
    ├── AWS ECS/Fargate: AWS credentials
    ├── VPS: SSH credentials
    └── Kubernetes: kubeconfig
```

---

## 4. Provider Research Protocol

When the scan detects a service or the user names a provider, and the agent doesn't have hardcoded knowledge of it:

### Research Steps

1. **Search** for `"[provider name] API documentation"` and `"[provider name] developer API"`
2. **Read** their API docs — find:
   - Auth method (API key, OAuth, Basic auth, etc.)
   - Where to create credentials (exact URL)
   - What permissions/scopes to request
   - A simple read-only endpoint for validation
3. **Build a guide** — step-by-step instructions for this specific provider
4. **Write a validation call** — minimal API request to prove the credential works
5. **Determine the variable name** — follow the convention: `[PROVIDER]_[CREDENTIAL_TYPE]`

### When a Provider Has No API

Some providers (especially traditional webhosts) are dashboard-only. Options:

- **SSH/SFTP access** — many hosts offer this even without an API. Collect SSH key or password.
- **FTP** — last resort, but it works. Collect FTP host, user, password.
- **cPanel API** — many shared hosts run cPanel, which has a REST API. Search for `"[provider] cPanel API"`.
- **Suggest a polyfill** — e.g., point DNS to Cloudflare for API-managed DNS, even if the host's DNS panel is manual.
- **Accept the limitation** — not everything needs to be automated. If the user deploys once a month via dashboard, that's fine.

---

## 5. Gap Analysis & Polyfill

After scanning the project and collecting what's available, identify gaps.

### Common Patterns

**Project uses a service but has no credentials configured:**
> I see `@supabase/supabase-js` in your dependencies but no Supabase URL or keys configured. Do you have an existing Supabase project for this app, or should we set one up?

**Project has a deploy target but no deploy credentials:**
> Your `vercel.json` tells me this deploys to Vercel, but I don't have an API token. Let me walk you through creating one.

**Project needs something it doesn't explicitly use yet:**
> Your app has user signup but no email sending capability. Users won't be able to receive verification emails or password resets. Want to set up an email provider?

**Project references env vars that don't exist:**
Scan source code for `process.env.SOMETHING`, `os.environ["SOMETHING"]`, `env("SOMETHING")`, etc. Cross-reference with what actually exists in `.env` files and `~/.open-your-eyes/secrets.env`. Report any that are referenced but undefined.

### The Polyfill Principle

Only suggest adding a new service when:
1. The project already depends on it (detected in code) but credentials are missing, OR
2. A core user flow is broken without it (e.g., auth exists but no email = no verification), OR
3. The user explicitly asks for a new capability

Never suggest services "because it would be nice." If the project doesn't use analytics, don't suggest adding PostHog.

---

## 6. Credential Storage

### Location
```
~/.open-your-eyes/
├── secrets.env           # All credentials — never committed
├── config.yaml           # Non-secret config (provider choices, preferences)
└── validation-log.json   # Last successful validation per service
```

### Setup (run once, idempotent)
```bash
mkdir -p ~/.open-your-eyes
touch ~/.open-your-eyes/secrets.env
chmod 600 ~/.open-your-eyes/secrets.env
grep -qxF '.open-your-eyes/' ~/.gitignore_global 2>/dev/null || echo ".open-your-eyes/" >> ~/.gitignore_global
git config --global core.excludesFile ~/.gitignore_global
```

### Variable Naming Convention
```bash
# Pattern: [PROVIDER]_[CREDENTIAL_TYPE]
# Group by role, tag with provider

# ===== DEPLOY =====
DEPLOY_PROVIDER=vercel
VERCEL_TOKEN=xxx

# ===== DNS =====
DNS_PROVIDER=cloudflare
CLOUDFLARE_API_TOKEN=xxx
CLOUDFLARE_ZONE_ID=xxx

# ===== DOMAIN =====
DOMAIN=yourdomain.com
DOMAIN_REGISTRAR=porkbun
PORKBUN_API_KEY=xxx
PORKBUN_SECRET_KEY=xxx

# ===== DATABASE =====
DB_PROVIDER=supabase
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# ===== PAYMENTS =====
PAYMENTS_PROVIDER=stripe
STRIPE_PUBLISHABLE_KEY=xxx
STRIPE_SECRET_KEY=xxx

# ===== EMAIL =====
EMAIL_PROVIDER=resend
RESEND_API_KEY=xxx
# — or —
EMAIL_PROVIDER=smtp
SMTP_HOST=xxx
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASS=xxx

# ===== MOBILE (iOS) =====
APPLE_TEAM_ID=xxx
APPLE_API_KEY_ID=xxx
APPLE_API_ISSUER_ID=xxx
APPLE_API_KEY_PATH=~/.open-your-eyes/AuthKey_XXXXX.p8

# ===== MOBILE (Android) =====
GOOGLE_PLAY_JSON_KEY_PATH=~/.open-your-eyes/google-play-service-account.json
ANDROID_KEYSTORE_PATH=xxx
ANDROID_KEYSTORE_PASSWORD=xxx
ANDROID_KEY_ALIAS=xxx
ANDROID_KEY_PASSWORD=xxx
```

### Validation Log
```json
{
  "project_path": "/Users/you/code/your-project",
  "scanned_at": "2025-01-15T10:00:00Z",
  "project_type": "nextjs-web-app",
  "services": {
    "deploy": { "provider": "vercel", "status": "ok", "validated_at": "..." },
    "database": { "provider": "supabase", "status": "ok", "validated_at": "..." },
    "payments": { "provider": "stripe", "status": "ok", "mode": "test", "validated_at": "..." }
  }
}
```

---

## 7. Validation Gates

After collecting credentials, prove the pipeline works end-to-end.

### Gate Selection

Run only the gates relevant to this project's type:

| Project Type | Gate |
|-------------|------|
| Any web project | Can I deploy to your host and serve the site? |
| Web + custom domain | Can I point your domain at the deployment? |
| Web + database | Can I create a table, write a row, read it back? |
| Web + payments | Can I create a test product in your payment provider? |
| Web + email | Can I send a test email? |
| Mobile (iOS) | Can I validate signing and connect to App Store Connect? |
| Mobile (Android) | Can I validate the keystore and connect to Google Play Console? |
| Desktop | Can I code-sign a test binary? |
| Container | Can I push a test image to your registry? |

### Gate Protocol

For each applicable gate:
1. Tell the user what you're about to do
2. Ask permission
3. Create minimal test resources
4. Verify they work
5. Clean up test resources
6. Report result

---

## 8. Re-entry & Maintenance

### When to Re-scan
- **New dependency added** — user installs a new package that implies a service
- **Missing credential at runtime** — agent tries to use a key that doesn't exist
- **Expired credential** — API returns 401/403
- **New project** — playbook dropped into a different project

### When to Re-validate
- User says "check everything still works"
- It's been >30 days since last validation (check validation-log.json)
- After rotating any credential

### Project-to-Project Portability
Credentials in `~/.open-your-eyes/secrets.env` are global — they work across all projects. When the playbook is dropped into a new project, the agent:
1. Scans the new project
2. Checks which required credentials already exist in secrets.env
3. Validates the existing credentials still work
4. Only asks for new credentials specific to this project

---

## 9. How to Use This Playbook

**Drop it into any project** and tell an AI agent:

> "Scan this project and set me up for auto-deploy."

The agent will:
1. Scan your codebase to detect what services you use
2. Check what credentials you already have
3. Show you what's missing
4. Walk you through collecting each missing credential
5. Validate everything works
6. Store credentials securely on your machine

**That's it.** From then on, the agent can deploy your project, manage your database, process payments, send emails — whatever your project needs — without you touching a dashboard.
