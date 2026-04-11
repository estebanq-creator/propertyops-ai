# System Documentation Index

**Generated:** April 8, 2026
**Environment:** /Users/david — Multi-agent AI operations environment
**Systems:** OpenClaw, Hermes, Paperclip, Codex

---

## Documents

| Document | Purpose |
|----------|---------|
| [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) | Start here. What the environment is, how it works, what's solid, what's fragile, what to know before making changes. |
| [SYSTEM_OVERVIEW.md](SYSTEM_OVERVIEW.md) | High-level explanation of all four systems and how they fit together. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Deep architecture: layers, components, data flow, control flow, routing, integration design. |
| [CONFIG_REFERENCE.md](CONFIG_REFERENCE.md) | Index of all config files, what each controls, key settings and implications. |
| [DIRECTORY_MAP.md](DIRECTORY_MAP.md) | Every important directory and file — what it contains, what is operationally critical. |
| [AUTHORITY_DECISIONS.md](AUTHORITY_DECISIONS.md) | Explicit source-of-truth decisions for Hermes, control panel, Paperclip credentials, and docs. |
| [MODEL_AND_ROUTING.md](MODEL_AND_ROUTING.md) | Models in use, provider setup, per-agent routing table, fallback logic. |
| [MEMORY_AND_KNOWLEDGE.md](MEMORY_AND_KNOWLEDGE.md) | Memory tiers, promotion governance, vector search, knowledge sources. |
| [JOBS_AND_AUTOMATION.md](JOBS_AND_AUTOMATION.md) | Cron jobs, heartbeats, hooks, delivery queue, approval flow, automation patterns. |
| [SECURITY_AND_BOUNDARIES.md](SECURITY_AND_BOUNDARIES.md) | Trust hierarchy, credential inventory, shell access, external exposure, known concerns. |
| [RISKS_AND_GAPS.md](RISKS_AND_GAPS.md) | Classified risk register with severity, recommendations, and priority matrix. |
| [FILES_TO_READ_FIRST.md](FILES_TO_READ_FIRST.md) | Curated reading order for a new AI or engineer — tiered by importance and task. |

---

## Quick Reference

**Primary config:** `~/.openclaw/openclaw.json`
**Cron jobs:** `~/.openclaw/cron/jobs.json`
**Hermes config:** `~/.hermes/config.yaml`
**Paperclip client:** `~/.paperclip/context.json`
**Paperclip API:** `http://127.0.0.1:3100/api` (local)
**OpenClaw gateway:** `ws://127.0.0.1:18789`
**Cal workspace:** `~/.openclaw/workspace-main/`
**Hermes workspace:** `~/.openclaw/workspace-hermes/`
**Canonical memory:** `~/.openclaw/vault-main/memory/*.qmd`

---

## Top 3 Risks (See RISKS_AND_GAPS.md for full list)

1. **Bot tokens embedded plaintext in openclaw.json** — move to env vars
2. **Broad shell allowlist (`openclaw *`, `gog *`)** — restrict to specific commands
3. **No fallback in Hermes standalone app** — configure at least one fallback provider
