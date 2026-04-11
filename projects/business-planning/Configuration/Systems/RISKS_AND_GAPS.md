# RISKS_AND_GAPS.md

**Purpose:** Missing docs, fragile configs, ambiguous ownership, operational risks, technical debt, recommendations.
**Scope:** All systems.
**Classification:** Documentation gap | Config ambiguity | Architectural ambiguity | Security concern | Reliability concern | Performance concern | Integration fragility

---

## CRITICAL — Immediate Attention

### [Security Concern] Credentials Embedded in Main Config
**File:** `~/.openclaw/openclaw.json`
- Three Telegram bot tokens stored inline
- One Discord bot token stored inline
- One Ollama Bearer token stored inline

**Risk:** Any agent or process with read access to `openclaw.json` can read all bot credentials. Agents routinely read workspace files. If any agent is compromised or misbehaves, all tokens are exposed.

**Recommendation:** Move tokens to env vars (already on the `secrets.providers.default.allowlist` for TELEGRAM_BOT_TOKEN_MAIN, TELEGRAM_BOT_TOKEN_VICKY) or to credential files, consistent with how the gateway token is handled.

---

### [Security Concern] Broad Shell Execution Allowlist
**File:** `~/.openclaw/config.json`
- `openclaw *` allows ALL OpenClaw CLI commands without approval
- `gog *` allows ALL commands for an unknown tool without approval

**Risk:** An agent could invoke destructive `openclaw` subcommands (delete sessions, wipe memory, restart agents, etc.) without user approval. `gog *` is entirely unaudited.

**Recommendation:** Replace wildcards with specific allowlisted subcommands. Audit what `gog` is and restrict its allowlist.

---

### [Reliability Concern] Hermes App Has No Fallback Model
**File:** `~/.hermes/config.yaml`
- `fallback_providers: []` — empty
- Primary: `qwen3.5:cloud` via Ollama.com

**Risk:** If Ollama.com is down, rate-limited, or the model is unavailable, the standalone Hermes app fails hard with no recovery path. NYC 311 weekday job already experienced rate limit failures.

**Recommendation:** Configure at least one fallback provider (e.g., `openrouter` with `google/gemini-2.0-flash-001`).

---

### [Security Concern] Tirith Fail-Open
**File:** `~/.hermes/config.yaml`
- `tirith_fail_open: true`

**Risk:** If the Tirith security binary is missing, unavailable, or crashes, all security policy checks silently pass. Security is not enforced on failure.

**Recommendation:** Either set `tirith_fail_open: false` (fail closed) or ensure Tirith is always present and healthy. Add a startup check.

---

## HIGH — Should Be Addressed

### [Security Concern] Unread Credential Files
- `~/.hermes/.env` (15 KB) — contents unknown
- `~/.hermes/auth.json` (10 KB) — contents unknown
- `~/.codex/auth.json` (4.3 KB) — contents unknown

**Risk:** Unknown credentials may include API keys, OAuth tokens, or other sensitive material not captured in this documentation.

**Recommendation:** Audit these files and add them to the credential inventory.

---

### [Security Concern] Existing Security Audit Findings Unaddressed
**File:** `~/.openclaw/status_deep.txt` (unread in full)
- Discovery scan noted: 4 CRITICAL findings, 3 WARNING findings including Telegram DM policy and elevated tools exposure

**Recommendation:** Read and action `status_deep.txt` fully. Treat existing CRITICAL findings as backlog items.

---

### [Config Ambiguity] Cron Model Mismatch Risk
**File:** `~/.openclaw/cron/jobs.json`
- Jobs must use the same model as their assigned agent to avoid `LiveSessionModelSwitchError`
- This constraint is documented in `operating-patterns.qmd`, but broad cron-wide validation is still easy to miss when creating or editing jobs

**Risk:** Creating a cron job with a different model than the agent's configured primary causes silent session errors. The NYC 311 weekday job already failed with a different error (rate limit); model mismatch could cause similar silent failures.

**Current maturity:** Partial enforcement exists. Codex-specific governance now has a real linter, but general OpenClaw cron model alignment is still not validated system-wide before or after job creation.

**Recommendation:** Add a general cron validation step that asserts `payload.model == agent's configured primary model` for all jobs, not just Codex-governed flows.

---

### [Architectural Ambiguity] Two Control Panel Implementations
Two separate control panel applications exist:
1. `~/Documents/mission-control/` — Docker/PM2/SQLite, appears older
2. `~/.openclaw/workspace-hermes/control-panel/` — Next.js/Vercel, Phase 1 deliverable

**Current status:** Authority is now documented in `AUTHORITY_DECISIONS.md`. The active PropertyOps control panel is `~/.openclaw/workspace-hermes/control-panel/`. `~/Documents/mission-control/` remains a legacy/reference lineage unless explicitly re-designated.

**Residual risk:** Legacy/reference code still exists and may confuse future operators if not archived or clearly labeled.

**Recommendation:** Keep `AUTHORITY_DECISIONS.md` as the source of truth and decide whether to archive `mission-control/` formally.

---

### [Integration Fragility] Paperclip API Key Authority
**Current authority:** `workspace-hermes/paperclip-api-key.json`

**Current status:** Earlier review notes flagged a duplicate `vault-main` copy, but the live filesystem check did not find that duplicate. This now looks like a documentation drift issue more than an active duplicate-key split-brain problem.

**Residual risk:** The environment still relies on a workspace-local credential file rather than a centralized credential authority or env-var flow. There was also some secret sprawl into control-panel docs/scripts before this review, which has now been scrubbed, but it shows the credential handling path is still easy to misuse.

**Recommendation:** Keep `workspace-hermes/paperclip-api-key.json` as the current source of truth, do not recreate duplicate copies, and plan a later move to a centralized credential path or env var.

---

### [Config Ambiguity] Paperclip Runtime vs Credential Authority
`~/.paperclip/context.json` active profile is `default`, and live health/log evidence indicates the `default` Paperclip instance on port `3100` is the active board runtime. Separately, agents authenticate with the company-scoped token in `workspace-hermes/paperclip-api-key.json`.

**Current status:** This is no longer best described as a profile mismatch. It is a two-part auth model that had not been documented clearly enough:
- runtime authority: `~/.paperclip/instances/default/`
- automation credential authority: `workspace-hermes/paperclip-api-key.json`

**Residual risk:** Operators may still assume the workspace token should be able to call global routes like `/api/companies`, when in practice it appears scoped to the active PropertyOps company. That can look like auth failure even when company-scoped automation is healthy.

**Recommendation:** Document the split explicitly in the authority docs and treat `/api/companies/<companyId>/*` as the real health check for Hermes/OpenClaw automation.

---

### [Architectural Ambiguity] Hermes as Two Systems
Two distinct "Hermes" systems exist:
1. `~/.hermes/` — standalone Hermes application with its own `config.yaml`, `state.db`, sessions
2. OpenClaw's `hermes` agent — defined in `openclaw.json`, uses `workspace-hermes/`

**Current status:** Authority is now documented in `AUTHORITY_DECISIONS.md`. The active PropertyOps operating path is `workspace-hermes/`. The standalone Hermes app remains available as a separate runtime surface, but not as the canonical PropertyOps operating workspace.

**Residual risk:** Because `~/.hermes/` still exists and can be used, operator confusion or side-channel drift is still possible if its use is not intentional and documented.

**Recommendation:** Keep the authority decision record current and decide whether the standalone Hermes app should remain an exception path or be retired from normal operations.

---

### [Reliability Concern] Local Ollama Dependency for Memory Search
**Dependency:** `nomic-embed-text` requires local Ollama at `127.0.0.1:11434`

**Risk:** If local Ollama is not running, memory search silently fails. Agents may proceed without memory context without knowing search failed.

**Recommendation:** Add startup health check for local Ollama. Log clearly when memory search is unavailable.

### [Reliability Concern] Nightly Workspace Hygiene Loop Is Not Stable Yet
**Files:** `~/.openclaw/cron/runs/workspace-hygiene-scan.jsonl`, `~/.openclaw/vault-main/System/OpsTelemetry/workspace-hygiene-latest.json`
- April 9, 2026 nightly run failed due to provider DNS lookup failure
- April 10, 2026 nightly run succeeded
- Latest successful scan hit its global path cap (`1,200` paths), which means large directories can still be truncated

**Risk:** The new maintenance loop is operationally useful, but it is too early to treat it as fully dependable. Failures or truncated scans could delay detection of stale content or duplicate roots.

**Recommendation:** Wait for 3-5 consecutive successful nightly runs before treating the loop as mature. Consider raising limits slightly or adding targeted second-pass scans for large roots.

---

## MEDIUM — Address When Possible

### [Documentation Gap] `gog` Tool Undocumented
`gog *` is in the shell execution allowlist but its purpose is unknown. No documentation found.

**Recommendation:** Document what `gog` is and restrict its allowlist to specific safe subcommands.

---

### [Documentation Gap] Full Cron Job List Not Audited
The current `jobs.json` contains 55 jobs, but only a subset have been reviewed closely. The file may still contain jobs with outdated models, disabled-but-forgotten tasks, or tasks that reference resources that no longer exist.

**Current maturity:** This is still largely manual. The new Codex governance lint helps on the Codex side, but it is not a substitute for a full OpenClaw cron audit.

**Recommendation:** Periodically audit all cron jobs for model alignment and relevance, and eventually promote that review into a broader cron lint pass.

### [Governance Maturity Gap] Structural Approval Lane Exists but Is Still Young
**Files:** `~/.openclaw/vault-main/System/ApprovalQueue/requests/`, `~/.openclaw/vault-main/System/OpsTelemetry/restructure-executions/`
- One high-risk duplicate-root request (`archive` vs `Archives`) has been approved and executed successfully
- One high-risk duplicate-root request (`.openclaw/Areas` vs `vault-main/Areas`) remains queued
- One medium-risk stalled project request (`vault-main/Projects/summary.md`) remains queued
- Scheduled execution is still intentionally disabled

**Risk:** Governance is no longer purely convention-driven here; there is a real approval lane and execution receipt trail. But the system is still in an early operational phase, and there is not yet enough run history to trust unattended restructure execution.

**Recommendation:** Keep execution manual for now, review proposal quality over several more nights, and only consider scheduled execution after consecutive clean runs plus a stricter pre-execution plan-hash check.

---

### [Documentation Gap] Agent-to-Agent Messaging State Conflict
`openclaw.json` has `agentToAgent.enabled: true`, but `workspace-hermes/MEMORY.md` states: "Agent-to-agent messaging is disabled."

**Risk:** Unclear operational state. Agents may attempt A2A messaging and either succeed (contradicting the MEMORY.md note) or fail (the feature is broken). Either way, the documentation is inconsistent.

**Recommendation:** Resolve the conflict — update whichever record is stale.

---

### [Documentation Gap] Leo Agent Configuration
Discovery scan described Leo as using `openai-codex/gpt-5.4` but this model/provider is absent from `openclaw.json`. Leo's current operational state is unknown.

**Recommendation:** Verify if Leo is active and document its current model assignment.

---

### [Reliability Concern] Hermes Workspace Memory No Promotion Path
`workspace-hermes/memory/YYYY-MM-DD.md` accumulates CEO daily notes but has no documented promotion path to long-term storage. If the workspace is reset or archived, institutional memory is lost.

**Recommendation:** Define a promotion protocol for important Hermes memory into a durable store.

---

### [Reliability Concern] Paperclip 404 Noise Needs Triage
The active access logs are overwhelmingly healthy on the PropertyOps company, but Paperclip server logs still contain some older dashboard/sidebar 404s for stale company IDs. The cleanest currently observed 404 during this review was against the active company path:
`GET /companies/edea9103-a49f-487f-901f-05b2753b965d/issues/PRO-11 404`

**Residual risk:** This looks smaller than a board-authority problem, but it still indicates there may be stale UI links, bookmarks, or leftover company references creating noise and making incident review harder.

**Current diagnosis:** This does not appear to be a missing-issue problem. Exact issue fetches work on `/api/issues/<identifier>` (for example `/api/issues/PRO-11`), while the company-scoped detail route `/api/companies/<companyId>/issues/<identifier>` returns `404`.

**Recommendation:** Treat this as endpoint-contract cleanup. Use `/api/issues/<identifier-or-id>` for exact issue lookups, and clean up any stale callers or bookmarks that still attempt the company-scoped issue-detail route.

---

### [Performance Concern] Session Storage at Scale
- 160+ session directories in `~/.openclaw/sessions/`
- 160+ session directories in `~/.hermes/sessions/`
- `session.maintenance.maxDiskBytes: 500mb` is configured but may not be enough to prevent sluggish session restoration

**Recommendation:** Confirm maintenance enforcement is running and periodically verify disk usage.

---

### [Integration Fragility] Next.js Version Warning
`workspace-hermes/control-panel/AGENTS.md` contains:
> "This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data."

**Risk:** Any AI agent (including this one) working on the control panel may generate incorrect code based on older Next.js patterns.

**Recommendation:** Ensure the Next.js guide in `node_modules/next/dist/docs/` is read before any control panel code work.

### [Documentation Gap] `~/system-docs/` Is Stale
The maintained copies of these environment docs now live under `~/.openclaw/workspace-main/projects/business-planning/Configuration/Systems/`, while `~/system-docs/` no longer appears to be the active source.

**Recommendation:** Either archive `~/system-docs/` or leave a pointer file there so future audits do not treat it as authoritative.

---

## LOW — Good to Track

### [Documentation Gap] `~/.openclaw/.clawhub/` Purpose Unknown
Vault integration directory for OpenClaw — purpose and contents not documented.

### [Documentation Gap] `acpx` Plugin Undocumented
The `acpx` plugin is enabled but its function is unknown beyond extending the ACP.

### [Documentation Gap] `opik-openclaw` Plugin Partial
Known to provide SQLite vector store (`vec0.dylib`) but may have additional instrumentation or tracing capabilities (Opik is a tracing/evaluation tool for LLMs).

### [Architectural Ambiguity] `~/openclaw/` (non-dotfile) Purpose
A secondary `~/openclaw/` directory exists (non-hidden) with `models/` and `agents/Wren/`. Its relationship to `~/.openclaw/` is unclear — may be a development or staging area.

---

## Summary Risk Matrix

| Risk | Severity | Ease of Fix | Priority |
|------|----------|-------------|----------|
| Credentials in openclaw.json | High | Medium | 1 |
| Broad shell allowlist (`openclaw *`, `gog *`) | High | Low | 2 |
| No fallback in Hermes app | High | Easy | 3 |
| Tirith fail-open | Medium-High | Easy | 4 |
| Unread credential files | Medium | Easy (read + audit) | 5 |
| Two control panel implementations | Medium | Medium | 6 |
| Paperclip API key duplication / sprawl | Medium | Easy | 7 |
| A2A messaging state conflict | Medium | Easy | 8 |
| Cron model mismatch risk | Medium | Medium | 9 |
| Hermes dual-system ambiguity | Medium | Medium | 10 |
