# Open Your Eyes — Plan

## Vision

A single drag-and-drop file (`PLAYBOOK.md`) that works in any project. An AI agent reads it, scans the codebase to figure out what services the project depends on, checks what credentials are already configured, and walks the user through collecting only what's missing.

Works for web apps, mobile apps, APIs, CLIs, desktop apps, monorepos — whatever it finds in the codebase.

## How It Works

1. **Scan** — detect project type, dependencies, service integrations, existing config
2. **Map** — build a requirements matrix: what services are needed, what credentials exist, what's missing
3. **Discover** — ask the user about things code can't tell you (DNS provider, registrar, existing accounts)
4. **Research** — for any provider the agent doesn't know, look up their API docs on the fly
5. **Collect** — guide the user to the exact credentials page, step by step
6. **Validate** — make real API calls to prove each credential works
7. **Store** — write to `~/.open-your-eyes/secrets.env`, never in the project, never in git
8. **Gate** — run end-to-end validation to prove the full pipeline works

## Key Principles

- **Code-first discovery** — read the project before asking questions
- **Provider-agnostic** — adapt to what the user already uses, don't prescribe
- **Only collect what's missing** — don't re-ask for credentials that already exist and validate
- **Platform-aware** — mobile apps need App Store keys, desktop apps need code signing, etc.
- **Polyfill, don't replace** — only suggest new services to fill gaps, never to replace working setups

## What's Built

- `PLAYBOOK.md` — the complete agent playbook covering:
  - Project type detection (web, mobile, desktop, API, container, monorepo)
  - Dependency-to-service mapping (150+ packages → services)
  - Platform-specific requirements (iOS, Android, Electron, Tauri, Chrome extensions)
  - Provider research protocol (for unknown providers)
  - Gap analysis and polyfill strategy
  - Credential storage and validation
  - Re-entry and maintenance flows
