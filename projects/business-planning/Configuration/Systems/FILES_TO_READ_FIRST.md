# FILES_TO_READ_FIRST.md

**Purpose:** Curated "first read" list for another AI or engineer. Top files that most efficiently establish understanding of the environment.
**Scope:** All systems.
**Ordered by:** Foundational → Operational → Specialized

---

## Tier 1 — Read These First (Foundation)

| # | File | Why Read It |
|---|------|-------------|
| 1 | `~/.openclaw/openclaw.json` | The master config. Agents, models, channels, gateway, hooks, plugins — everything is here. Start here. |
| 2 | `~/.openclaw/workspace-main/AGENTS.md` | Cal's full operating model: 200+ lines of execution rules, safety defaults, routing conventions, communication norms. Defines how the system thinks about work. |
| 3 | `~/.openclaw/workspace-hermes/AGENTS.md` | Hermes operating model: session startup procedure, trust hierarchy, Paperclip integration, memory rules. Defines the CEO persona's operating contract. |
| 4 | `~/.openclaw/workspace-hermes/IDENTITY.md` | CEO role definition — what Hermes does, doesn't do, and is responsible for. Establishes PropertyOps AI's structure. |
| 5 | `~/.openclaw/workspace-hermes/SOUL.md` | CEO mission statement. The "why" behind all executive decisions. Critical for understanding phase discipline and compliance posture. |

---

## Tier 2 — Read Next (Operational)

| # | File | Why Read It |
|---|------|-------------|
| 6 | `~/.openclaw/cron/jobs.json` | All scheduled automation. Who runs what, when, on which model, with what delivery. Read for automation understanding and to audit model alignment. |
| 7 | `~/.openclaw/vault-main/AGENTS.md` | Cal's detailed operating rules from the vault perspective: memory routing, skill promotion, business incubator mode, priority order. |
| 8 | `~/.openclaw/vault-main/MEMORY.md` | Memory routing digest — explains the tier structure, promotion rules, and which files to read for different types of knowledge. |
| 9 | `~/.openclaw/vault-main/memory/global/operating-patterns.qmd` | Canonical system-wide behavioral patterns (authority: high). Includes the cron model-matching rule and orchestration principles. |
| 10 | `~/.hermes/config.yaml` | Hermes standalone app config: model, terminal backend, checkpoints, security, TTS, memory limits. Shows the gap (no fallback) and operational settings. |
| 11 | `~/.openclaw/workspace-main/SOUL.md` | Cal's personality and values. Explains why agents behave the way they do — the "earn trust through competence" operating philosophy. |
| 12 | `~/.openclaw/workspace-main/IDENTITY.md` | Cal's role definition — coordinator, not deputy CEO. Key for understanding the Cal/Hermes division of responsibility. |

---

## Tier 3 — Read for Specific Areas

| # | File | Area | Why Read It |
|---|------|------|-------------|
| 13 | `~/.openclaw/workspace-hermes/agents/ceo/BEHAVIOR.md` | Hermes behavior | Decision style, escalation rules, execution bias. Governs how Hermes makes decisions. |
| 14 | `~/.openclaw/workspace-hermes/agents/ceo/GUARDRAILS.md` | Compliance | Laura and Tony hard limits. Critical before touching any PropertyOps AI product code. |
| 15 | `~/.openclaw/workspace-hermes/HEARTBEAT.md` | Automation | How Hermes behaves during heartbeat runs. Paperclip issue review protocol. |
| 16 | `~/.openclaw/workspace-hermes/control-panel/README.md` | Product | PropertyOps AI control panel tech stack and setup. Phase 1 deliverable. |
| 17 | `~/.openclaw/config.json` | Security | Shell execution allowlist — what runs without user approval. Short but high-impact. |
| 18 | `~/.openclaw/node.json` | Infrastructure | Node identity, gateway host/port, TLS status. |
| 19 | `~/.openclaw/vault-main/memory/user/preferences.qmd` | User | David's explicit preferences. Read before making recommendations that affect user experience. |
| 20 | `~/.openclaw/vault-main/memory/global/operating-patterns.qmd` | System rules | Already in Tier 2 — re-read specifically for the cron model-matching constraint if setting up new cron jobs. |

---

## Key Files for Specific Tasks

### Before setting up a new cron job
1. `~/.openclaw/cron/jobs.json` — understand existing job patterns
2. `~/.openclaw/openclaw.json` → `agents.list` → find the agent's `model.primary`
3. `vault-main/memory/global/operating-patterns.qmd` → cron model matching rule

### Before modifying agent behavior
1. Agent's `SOUL.md` — understand core values
2. Agent's `IDENTITY.md` — understand role boundaries
3. Agent's `AGENTS.md` — understand operating rules
4. `vault-main/AGENTS.md` — understand system-wide conventions

### Before working on the control panel
1. `workspace-hermes/control-panel/README.md` — tech stack
2. `workspace-hermes/control-panel/AGENTS.md` — Next.js breaking changes warning
3. `workspace-hermes/agents/ceo/GUARDRAILS.md` — compliance constraints
4. `workspace-hermes/PHASE1-IMPLEMENTATION.md` — current implementation state

### Before modifying memory architecture
1. `vault-main/MEMORY.md` — tier structure and routing
2. `vault-main/memory/global/operating-patterns.qmd` — promotion rules
3. Skills: `skills/memory-governance/SKILL.md`, `skills/memory-maintenance/SKILL.md`

### Before touching credentials or security
1. `~/.openclaw/config.json` — allowlist
2. `~/.openclaw/openclaw.json` → `secrets`, `channels` sections
3. `SECURITY_AND_BOUNDARIES.md` (this doc set) — known risks

---

## Files That Should Exist But Were Not Found or Not Read

| File | Why It Should Exist | Status |
|------|---------------------|--------|
| `~/.openclaw/workspace-hermes/agents/ceo/GUARDRAILS.md` | Compliance guardrails for Laura/Tony | Not read (referenced in AGENTS.md) |
| `~/.openclaw/workspace-hermes/agents/laura/IDENTITY.md` | Laura forensic role definition | Not read |
| `~/.openclaw/workspace-hermes/agents/tony/IDENTITY.md` | Tony operational role definition | Not read |
| `~/.hermes/.env` | Hermes API keys and secrets | 15 KB — not read (security audit needed) |
| `~/.hermes/auth.json` | Hermes auth tokens | 10 KB — not read |
| `~/.openclaw/status_deep.txt` | Security audit with 4 CRITICAL findings | Not read — should be reviewed |
| `vault-main/memory/user/preferences.qmd` | User preference canon | Not fully read |
| `~/Documents/mission-control/ORCHESTRATION.md` | Mission-control app orchestration design | Not read |
