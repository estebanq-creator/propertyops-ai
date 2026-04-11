# CONFIG_REFERENCE.md

**Purpose:** Index of important config files, what each controls, key settings and implications.
**Scope:** All config files observed across OpenClaw, Hermes, Paperclip, Codex.
**Key Files Referenced:** All config files listed below.

---

## Master Config Files

### `~/.openclaw/openclaw.json`
**Controls:** Everything in OpenClaw — agents, models, channels, routing, gateway, tools, plugins, cron, hooks, secrets.
**Size:** ~18 KB | **Version:** `2026.4.5` (lastTouched: 2026-04-06)

Key sections and what they control:

| Section | What it controls |
|---------|-----------------|
| `meta` | Version tracking, last modification timestamp |
| `env` | Environment variable overrides (currently empty) |
| `secrets.providers` | Where secrets come from: `env` (allowlisted env vars) or `file` (gateway token from `credentials/gateway-token.txt`) |
| `auth.profiles` | API auth per provider: groq (api_key), openai-codex (oauth), ollama (api_key), openrouter (api_key) |
| `acp` | Agent Control Panel: enabled, default agent (`hermes`), allowed agents list |
| `models.providers` | Full model catalog: OpenRouter (Gemini 2.0 Flash variants) and Ollama (gpt-oss:20b, glm-5, qwen3.5, qwen3-coder, devstral-2, kimi-k2.5, qwen3-vl variants) |
| `agents.defaults` | System-wide agent defaults: primary model, fallbacks, workspace path, context tokens, memory search config, compaction settings, heartbeat model, max concurrent |
| `agents.list` | Per-agent overrides: model, workspace, heartbeat interval, tool restrictions |
| `tools` | Global tool settings: tool profile, web search/fetch, audio models (Groq Whisper), session visibility, agent-to-agent allow list |
| `bindings` | Channel→agent routing rules |
| `messages` | `ackReactionScope: group-mentions` (when Telegram reactions are sent) |
| `commands` | Native command handling, restart behavior |
| `session` | DM scope, maintenance mode (enforce, max 500 MB disk) |
| `cron` | `maxConcurrentRuns: 1` |
| `hooks.internal` | boot-md, command-logger, session-memory (all enabled) |
| `channels.telegram` | Bot tokens (3 accounts: default/hermes-bot, vicky, cal), DM policy (pairing), group policy (allowlist), exec approvals (manual, approver: user 6986726607) |
| `channels.discord` | Bot token, group allowlist policy, streaming off |
| `gateway` | Port 18789, loopback bind, token auth, allowed origins |
| `plugins` | Allowed plugin list (30+), active: opik-openclaw, acpx, ollama, openrouter |

**Critical settings:**
- `agents.defaults.model.primary = "ollama/glm-5:cloud"` — fallback if no per-agent model set
- `agents.defaults.compaction.mode = "safeguard"` — protects recent context during compaction
- `channels.telegram.execApprovals.enabled = true` — shell execution requires Telegram approval from user 6986726607
- `session.maintenance.maxDiskBytes = 500mb` — sessions are pruned to stay under 500 MB
- `cron.maxConcurrentRuns = 1` — prevents cron overload

---

### `~/.openclaw/cron/jobs.json`
**Controls:** All scheduled agent jobs.
**Size:** 79 KB, 1955 lines | **Version:** 1

Structure per job:
- `id` — unique job identifier
- `name` — human-readable name
- `enabled` — whether job is active
- `schedule.expr` — cron expression (standard 5-field)
- `schedule.tz` — IANA timezone (mostly `America/New_York`)
- `agentId` — which agent runs the job
- `payload.kind = "agentTurn"` — message sent to agent
- `payload.model` — model to use (must match agent's configured model to avoid `LiveSessionModelSwitchError`)
- `payload.lightContext` — if true, minimal bootstrap
- `delivery.mode` — `announce`, `none`
- `delivery.channel` — `telegram`
- `delivery.to` — Telegram user ID
- `sessionTarget = "isolated"` — fresh session every run
- `state` — last run status, timing, error details

**Critical setting:** `payload.model` must match the agent's configured model. Mismatch causes `LiveSessionModelSwitchError`. This is a known fragility.

---

### `~/.openclaw/config.json`
**Controls:** Shell execution allowlist — what scripts can be run without approval.
**Contents:**
```json
{
  "security": {
    "exec": {
      "allowlist": [
        "openclaw *",
        "/Users/david/.openclaw/scripts/clear-stale-telegram-overrides.py",
        "gog *",
        "/Users/david/.openclaw/tools/notebooklm_export/scripts/*"
      ]
    }
  }
}
```
The `openclaw *` entry gives the OpenClaw CLI unrestricted execution. `gog *` appears to be a secondary tool. This is a broad allowlist.

---

### `~/.openclaw/node.json`
**Controls:** Node identity for the OpenClaw gateway.
```json
{
  "version": 1,
  "nodeId": "new-node-123",
  "displayName": "Esteban's MacBook Pro",
  "gateway": { "host": "127.0.0.1", "port": 18789, "tls": false }
}
```
TLS is disabled. Gateway is loopback-only, so TLS is low-risk in isolation but means gateway traffic is unencrypted.

---

### `~/.openclaw/exec-approvals.json`
**Controls:** History of execution approvals granted by the user via Telegram.
**Size:** 30 KB — indicates active use of the approval flow. Agents propose shell commands; user approves via Telegram DM. Each approved command is logged here.

---

### `~/.hermes/config.yaml`
**Controls:** Configuration for the standalone Hermes application.
**Size:** ~238 lines including comments | **Version:** 12

Key settings:

| Setting | Value | Notes |
|---------|-------|-------|
| `model.default` | `qwen3.5:cloud` | Primary model |
| `model.provider` | `custom` | Custom Ollama.com endpoint |
| `model.base_url` | `https://ollama.com/v1` | |
| `agent.max_turns` | 90 | Max turns per session |
| `agent.gateway_timeout` | 1800s | 30-minute session timeout |
| `terminal.backend` | `local` | Local shell execution |
| `terminal.docker_image` | `nikolaik/python-nodejs:python3.11-nodejs20` | Docker fallback image |
| `terminal.container_memory` | 5120 MB | Docker container memory |
| `checkpoints.enabled` | `true` | Session checkpointing on |
| `checkpoints.max_snapshots` | 50 | |
| `smart_model_routing.enabled` | `false` | Not using cheap-model routing |
| `fallback_providers` | `[]` | **No fallback configured** |
| `memory.memory_enabled` | `true` | Memory active |
| `memory.memory_char_limit` | 2200 | Memory compressed at 2200 chars |
| `approvals.mode` | `manual` | Requires manual approval |
| `approvals.timeout` | 60s | |
| `security.tirith_enabled` | `true` | Security policy checker active |
| `security.tirith_fail_open` | `true` | If Tirith fails, allows through |
| `display.personality` | `kawaii` | |
| `tts.provider` | `edge` / `en-US-AriaNeural` | Text-to-speech |

**Critical:** `fallback_providers: []` — if `qwen3.5:cloud` is unavailable, the Hermes app has no fallback. It will fail hard.

**Note on Tirith:** `tirith_fail_open: true` means security checks fail permissive — if the Tirith binary is missing or crashes, actions are allowed through.

---

### `~/.paperclip/context.json`
**Controls:** Paperclip client profile selection and API key source.
```json
{
  "version": 1,
  "currentProfile": "default",
  "profiles": {
    "default": {},
    "openclaw-local": { "apiKeyEnvVarName": "PAPERCLIP_API_KEY" }
  }
}
```
Current active profile: `default` (no API key configured here). The `openclaw-local` profile reads from env. Agents using Paperclip load their key from `paperclip-api-key.json` in the workspace, not from this file.

---

### `~/.codex/config.toml`
**Controls:** Codex application configuration.
**Size:** 380 B — contents not fully read, but small indicates minimal overrides.

### `~/.codex/.codex-global-state.json`
**Controls:** Codex Electron app persistent state.
Key settings observed:
- `workspace roots`: `/Users/david/.openclaw` — Codex is pointed at the OpenClaw directory
- `default service tier`: `fast`
- `agent mode`: `custom`
- `composer auto-context`: `disabled`
- Contains prompt history (multi-turn conversation logs)

---

## Workspace Behavioral Files (Not Config, But Operationally Critical)

These are not config files in the traditional sense but function as behavioral configuration for agents. Changes to these files directly change agent behavior.

| File | Location | What it Controls |
|------|----------|-----------------|
| `SOUL.md` | Each workspace | Agent core personality, values, and operating principles |
| `IDENTITY.md` | Each workspace | Role definition, responsibilities, what agent does/does not do |
| `AGENTS.md` | Each workspace | Session startup procedure, operating rules, tool policies, trust model |
| `HEARTBEAT.md` | workspace-hermes | Behavior during periodic heartbeat sessions |
| `agents/ceo/BEHAVIOR.md` | workspace-hermes | CEO decision style, escalation rules |
| `agents/ceo/GUARDRAILS.md` | workspace-hermes | Hard compliance limits (Laura, Tony constraints) |
| `agents/ceo/DECISION_FRAMEWORK.md` | workspace-hermes | Decision evaluation criteria |
| `memory/global/operating-patterns.qmd` | vault-main | System-wide behavioral patterns (canonical authority) |
| `memory/user/preferences.qmd` | vault-main | Explicit user preferences (high authority) |
| `paperclip-api-key.json` | workspace-hermes | Paperclip Bearer token and base URL |

---

## Open Questions / Ambiguities

- `~/.hermes/auth.json` (10 KB) was not read — may contain additional provider credentials or OAuth tokens.
- `~/.codex/auth.json` (4.3 KB) was not read — Codex authentication details unknown.
- The relationship between OpenClaw's `openclaw.json` model config and `~/.hermes/config.yaml` model config is unclear — if both systems run simultaneously, which model config takes precedence depends on which process is handling the request.
- `~/.env.local` contains `VERCEL_OIDC_TOKEN` — Vercel deployment credentials. Full contents not read.
