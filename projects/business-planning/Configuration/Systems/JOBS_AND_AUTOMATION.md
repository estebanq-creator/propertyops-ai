# JOBS_AND_AUTOMATION.md

**Purpose:** Cron jobs, hooks, queues, async flows, scheduled behaviors, event-driven flows.
**Scope:** OpenClaw cron system, delivery queue, hooks, Hermes heartbeats.
**Key Files Referenced:** `~/.openclaw/cron/jobs.json`, `~/.openclaw/openclaw.json` (hooks, cron sections), `~/.openclaw/workspace-hermes/AGENTS.md`, `~/.openclaw/vault-main/AGENTS.md`

---

## Cron System

**Config file:** `~/.openclaw/cron/jobs.json`
**Format:** JSON object with `version` and `jobs[]`
**Max concurrent runs:** 1 (from `openclaw.json cron.maxConcurrentRuns`)
**Session target:** All jobs run in `isolated` sessions (fresh context per run)
**Current size:** 56 jobs (observed April 11, 2026)

### Active Cron Jobs (confirmed enabled)

#### 1. Weekly Behavioral Governance Maintenance
- **ID:** `behavioral-governance-maintenance`
- **Agent:** Cal
- **Schedule:** `0 18 * * 0` (Sundays 18:00 ET)
- **Model:** `ollama/glm-5:cloud`
- **Task:** Runs `vault-main/skills/memory-governance/SKILL.md` in `weekly-governance-review` mode
- **Delivery:** Telegram announce to user 6986726607
- **Status:** Last ran successfully. Next run: upcoming Sunday.
- **Purpose:** Governs memory promotion, reviews behavioral preferences

#### 2. Monitor NYC 311 (Weekends)
- **ID:** `8bce94ee-b2e7-40ec-...`
- **Agent:** Vicky
- **Schedule:** `0 9 * * 0,6` (Weekends 09:00 ET)
- **Model:** `ollama/glm-5:cloud`
- **Task:** Fetch NYC 311 portal. Alert Grace (Telegram 8387885574) if "Alternate Side Parking Not in Effect" or "Schools not in session" found.
- **Delivery:** none (direct Telegram send inside agent logic)
- **Status:** Last run OK

#### 3. Monitor NYC 311 (Weekdays)
- **ID:** `2c418afc-b2e7-40ec-...`
- **Agent:** Vicky
- **Schedule:** `0 8 * * 1-5` (Weekdays 08:00 ET)
- **Status:** Enabled in the current config; earlier documentation had this stale

#### 4. Workspace Hygiene Scan
- **ID:** `workspace-hygiene-scan`
- **Agent:** Cal
- **Schedule:** `34 3 * * *` (Daily 03:34 ET)
- **Model:** `ollama/glm-5:cloud`
- **Task:** Runs `openclaw_workspace_maintenance.py scan` through `vault-main/System/Cron/cron_wrapper.py`
- **Artifacts:** Writes latest manifest to `vault-main/System/OpsTelemetry/workspace-hygiene-latest.json` and appends history to `workspace-hygiene-history.jsonl`
- **Observed runs:** Failed on April 9, 2026 due to provider DNS lookup failure; succeeded on April 10, 2026
- **Current signal:** Latest successful scan found one high-risk duplicate durable root (`.openclaw/Areas` vs `vault-main/Areas`) and one medium-risk stalled project candidate (`vault-main/Projects/summary.md`)

#### 5. Workspace Restructure Proposal Queue
- **ID:** `workspace-restructure-proposal-preview`
- **Agent:** Cal
- **Schedule:** `42 3 * * *` (Daily 03:42 ET)
- **Model:** `ollama/glm-5:cloud`
- **Task:** Runs `openclaw_restructure.py propose` to convert scan findings into approval requests
- **Artifacts:** Writes proposal requests under `vault-main/System/ApprovalQueue/requests/`
- **Observed runs:** April 9, 2026 found 2 existing proposals; April 10, 2026 created 1 new proposal and surfaced 1 existing proposal
- **Naming note:** The job name still says "preview," but it now creates real approval queue entries

### Other Jobs
The current `jobs.json` contains 56 jobs. Only a subset have been audited closely. Additional jobs include daily memory maintenance, operational monitoring, business intelligence runs, specialist pickup polls, and reporting tasks, but they should not be treated as fully reviewed until explicitly re-audited.

---

## Heartbeat System

OpenClaw supports scheduled heartbeats for always-on agents. These are distinct from cron — they run within a persistent agent session rather than isolated sessions.

| Agent | Heartbeat Interval | Model | Context |
|-------|-------------------|-------|---------|
| Cal | every 90 minutes | default agent heartbeat model | lightContext |
| Vicky | every 120 minutes | `ollama/glm-5:cloud` | lightContext |

**Cal Heartbeat behavior** (from AGENTS.md): coordination continuity and memory maintenance, not exact-timed automation.

**Hermes does not use a native `openclaw.json` heartbeat interval.** Instead, Hermes now uses a lightweight cron-backed executive heartbeat:
- **Job:** `Hermes Heartbeat - Fleet Oversight`
- **Schedule:** every 1 hour, 7 days/week
- **Model:** `ollama/glm-5:cloud`
- **Mode:** isolated session, `lightContext: true`
- **Scope:** assigned Paperclip issues, escalations, blocked work, delivery/report failures, owner-approval items
- **Explicitly excluded:** recurring report generation and deep competitive briefings

Hermes heartbeat = executive Paperclip triage. If no actionable issues exist, it should return `HEARTBEAT_OK`. See `workspace-hermes/HEARTBEAT.md`.

### Specialist Pickup Polls

As of April 11, 2026, the environment also uses thin specialist pickup polls instead of heavyweight conversational heartbeats for execution roles.

These jobs:
- run in `isolated` sessions
- use `lightContext`
- use `delivery.mode = none`
- check assigned Paperclip `todo` issues first
- only fall back to clearly role-scoped backlog checks
- begin only the next concrete step when work exists
- return `HEARTBEAT_OK` when nothing is actionable

Current pickup layer:

| Agent | Job Name | Interval | Intent |
|-------|----------|----------|--------|
| ProdEng | `ProdEng Issue Pickup` | every 1 hour | Engineering self-pickup from Paperclip |
| QA | `QA Issue Pickup` | every 1 hour | Validation and regression self-pickup |
| Ops | `Ops Issue Pickup` | every 1 hour | Operations queue self-pickup |
| Tony | `Tony Issue Pickup` | every 1 hour | Operational execution pickup under approval gates |
| Laura | `Laura Issue Pickup` | every 2 hours | Forensic review pickup; explicitly no scoring/recommendation output |
| Intel | `Intel Issue Pickup` | every 2 hours | Intelligence backlog pickup, separate from weekly briefing |
| Revenue | `Revenue Issue Pickup` | every 2 hours | Revenue issue pickup |
| Outbound Sales | `Outbound Sales Issue Pickup` | every 2 hours | Lead/outreach issue pickup |

This creates a three-layer automation model:
- native heartbeat for continuity-heavy agents (`Cal`, `Vicky`)
- cron-backed executive heartbeat for `Hermes`
- thin pickup polls for specialist Paperclip workers

### Stabilization Watch (Post-Change)

For the next 2-3 days after the April 11, 2026 heartbeat redesign, monitor:
- empty-run rate on specialist pickup polls (`HEARTBEAT_OK` frequency)
- whether assigned Paperclip issues are actually being picked up without Hermes intervention
- whether any role shows backlog lag that suggests cadence is too slow
- whether Hermes heartbeat summaries become materially shorter and lower-context than before
- whether duplicate or conflicting competitive-intelligence outputs reappear

Recommended review questions:
- Are hourly pickup polls for `prodeng`, `qa`, `ops`, and `tony` actually finding work often enough to justify the cadence?
- Are 2-hour polls for `laura`, `intel`, `revenue`, and `outbound-sales` fast enough for their real issue flow?
- Has the new pickup layer reduced executive overload on Hermes?
- Are there any silent failures, delivery regressions, or unexpected context-growth issues after the redesign?

---

## Delivery Queue

**Location:** `~/.openclaw/delivery-queue/` (37 directories)

OpenClaw maintains an outbound message delivery queue. When an agent completes a cron job or generates output that needs to be delivered via Telegram or other channels, the message is placed in the delivery queue and sent asynchronously.

Delivery modes per job:
- `announce` — post to the specified channel (e.g., Telegram DM)
- `none` — agent handles delivery internally (via direct Telegram tool call)

---

## Hook System

**Config:** `openclaw.json` → `hooks.internal`

Three internal hooks are active:

| Hook | Enabled | Trigger | Purpose |
|------|---------|---------|---------|
| `boot-md` | true | System/agent boot | Loads bootstrap markdown at startup |
| `command-logger` | true | Every tool/command | Logs all commands executed by agents |
| `session-memory` | true | Session open/close | Manages memory save/restore per session |

These hooks are internal to OpenClaw (not user-defined shell scripts). They automate memory bootstrap and logging without agent awareness.

---

## Agent Session Management

**Session scope:** `dmScope: "per-channel-peer"` — each channel+peer combination gets its own DM session context.

**Session maintenance:** `mode: enforce, maxDiskBytes: 500mb` — sessions are actively pruned to stay under 500 MB. Old sessions are deleted to maintain this limit.

**Compaction:** When context approaches limits, the compaction system (safeguard mode) runs:
- Reserves 18k tokens for post-compaction
- Keeps 6k recent tokens
- Max 60% of context can be history
- Preserves last 3 turns
- Runs compaction model (`gpt-oss:20b-cloud`) to summarize
- Post-compaction sections preserved: Mission, Safety and caution areas, Definition of done, Priority order

---

## Exec Approval Flow

**Trigger:** Agent wants to run a shell command not in the allowlist.
**Flow:**
1. Agent proposes command
2. OpenClaw sends approval request to user via Telegram DM (target: user 6986726607)
3. User approves/denies
4. Approved commands are logged in `exec-approvals.json` (30 KB — extensive history)
5. Approval timeout: 60 seconds (from Hermes config.yaml `approvals.timeout`)

**Allowlisted commands** (no approval needed, from `config.json`):
- `openclaw *` — all OpenClaw CLI commands
- `/Users/david/.openclaw/scripts/clear-stale-telegram-overrides.py`
- `gog *`
- `/Users/david/.openclaw/tools/notebooklm_export/scripts/*`

### Structural Approval Flow

Workspace restructuring now uses a second approval lane in addition to shell execution approvals:
1. `workspace-hygiene-scan` identifies duplicate durable roots, stalled project candidates, and similar findings
2. `workspace-restructure-proposal-preview` converts findings into approval requests in `vault-main/System/ApprovalQueue/requests/`
3. Approved items can be executed manually through `openclaw_restructure.py execute-approved`
4. Execution receipts are written to `vault-main/System/OpsTelemetry/restructure-executions/`

**Observed approval state as of April 10, 2026:**
- `ap-20260408T202146Z-potential-duplicate-dura-0b75ca` — executed; moved `vault-main/archive` into `vault-main/Archives/2026/legacy-root-review/archive-0b75ca`
- `ap-20260408T202146Z-potential-duplicate-dura-fb6d37` — requested; high-risk duplicate `Areas` root remains queued
- `ap-20260410T074206Z-project-candidate-has-be-8e9f79` — requested; medium-risk stalled `vault-main/Projects/summary.md` archive candidate

This means approval-backed automation is active, not just conceptual. The remaining maturity gap is breadth and runtime hardening, not the existence of the approval lane itself.

---

### Codex Governance Lint

Codex now has a lightweight governance lint job that checks:
- stale bridge jobs
- missing Codex bridge dependencies
- approval-mode drift
- selected governance alignment conditions

**Current state:** This is a real enforcement layer for the Codex integration, not just documentation guidance. It improves daily governance confidence, but it does not yet replace full OpenClaw cron validation or a complete audit of every scheduled job.

---

## Codex Automations

**Location:** `~/.codex/automations/` (4 directories)

Codex has its own automation definitions. Details not read, but their existence suggests Codex can run automated tasks independently of OpenClaw's cron system.

---

## Control Panel Automation (PropertyOps AI)

The PropertyOps AI control panel in `workspace-hermes/control-panel/` is a Next.js app that surfaces agent work items for human approval. This is an approval-gate automation:
1. Tony prepares maintenance actions / tenant communications
2. Control panel presents them for owner review
3. Owner approves → action executed
4. Owner rejects → action discarded

This is the Phase 1 automation model. Phase 3 may allow Tony to auto-execute after threshold conditions are met.

---

## Mission Control (~/Documents/mission-control/)

A separate Docker-based application with:
- `docker-compose.yml` — container orchestration
- `ecosystem.config.cjs` — PM2 process management
- `mission-control.db` — SQLite production database
- Heartbeat behavior (from `HEARTBEAT.md`)

This appears to be a standalone orchestration or monitoring application. Its relationship to OpenClaw and the control-panel Next.js app is unclear — it may be an older implementation or a parallel production system.

---

## Open Questions / Ambiguities

- Most cron jobs have still not been deeply audited even though the file shape and job count are now confirmed.
- Codex governance has a real lint loop now, but comparable cron-wide validation for all OpenClaw jobs is still missing.
- Whether the daily Memory Audit has a cron job entry or is triggered manually is still unclear.
- The `~/Documents/mission-control/` PM2/Docker setup's relationship to the workspace-hermes Next.js control panel is ambiguous — duplicate, predecessor, or different function?
- Codex automation definitions (`~/.codex/automations/`) were not read.
- Hermes heartbeat authority is now cron-driven rather than native `openclaw.json`, which is intentional; the remaining question is whether that design should later move into a more explicit documented control-plane abstraction.
- The specialist pickup poll layer is now live, but it has not yet been audited over multiple days for noise, empty-run cost, or issue-pickup quality.
- The prior competitive-intelligence overlap has been reduced to one canonical weekly briefing plus one lightweight intel pickup poll, but the broader cron fleet still needs a complete de-duplication audit.
- The nightly workspace maintenance loop is promising but not yet stable enough to call mature; it has only one clean nightly success so far and still hits path limits on larger directories.
