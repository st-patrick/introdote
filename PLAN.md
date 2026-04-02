# Open Your Eyes — Plan

## Vision

A global agent skill. Install it once, and every project on your machine gets a "finish" button. The agent scans the code, checks your global credentials, fills gaps with minimal interaction, and ships — deploy, domain, database, payments, app store, marketing, everything.

The human approves, logs in, and pays. The agent does everything else.

## Architecture

- `~/.open-your-eyes/` — global capability store (secrets, provider configs, the playbook itself)
- Nothing in project directories — the agent reads the playbook from home, applies it to the current project
- `capabilities.yaml` — manifest of what the agent can do, auto-updated as providers are configured
- Provider files — per-provider metadata, validation state, account info

## Principles

1. **Human does 3 things**: approve, log in, pay. Everything else is the agent's job.
2. **Never trust training data for APIs**: always fetch live docs before guiding through any provider.
3. **Provider-agnostic**: works with whatever the user already uses, even obscure regional hosts.
4. **Set up once**: credentials are global, shared across all projects. No repeated questionnaires.
5. **Code-first discovery**: scan the project to detect what's needed before asking questions.
6. **Think in user flows**: gaps are broken experiences, not missing services.
7. **Beyond deploy**: SEO, legal, performance, analytics, app stores, social — the full last mile.

## What's Built

- `PLAYBOOK.md` — the complete agent skill (prime directives, scan logic, credential protocol, deploy flow, launch checklist)
- `install.sh` — one-command global install (creates ~/.open-your-eyes/, hooks into Claude Code)
- `README.md` — GitHub-ready project description
