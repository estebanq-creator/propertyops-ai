# DIRECTORY_MAP.md

**Purpose:** Important directories and files, what each contains, what is operationally important.
**Scope:** All systems — OpenClaw, Hermes, Paperclip, Codex, Claude Code.
**Key Files Referenced:** Discovery scan results, workspace hygiene telemetry, approval queue state through April 10, 2026.

---

## Top-Level Layout

```
/Users/david/
├── .openclaw/          ← PRIMARY: OpenClaw runtime, agents, workspaces, memory (2.3 GB)
├── .hermes/            ← Standalone Hermes app state (838 MB) — not the authoritative PropertyOps workspace
├── .paperclip/         ← Paperclip client state (781 MB)
├── .codex/             ← Codex app state (207 MB)
├── .claude/            ← Claude Code state (~500 MB)
├── .openclaw-optimizer/ ← Optimization tooling
├── openclaw/           ← Secondary openclaw workspace files (models/, agents/Wren/)
├── Documents/
│   ├── mission-control/ ← Legacy/reference control panel lineage; not the active PropertyOps authority
│   ├── ObsidianVault/   ← Personal knowledge base
│   └── Projects/        ← Project directories
└── system-docs/        ← Stale top-level docs location; not the maintained source
```

**Active docs source:** `~/.openclaw/workspace-main/projects/business-planning/Configuration/Systems/`
**Authority record:** `AUTHORITY_DECISIONS.md`

---

## `~/.openclaw/` — The Core System

**Total size:** 2.3 GB | **Contains:** Everything OpenClaw manages.

```
~/.openclaw/
├── openclaw.json              ← MASTER CONFIG — agents, models, channels, gateway, everything
├── config.json                ← Shell exec allowlist
├── node.json                  ← Node identity and gateway host/port
├── exec-approvals.json        ← Log of shell execution approvals (30 KB)
├── update-check.json          ← Version check state
│
├── agents/                    ← Agent identity directories
│   ├── Cal/                   ← Cal agent (no IDENTITY.md here; workspace-main has it)
│   ├── Leo/                   ← Leo coding subagent
│   ├── hermes/                ← Hermes agent metadata
│   ├── vicky/                 ← Vicky agent metadata
│   ├── codex/                 ← Codex agent
│   ├── codegen/               ← Codegen agent
│   ├── laura/                 ← Laura agent
│   ├── tony/                  ← Tony agent
│   ├── main/                  ← Main agent
│   ├── acp-defaultagent/      ← ACP default agent
│   └── [prodeng, qa, revenue, ops, intel, outbound-sales]/
│
├── workspace-main/            ← Cal's primary workspace ⭐
│   ├── SOUL.md                ← Cal personality
│   ├── IDENTITY.md            ← Cal role definition
│   ├── AGENTS.md              ← Cal operating model (200-line detailed ruleset)
│   ├── HEARTBEAT.md           ← Cal heartbeat behavior
│   ├── MEMORY.md              ← Placeholder/pointer (see vault-main)
│   ├── TOOLS.md               ← Tool usage rules
│   ├── USER.md                ← User context for Cal
│   ├── AGENTS.deduped.md      ← Deduplicated agent roster
│   ├── AGENTS.replacement.md  ← Agent replacement policy
│   ├── memory/
│   │   └── 2026-04-08.md      ← Today's working notes
│   └── projects/              ← Project-specific guidance
│
├── workspace-hermes/          ← Hermes CEO workspace ⭐
│   ├── SOUL.md                ← CEO soul/mission
│   ├── IDENTITY.md            ← CEO role definition
│   ├── AGENTS.md              ← Hermes operating model (session startup, trust model)
│   ├── HEARTBEAT.md           ← Heartbeat = Paperclip issue review
│   ├── MEMORY.md              ← Single line: "Agent-to-agent messaging is disabled"
│   ├── paperclip-api-key.json ← Current Paperclip credential source of truth (SENSITIVE)
│   ├── agents/
│   │   ├── ceo/               ← BEHAVIOR.md, DECISION_FRAMEWORK.md, GUARDRAILS.md, COMMUNICATION.md
│   │   ├── cto/               ← CTO role
│   │   ├── laura/             ← Forensic document analysis role
│   │   ├── tony/              ← Operations role
│   │   ├── codegen/           ← Code generation role
│   │   ├── prodeng/           ← Product engineering role
│   │   ├── qa/                ← QA role
│   │   ├── revenue/           ← Revenue role
│   │   ├── ops/               ← Operations role
│   │   ├── intel/             ← Intelligence role
│   │   ├── outbound-sales/    ← Sales role
│   │   ├── atlas/             ← Unknown role
│   │   ├── bookkeeping/       ← Bookkeeping role
│   │   ├── market-research/   ← Market research
│   │   └── onboarding/        ← Customer onboarding
│   ├── control-panel/         ← Authoritative PropertyOps AI dashboard (Next.js app) ⭐
│   │   ├── README.md          ← Tech stack, setup instructions
│   │   ├── AGENTS.md          ← Next.js agent rules (breaking changes note)
│   │   ├── PHASE1-IMPLEMENTATION.md
│   │   ├── PAPERCLIP-AUDIT-2026-04-07.md
│   │   ├── PRO-28-*.md        ← Recent project docs
│   │   ├── RBAC-COMPLETION-REPORT.md
│   │   ├── src/               ← Application source
│   │   └── node_modules/      ← Dependencies
│   └── memory/                ← Daily CEO notes (YYYY-MM-DD.md)
│
├── workspace-vicky/           ← Vicky personal support workspace
│   ├── SOUL.md, IDENTITY.md, AGENTS.md, MEMORY.md
│   └── memory/
│
├── workspace-documents/       ← Document processing workspace
│   ├── SOUL.md, IDENTITY.md, AGENTS.md, MEMORY.md
│   └── audit logs
│
├── vault-main/                ← Master knowledge vault ⭐ (Cal's canonical memory)
│   ├── SOUL.md                ← Vault soul
│   ├── IDENTITY.md            ← Vault identity (Cal)
│   ├── AGENTS.md              ← Vault agent roster (Cal operating model, 216 lines)
│   ├── MEMORY.md              ← Memory digest/router (tier 3, points to .qmd files)
│   ├── memory/
│   │   ├── global/
│   │   │   └── operating-patterns.qmd  ← CANONICAL operating rules (authority: high)
│   │   ├── user/
│   │   │   └── preferences.qmd         ← User preferences (canonical)
│   │   ├── projects/
│   │   │   └── openclaw-dashboard.qmd  ← Dashboard project memory
│   │   ├── episodic/          ← Important event memory
│   │   ├── nightly/
│   │   │   └── latest.qmd     ← Latest nightly digest
│   │   ├── daily-briefs/      ← Daily brief docs
│   │   ├── Learnings/         ← Learning notes
│   │   └── promotion-queue/   ← Memory pending promotion
│   ├── System/                ← System-level knowledge
│   │   ├── ApprovalQueue/     ← Structural approval requests and status
│   │   ├── OpsTelemetry/      ← Workspace hygiene manifests, history, execution receipts
│   │   └── Bin/Ops/           ← Workspace maintenance and restructure tooling
│   ├── Projects/
│   │   ├── openclaw-dashboard/ ← Dashboard project
│   │   └── business-incubator/ ← Business incubator (business-incubator.qmd, scorecard.md, etc.)
│   ├── Areas/                 ← Life areas
│   ├── Resources/             ← Reference materials
│   ├── Archives/              ← Archived content
│   ├── automation/            ← Automation scripts
│   ├── Skills/                ← Shared skill definitions
│   ├── Capture/               ← Inbox capture (PARA framework)
│   ├── .obsidian/             ← Obsidian vault config
│   ├── .clawhub/              ← OpenClaw vault integration
│   └── paperclip-api-key.json ← Historical credential location reference; not the current Paperclip authority
│
├── cron/
│   ├── jobs.json              ← All scheduled jobs (55 jobs, 1,934 lines, 79,988 bytes) ⭐
│   └── runs/                  ← Per-job run logs, including workspace maintenance jobs
│
├── credentials/               ← Credential storage (19 dirs)
│   └── gateway-token.txt      ← OpenClaw gateway auth token (SENSITIVE)
│
├── memory/                    ← Shared memory (19 dirs)
│
├── sessions/                  ← Session logs (160+ dirs)
│
├── logs/                      ← Execution logs (16 dirs)
│
├── delivery-queue/            ← Outbound message queue (37 dirs)
│
├── skills/                    ← OpenClaw-level skills (29 dirs)
│   └── withings-family/       ← Withings health data integration skill
│
├── subagents/                 ← Subagent orchestration
│
├── tasks/                     ← Task management
│
├── telegram/                  ← Telegram integration state (11 dirs)
│
├── backups/                   ← System backups (4 dirs)
│
├── plugins-src/
│   └── opik-openclaw/         ← opik-openclaw plugin source + sqlite-vec binary
│
├── scripts/
│   └── clear-stale-telegram-overrides.py  ← Allowlisted maintenance script
│
└── tools/
    └── notebooklm_export/scripts/  ← Export tool scripts (allowlisted)
```

### Workspace Maintenance Paths

These paths became operational between April 8 and April 10, 2026:

- `~/.openclaw/vault-main/System/Bin/Ops/openclaw_workspace_maintenance.py`
- `~/.openclaw/vault-main/System/Bin/Ops/openclaw_restructure.py`
- `~/.openclaw/vault-main/System/OpsTelemetry/workspace-hygiene-latest.json`
- `~/.openclaw/vault-main/System/OpsTelemetry/workspace-hygiene-history.jsonl`
- `~/.openclaw/vault-main/System/OpsTelemetry/restructure-executions/`
- `~/.openclaw/vault-main/System/ApprovalQueue/requests/`

**Observed state as of April 10, 2026**
- The legacy `vault-main/archive` root has already been moved into `vault-main/Archives/2026/legacy-root-review/archive-0b75ca`
- The duplicate `.openclaw/Areas` root still exists and is queued for review
- `vault-main/Projects/summary.md` is now a queued stalled-project archive candidate

---

## `~/.hermes/` — Standalone Hermes App

```
~/.hermes/
├── config.yaml          ← Hermes app config (model, terminal, memory, approvals) ⭐
├── auth.json            ← Auth credentials (10 KB, unread)
├── .env                 ← Environment variables (15 KB, unread) — likely contains API keys
├── SOUL.md              ← Agent soul definition
├── .update_check        ← Version check
├── interrupt_debug.log  ← Debug log
├── state.db             ← SQLite state database (5.4 MB) + WAL
├── models_dev_cache.json ← Model provider cache (1.7 MB)
├── processes.json       ← Process management
├── sessions/            ← Session state (160 dirs)
├── memories/            ← Memory storage (6 dirs)
├── pastes/              ← Clipboard cache (10 dirs)
├── checkpoints/         ← Session checkpoints (6 dirs)
├── profiles/            ← User profiles (3 dirs)
├── skills/              ← Skills library (29 dirs)
├── hermes-agent/        ← Agent implementation (75 dirs)
└── cron/                ← Minimal cron output
```

---

## `~/.paperclip/` — Paperclip Client State

```
~/.paperclip/
├── context.json         ← Profile selection and API key source ⭐
└── instances/
    ├── default/         ← Default instance state
    └── openclaw-local/  ← OpenClaw-local instance state
```

---

## `~/.codex/` — Codex App State

```
~/.codex/
├── config.toml              ← App configuration (380 B)
├── auth.json                ← Authentication (4.3 KB, unread)
├── version.json             ← Version info
├── .codex-global-state.json ← Electron persistent state (6.8 KB) ⭐
│                              (workspace: ~/.openclaw, service tier: fast)
├── logs_1.sqlite            ← Execution logs (66 MB) + WAL
├── state_5.sqlite           ← App state (970 KB) + WAL
├── models_cache.json        ← Model cache (235 KB)
├── session_index.jsonl      ← Session index
├── history.jsonl            ← Command history (30 KB)
├── sessions/                ← Session data (3 dirs)
├── shell_snapshots/         ← Shell state snapshots (10 dirs)
├── archived_sessions/       ← Archived sessions (4 dirs)
├── skills/                  ← Skills (5 dirs)
├── automations/             ← Automation definitions (4 dirs)
├── vendor_imports/          ← Vendor integrations (4 dirs)
├── rules/                   ← Rule definitions (3 dirs)
├── worktrees/               ← Git worktrees (4 dirs)
└── backup-2026-04-08/       ← Today's backup (8 dirs)
```

---

## `~/Documents/mission-control/` — PropertyOps AI Control App

```
~/Documents/mission-control/
├── README.md
├── CHANGELOG.md
├── ORCHESTRATION.md
├── HEARTBEAT.md
├── HANDOVER.md
├── PRODUCTION_SETUP.md
├── Dockerfile
├── docker-compose.yml
├── ecosystem.config.cjs      ← PM2 process config
├── mission-control.db        ← SQLite database (production data)
├── mission-control.db-shm    ← WAL shared memory
├── data/                     ← Application data
├── docs/                     ← Documentation
└── db-backups/               ← Database backups
```
This appears to be a separate, possibly older or parallel implementation of the control panel, running via Docker/PM2, with its own SQLite database. Distinct from the Next.js control panel in `workspace-hermes/control-panel/`.

---

## Sensitive Files (Location Summary)

| File | Location | Contents |
|------|----------|----------|
| `paperclip-api-key.json` | `workspace-hermes/` | Current Paperclip Bearer token authority |
| `gateway-token.txt` | `~/.openclaw/credentials/` | OpenClaw gateway auth token |
| `openclaw.json` | `~/.openclaw/` | Telegram bot tokens (3), Discord bot token (inline) |
| `.env` | `~/.hermes/` | API keys (unread, 15 KB) |
| `auth.json` | `~/.hermes/`, `~/.codex/` | Auth credentials |
| `.env.local` | `/Users/david/` | Vercel OIDC token |
| `~/.strava_credentials.json` | `/Users/david/` | Strava OAuth tokens |

---

## Open Questions / Ambiguities

- `workspace-hermes/paperclip-api-key.json` is the current Paperclip credential authority. Earlier review notes referenced a `vault-main` duplicate, but the live filesystem check for this pass did not confirm an active duplicate copy.
- `~/Documents/mission-control/` appears to be a separate control panel implementation (Docker/PM2/SQLite) from the Next.js app in `workspace-hermes/control-panel/`. Their relationship (parallel, predecessor, redundant) is unclear.
- The `~/.openclaw/vault-main/.clawhub/` directory's purpose is not documented.
- `Leo` agent has an identity directory in `~/.openclaw/agents/Leo/` but its model (described as `openai-codex/gpt-5.4` in discovery) is not confirmed in `openclaw.json` — may be a legacy or unused config.
