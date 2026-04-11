# SECURITY_AND_BOUNDARIES.md

**Purpose:** Trust boundaries, credential handling, shell/tool access, approval boundaries, external exposure, security concerns.
**Scope:** All systems.
**Key Files Referenced:** `~/.openclaw/openclaw.json`, `~/.openclaw/config.json`, `~/.hermes/config.yaml`, `~/.openclaw/workspace-hermes/AGENTS.md`, discovery scan security observations.

---

## Trust Hierarchy

```
David (human principal — highest trust)
    |
    ├── OpenClaw system (system-level trust)
    │       ├── Cal (agent trust — internal actions allowed, external requires care)
    │       ├── Hermes (agent trust — CEO persona, executive scope)
    │       ├── Vicky (agent trust — personal support scope)
    │       └── [other agents — scoped to their workspace]
    |
    └── External channels (lowest trust)
            ├── Telegram (DM paired, group allowlisted)
            ├── Discord (allowlisted)
            └── Webchat (loopback only)
```

---

## Gateway Security

- **Bind:** Loopback only (`127.0.0.1:18789`) — not exposed to network
- **TLS:** Disabled (loopback, so acceptable but unencrypted on-wire)
- **Auth:** Token from file (`credentials/gateway-token.txt`)
- **Allowed origins:** `http://localhost:18789`, `http://127.0.0.1:18789` — no external origins
- **Control UI:** Restricted to loopback origins

**Assessment:** Gateway surface is small and local-only. Primary risk is local process compromise.

---

## Shell Execution Controls

### Approval Flow
Shell commands proposed by agents (outside the allowlist) require explicit approval:
- Approval sent to user via Telegram DM
- User: `6986726607` is the sole approver
- Approval logged in `exec-approvals.json`
- Timeout: 60 seconds

### Allowlisted Commands (no approval required)
From `~/.openclaw/config.json`:
```
openclaw *                    ← ALL openclaw CLI commands — broad
gog *                         ← Unknown tool — broad wildcard
clear-stale-telegram-overrides.py  ← Specific script
tools/notebooklm_export/scripts/*  ← Script directory wildcard
```

**Concern:** `openclaw *` is a broad wildcard. Any `openclaw` subcommand executes without user approval, including potentially destructive operations. Similarly, `gog *` is an unknown tool with full wildcard access.

---

## Credential Storage

| Credential | Location | Risk Level |
|-----------|----------|-----------|
| Telegram bot tokens (3) | `openclaw.json` (inline) | HIGH — in main config |
| Discord bot token | `openclaw.json` (inline) | HIGH — in main config |
| Ollama API key (Bearer) | `openclaw.json` headers (inline) | MEDIUM — cloud API |
| OpenClaw gateway token | `credentials/gateway-token.txt` (file) | MEDIUM — local only |
| Paperclip API key | `workspace-hermes/paperclip-api-key.json` | MEDIUM — workspace-local authority; avoid sprawl |
| OPENROUTER_API_KEY | env var (from allowlist) | LOW — env only |
| OLLAMA_API_KEY | env var (from allowlist) | LOW — env only |
| GEMINI_API_KEY | env var (from allowlist) | LOW — env only |
| DISCORD_BOT_TOKEN | env var (from allowlist) | LOW — env only |
| TELEGRAM_BOT_TOKEN_MAIN | env var (from allowlist) | LOW — env only |
| TELEGRAM_BOT_TOKEN_VICKY | env var (from allowlist) | LOW — env only |
| VERCEL_OIDC_TOKEN | `~/.env.local` | MEDIUM — deployment access |
| Strava credentials | `~/.strava_credentials.json` | LOW — health data only |
| Hermes `.env` | `~/.hermes/.env` | UNKNOWN — 15 KB, unread |
| Hermes `auth.json` | `~/.hermes/auth.json` | UNKNOWN — 10 KB, unread |

**Critical observation:** Telegram and Discord tokens are stored inline in `openclaw.json`, not in environment variables. This means they are readable by any agent that can read its own workspace, or by any process that can access the config file.

---

## Agent Tool Access

### Global Tool Profile
`openclaw.json` tools section: `profile: "coding"` — agents have access to coding-oriented tools.

### Tools Enabled System-Wide
- Web search: enabled
- Web fetch: enabled
- Audio: enabled (Groq Whisper)
- Agent-to-agent messaging: enabled (for listed agents)
- Session visibility: `all` — agents can see all sessions

### Per-Agent Tool Restrictions
| Agent | Restriction |
|-------|------------|
| Vicky | `web_search` denied |

### Hermes App Tool Profile
From `config.yaml`:
- `toolsets: [hermes-cli]` — uses Hermes CLI toolset
- Terminal: local shell with Docker support
- `command_allowlist: ["script execution via -e/-c flag"]` — shell script execution allowed
- `approvals.mode: manual` — manual approval required
- `security.tirith_enabled: true`, `tirith_fail_open: true` — security check active but permissive on failure

---

## Telegram Security

**DM Policy:** `pairing` mode — agents only respond to paired users. This limits who can initiate conversations.

**Group Policy:** `allowlist` — only allowlisted groups can trigger agent responses.

**Group Allow:** User `6986726607` only (David).

**Exec approvals:** Enabled, delivered to `dm` for approver `6986726607`.

**Known issues (from discovery scan):** There are 4 CRITICAL and 3 WARNING security findings noted in `~/.openclaw/status_deep.txt`:
- Telegram DM policy has a concern (possibly "open DM policy" for some account)
- Elevated tools exposure
- Reverse proxy header issues
- Gateway command exposure

These were not fully read but are documented as existing findings.

**Bot tokens exposed inline:** All three bot tokens (hermes-bot, vicky, cal) are in `openclaw.json` plaintext. Anyone with read access to this file can impersonate the bots.

---

## External Exposure

| Surface | External? | Notes |
|---------|-----------|-------|
| OpenClaw gateway (:18789) | No — loopback only | |
| Telegram bots | Yes — via Telegram API | DM pairing + group allowlist controls access |
| Discord bot | Yes — via Discord API | Group allowlist only |
| Paperclip API (:3100) | No — loopback only | |
| Control panel (Next.js) | Yes — Vercel deployment | next-auth v5 protects routes; Tailscale tunnel to gateway |
| Mission-control | Likely local | Docker-based, PM2 process |

---

## Agent Behavioral Boundaries

Defined in workspace files. These are behavioral constraints, not system-enforced:

**Universal constraints (all agents, from SOUL.md):**
- Private things stay private
- When in doubt, ask before acting externally
- Never send half-baked replies to messaging surfaces
- Be careful in group chats

**Hermes-specific hard limits (from GUARDRAILS.md, IDENTITY.md):**
- Laura MUST NOT produce scoring or screening recommendations (Fair Housing compliance)
- Tony MUST NOT auto-execute without human approval through Phase 2
- Do not exfiltrate private data
- Do not run destructive commands without approval
- Do not send external communications unless explicitly asked or authorized

**Cal-specific limits (from AGENTS.md):**
- Treat auth, secrets, env config, deployment, billing, destructive file ops, data model changes, automation with side effects as HIGH risk
- Prefer sandbox-first execution
- Stay inside intended project folder unless clearly required

---

## Security Tirith

**Hermes config.yaml** enables `tirith` (a security policy checker):
- `tirith_enabled: true`
- `tirith_path: tirith` (binary must be in PATH)
- `tirith_timeout: 5` seconds
- `tirith_fail_open: true` — **if Tirith fails or is unavailable, requests are ALLOWED through**

**Fail-open is a security concern:** If the Tirith binary is missing, crashes, or times out, all security checks are bypassed silently.

---

## Open Questions / Ambiguities

- `~/.hermes/.env` (15 KB) and `~/.hermes/auth.json` (10 KB) were not read. These likely contain sensitive credentials that should be audited.
- `status_deep.txt` in `~/.openclaw/` reportedly contains a security audit with 4 CRITICAL findings — these should be reviewed in full.
- The `gog *` allowlist entry is for an unknown tool. If `gog` is a broadly capable binary, this is an unrestricted execution path.
- Whether Tailscale is currently configured and active for control-panel access is not confirmed.
- Discord bot token is in `openclaw.json` plaintext — same risk as Telegram tokens.
- Paperclip credential handling still needs hardening: the current authority is `workspace-hermes/paperclip-api-key.json`, but secret sprawl into docs/scripts was easy enough to happen that it should be monitored and eventually moved to a more centralized path.
