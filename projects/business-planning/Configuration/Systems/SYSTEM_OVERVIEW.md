# SYSTEM_OVERVIEW.md

**Purpose:** High-level explanation of the environment, what each system is, and how they work together.
**Scope:** Paperclip, OpenClaw, Hermes, Codex — as discovered on April 8, 2026.
**Key Files Referenced:** `~/.openclaw/openclaw.json`, `~/.openclaw/workspace-hermes/IDENTITY.md`, `~/.openclaw/workspace-hermes/SOUL.md`, `~/.openclaw/workspace-main/IDENTITY.md`, `~/.paperclip/context.json`, `~/.hermes/config.yaml`

---

## What This Environment Is

This is a personal AI operations environment running on a Mac Mini ("Esteban's MacBook Pro" by node config). It is a multi-agent orchestration system built around four interconnected components:

- **OpenClaw** — the agent runtime and orchestration platform (control plane)
- **Hermes** — a CEO-role agent persona running a specific business (PropertyOps AI)
- **Paperclip** — a task and issue management backend (local API server)
- **Codex** — a code generation and AI workspace tool (Electron app + local state)

The system is operated by **David**, who is the human principal for all agents. Escalation from all agents terminates at David for legal, financial, or irreversible decisions.

---

## The Four Systems

### OpenClaw
**What it is:** The agent orchestration runtime. OpenClaw hosts, routes, schedules, and executes all agents. It is the platform everything else runs on.

OpenClaw is responsible for:
- Hosting named agent instances (20 defined agents across multiple workspaces)
- Routing inbound messages from Telegram, Discord, and webchat to the correct agent
- Running cron-scheduled agent jobs
- Managing model provider connections (Ollama, OpenRouter, Groq, OpenAI-Codex)
- Providing a local gateway API (WebSocket at `ws://127.0.0.1:18789`) used as the control interface
- Managing agent memory, skills, sessions, delivery queues, and credentials
- Providing a plugin system (e.g., `opik-openclaw`, `acpx`)

OpenClaw is configured entirely through `~/.openclaw/openclaw.json`. All agents, models, bindings, channels, hooks, and gateway settings live there.

**It is the infrastructure layer.** It does not make business decisions — it executes agents that do.

---

### Hermes
**What it is:** A named agent persona running inside OpenClaw, acting as CEO of a startup called **PropertyOps AI**.

Hermes is responsible for:
- Strategic and operational decision-making for PropertyOps AI
- Phase execution governance (Phase 0 → 1 → 2 → 3 rollout)
- Oversight of two product agents: **Laura** (intelligence/forensic document analysis) and **Tony** (operational layer/maintenance triage)
- Compliance posture enforcement (Fair Housing Act, PAM/PII)
- Reviewing Paperclip issues and making executive decisions
- Maintaining the Decision Register and memory

Hermes is not a generic assistant. Its workspace (`workspace-hermes`) defines it strictly as a CEO. It delegates to Laura, Tony, and other business-function agents. It escalates to David for company-defining decisions.

Hermes connects to Paperclip via the local API at `http://127.0.0.1:3100/api` to pull and act on assigned issues.

**Hermes is an agent persona, not a software system.** Its "infrastructure" is OpenClaw. Its "business logic" is defined in its workspace files (SOUL.md, IDENTITY.md, AGENTS.md, and agent behavioral docs).

---

### Paperclip
**What it is:** A locally-running task and issue management API server, conceptually similar to a lightweight Linear or Jira, used as the task board for PropertyOps AI agents.

Paperclip provides:
- An HTTP REST API at `http://127.0.0.1:3100/api`
- Issue/task management: create, list, assign, update issues by status (todo, backlog, etc.)
- Company-scoped issue namespacing (company ID: `edea9103-a49f-487f-901f-05b2753b965d`)
- Authentication via Bearer token (API key stored at `~/.openclaw/workspace-hermes/paperclip-api-key.json`)

Paperclip is used primarily by Hermes and its sub-agents. They query it for assigned issues, prioritize work, and update issue state. All curl calls to Paperclip must be single-line (no piping into interpreters) — this is an explicit safety constraint in the workspace.

**Paperclip is the work queue.** Hermes reads from it; Hermes and sub-agents act on it.

Two profiles exist in `~/.paperclip/context.json`: `default` (no key) and `openclaw-local` (reads key from `PAPERCLIP_API_KEY` env var). The active profile is `default`.

---

### Codex
**What it is:** An Electron-based AI coding workspace tool (separate from OpenAI Codex). It is a code generation and AI-assisted development environment with its own persistent state, session logs, and workspace awareness.

Codex is responsible for:
- Handling heavy coding execution (building, refactoring, debugging, testing)
- Maintaining a persistent workspace root pointed at `~/.openclaw`
- Storing shell snapshots, session history, and archived sessions
- Running automations and vendor integrations
- Serving as the execution surface for long-running coding tasks that are routed out of chat threads

Cal's operating model explicitly routes coding execution to Codex: *"Cal = planning, scoping, inspection, coordination, review. Codex = implementation, debugging, refactoring, tests, heavy execution."*

Codex has its own state DB (`~/.codex/state_5.sqlite`), logs DB (`~/.codex/logs_1.sqlite`), and auth configuration. It is accessed as an app separate from OpenClaw.

---

## How They Work Together

```
David (human principal)
    |
    |-- Telegram / Discord / Webchat
    |        |
    |        v
    +-----> OpenClaw (runtime, router, scheduler)
                |
                |-- routes to --> Cal (general operator, main workspace)
                |-- routes to --> Hermes (CEO agent, hermes workspace)
                |-- routes to --> Vicky (personal support agent)
                |-- routes to --> [other agents: laura, tony, prodeng, etc.]
                |
                |-- cron jobs run agents on schedule
                |
                |-- Hermes <---> Paperclip API (task board at :3100)
                |
                |-- Cal <---> Codex (coding execution surface)
                |
                |-- All agents --> Ollama / OpenRouter / Groq (model providers)
```

**Message flow:**
1. David sends a message via Telegram (main bot), Vicky bot, Cal bot, Discord, or webchat.
2. OpenClaw routes the message to the appropriate agent based on channel and account bindings.
3. The agent processes the message using its workspace context (SOUL.md, IDENTITY.md, AGENTS.md, memory files).
4. The agent calls tools (web fetch, file read/write, shell execution, agent-to-agent messaging, Paperclip API).
5. Results are delivered back via the originating channel, or queued in the delivery queue.

**Cron flow:**
1. OpenClaw reads `~/.openclaw/cron/jobs.json` and executes scheduled agent turns.
2. Cron jobs run in isolated sessions and optionally deliver results to Telegram.

---

## Open Questions / Ambiguities

- The relationship between `~/.hermes/` and `~/.openclaw/` is unclear: `~/.hermes/` appears to be a separate Hermes application install (with its own config.yaml, state.db, sessions), while OpenClaw also defines a `hermes` agent with a `workspace-hermes` directory. Whether both are active simultaneously, or whether `~/.hermes/` is a standalone instance, is not confirmed from config alone.
- Paperclip's server binary/process is not documented. How it starts and where it runs is not observed in config files.
- Codex's relationship to OpenClaw is coordination-by-convention (Cal routes to it), not a direct API integration.
