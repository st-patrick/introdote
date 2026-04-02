# Open Your Eyes

**Say "finish" to your AI agent. It ships your project.**

Open Your Eyes is a global agent skill that gives AI coding assistants (Claude Code, Cursor, etc.) the power to deploy, publish, and launch your projects end-to-end. Set it up once. It works for every project on your machine.

## What it does

You say **"finish"** (or **"ship it"** / **"open your eyes"**) in any project. The agent:

1. **Scans your code** — detects what the project is (web app, mobile app, API, etc.) and what services it uses
2. **Checks your global credentials** — sees what you've already set up (hosting, DNS, database, payments, etc.)
3. **Fills gaps** — if something's missing, walks you through getting it (you log in, paste the key, that's it)
4. **Ships it** — deploys, points your domain, runs migrations, syncs env vars
5. **Goes further** — offers SEO, app store optimization, analytics, monitoring, legal pages, social cards

**You approve, log in, and pay. The agent does everything else.**

## How it works

Credentials live globally in `~/.open-your-eyes/`, shared across all your projects. You never fill out the same questionnaire twice. The agent knows what you have and what each project needs.

```
~/.open-your-eyes/
├── PLAYBOOK.md          ← The brain (agent instructions)
├── secrets.env          ← Your API keys (chmod 600, never in git)
├── capabilities.yaml    ← What the agent can do
├── providers/           ← Per-provider metadata
└── keys/                ← Certificate files, keystores, etc.
```

Nothing goes in your project directories. No config files. No setup. Just your code.

## Install

```bash
git clone https://github.com/[you]/open-your-eyes.git /tmp/oye
bash /tmp/oye/install.sh
rm -rf /tmp/oye
```

This creates `~/.open-your-eyes/` and (if you use Claude Code) adds a skill trigger to `~/.claude/CLAUDE.md`.

## Usage

In any project directory, tell your AI agent:

> "finish"

First time? The agent asks what providers you use (hosting, DNS, payments, etc.), looks up their APIs, and walks you through getting credentials. Takes ~15 minutes.

After that? It just works. Every project.

## What makes this different

### Provider-agnostic
The agent works with whatever you already use — Vercel, Netlify, lima-city, Hetzner, Uberspace, your own VPS. It doesn't push specific providers. When you name a provider, the agent looks up their API documentation live and figures it out.

### Always up-to-date
The agent fetches live API docs every time, never relying on potentially stale training data. Dashboard URLs move, endpoints get deprecated, auth flows change — the agent checks before guiding you.

### Minimal interaction
The human does three things: **approve**, **log in**, **pay**. The agent handles research, configuration, deployment, troubleshooting, and everything else.

### Beyond deploy
After shipping, the agent can handle SEO, legal pages, performance audits, analytics setup, app store optimization, social media cards, and more — all from the same "finish" command.

## Supported project types

- Web apps (React, Next.js, Vue, Svelte, Astro, etc.)
- Static sites (HTML, Hugo, Jekyll, etc.)
- Mobile apps (iOS, Android, React Native, Flutter, Expo)
- Desktop apps (Electron, Tauri)
- APIs and backends (Node, Go, Python, Rust, Ruby)
- Browser extensions (Chrome, Firefox, Edge)
- CLI tools and libraries (npm, PyPI, crates.io)
- Containerized apps (Docker)
- Monorepos (scans each sub-project)

## License

MIT
