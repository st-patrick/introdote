# Open Your Eyes — Status Quo

## What exists

- `PLAYBOOK.md` — The drag-and-drop agent playbook. Scans any project, detects services from code, maps credentials needed, walks user through collection.
- `PLAN.md` — Project vision and principles

## What it does

Drop `PLAYBOOK.md` into any project. Tell an AI agent "scan this project and set me up." The agent:

1. Detects project type (web, mobile, desktop, API, etc.)
2. Scans dependencies to find service integrations (Supabase, Stripe, Firebase, etc.)
3. Checks what credentials already exist
4. Asks about things code can't tell (DNS provider, registrar)
5. Researches unknown providers' APIs on the fly
6. Guides user through collecting each missing credential
7. Validates everything, stores in `~/.open-your-eyes/secrets.env`

## What's next

- README.md for the GitHub repo (what this is, how to use it, examples)
- Real-world testing: drop into actual projects and iterate
- Community contributions: provider-specific validation snippets
