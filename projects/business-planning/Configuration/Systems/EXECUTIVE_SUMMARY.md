# EXECUTIVE SUMMARY

**Generated:** April 10, 2026
**Scope:** Paperclip, OpenClaw, Hermes, Codex — discovered from live environment on /Users/david

---

## What This Environment Is

A personal AI operations environment running on a Mac Mini. It is a multi-agent orchestration system built and operated by a single human principal (David) to run both personal automation and a pre-seed PropTech startup (PropertyOps AI).

The environment is sophisticated, intentional, and production-active. It is not experimental — it has persistent state, real business logic, compliance constraints, and real external integrations (Telegram, Discord, Vercel, Paperclip).

---

## How It Is Intended to Operate

**OpenClaw** is the runtime that hosts all agents, routes inbound messages from Telegram/Discord/webchat, schedules cron jobs, and manages the gateway.

**Hermes** is a CEO-persona agent that runs PropertyOps AI — a startup in the proptech space. It reads work items from Paperclip, makes executive decisions, delegates to subordinate agents (Laura for document forensics, Tony for operations), and enforces phase discipline and compliance guardrails.

**Paperclip** is a local task management API that serves as the work queue for PropertyOps AI agents. Hermes and its sub-agents query it to pull and prioritize work. The active runtime appears to be the `default` Paperclip instance on `127.0.0.1:3100`, while automation currently uses a company-scoped token for the PropertyOps company rather than a global board token.

**Codex** is a coding workspace tool. Cal (the general-purpose AI operator) routes heavy coding execution to Codex and retains planning, coordination, and oversight.

**Cal** is the everyday AI operator — orchestrates work, coordinates agents, responds in Telegram and Discord, and maintains the vault (long-term memory and knowledge base).

The system is designed to operate with David as the human-in-the-loop for all consequential decisions:
- Executive decisions escalate to David via Hermes
- Shell execution requires David's Telegram approval (with allowlist exceptions)
- Tony's operational actions require human approval through Phase 2
- Laura cannot produce screening recommendations — only forensic anomaly flags

---

## What Appears Well-Structured

**Agent behavioral definitions are thorough.** Each agent has SOUL.md, IDENTITY.md, AGENTS.md with meaningful content. Role boundaries are clearly defined and consistently cross-referenced.

**Memory governance is mature.** A tiered file-based memory system with canonical QMD files, 3-strike promotion policy, daily audit workflows, and role-specific memory isolation. Better than most AI memory systems.

**Model fallback chain is thoughtful.** Every OpenClaw agent has primary → fallback 1 → fallback 2 configured. Ollama.com cloud as primary, OpenRouter Gemini as last resort.

**Phase discipline is enforced.** PropertyOps AI's phased execution model (Phase 0 → 3) is encoded in behavioral guardrails, not just documentation. Laura and Tony constraints are hard limits.

**Approval workflows are active.** The `exec-approvals.json` (30 KB) shows the approval system is in heavy use. Human oversight is real, not aspirational.

**Workspace governance is now live.** A nightly workspace hygiene scan and a nightly restructure proposal job are running under Cal. The scan writes manifests to `vault-main/System/OpsTelemetry/`, proposals land in `vault-main/System/ApprovalQueue/requests/`, and one low-risk duplicate root (`archive` → `Archives`) has already been executed successfully.

**Automation governance is uneven but improving.** Structural approvals and Codex governance linting now have real enforcement paths. Heartbeat architecture is also more role-aligned now: slower native heartbeats for Cal and Vicky, an hourly 7-day executive triage heartbeat for Hermes, and thin Paperclip pickup polls for specialist agents. The larger remaining gap is full cron-job audit coverage and system-wide model-alignment validation.

**Secrets management is partially good.** Gateway token is file-based. Many API keys are environment variables. The allowlist pattern for secrets is the right direction.

---

## What Appears Fragile or Unclear

**Credentials in the main config.** Three Telegram bot tokens and one Discord token are inline in `openclaw.json`. This is the highest-priority security issue.

**Broad shell allowlist.** `openclaw *` and `gog *` wildcard entries allow unlimited execution of those tools without user approval. This is too broad.

**No fallback in Hermes standalone app.** `~/.hermes/config.yaml` has `fallback_providers: []`. One rate limit episode already caused job failure.

**Tirith fail-open.** If the Tirith security binary fails, all security checks pass silently. This negates the security layer.

**Authority had been ambiguous in several places.** See [AUTHORITY_DECISIONS.md](AUTHORITY_DECISIONS.md). The active PropertyOps control panel is `workspace-hermes/control-panel/`, the active Hermes operating path is `workspace-hermes/`, the active Paperclip runtime is the `default` instance on port `3100`, and `/Users/david/system-docs/` is stale.

**Standalone Hermes still exists as a parallel runtime surface.** `~/.hermes/` remains present for standalone/vendor-specific use, but it is not the authoritative PropertyOps operating workspace.

**Agent-to-agent messaging state conflict.** `openclaw.json` enables A2A messaging but `workspace-hermes/MEMORY.md` says it's disabled. The true operational state is unknown.

**Workspace maintenance is real but not yet mature.** The nightly hygiene loop has one successful run on April 10, 2026, but also one failed run on April 9, 2026 due to a provider DNS lookup failure. The latest scan also hit its 1,200-path cap, so coverage is useful but still partial.

**Large unread credential files.** `~/.hermes/.env` (15 KB) and `~/.hermes/auth.json` (10 KB) were not audited.

---

## What An AI Should Understand Before Making Changes

1. **The Laura constraint is inviolable.** Never modify Laura's role to include scoring, screening recommendations, or language that could be classified as tenant screening. This is a Fair Housing Act compliance issue with legal risk.

2. **Tony requires human approval through Phase 2.** Do not add auto-execution to Tony's capabilities without explicit instruction and phase evidence.

3. **Cron model matching is required.** Any new cron job must use the same model as the agent's configured primary, or it will fail with `LiveSessionModelSwitchError`.

4. **The Next.js control panel uses breaking-change APIs.** Read `node_modules/next/dist/docs/` before touching control panel code — it is not standard Next.js.

5. **Cal owns workspace coordination; Hermes owns PropertyOps AI.** Do not conflate these. Changes to workspace-main affect Cal's general operations; changes to workspace-hermes affect the startup.

6. **Memory has an authority hierarchy.** `memory/*.qmd` (canonical) outranks daily notes outranks session evidence. Do not promote unverified observations to canonical memory.

7. **David is the final escalation point.** For legal, financial, company-defining, or irreversible decisions — stop and ask David, do not proceed.

8. **The vault-main AGENTS.md is the most important operating guide for Cal.** It contains the full operating ruleset including priority order (safety > clarity > correctness > maintainability > speed), execution gate rules, and heavy execution routing conventions.

9. **Security audit findings exist.** `~/.openclaw/status_deep.txt` reportedly contains 4 CRITICAL and 3 WARNING findings. These should be reviewed before making security-adjacent changes.

10. **This is a production system.** Session state, Paperclip tasks, Telegram conversations, and Vercel deployments are real. Actions with external effects (sending messages, deploying code, modifying Paperclip issues) should be treated with production-level care.

11. **Structural changes now have a real approval lane.** Folder restructures and archive candidates are no longer just a design idea; they are proposed into `vault-main/System/ApprovalQueue/requests/` and must be approved before execution.

12. **The active system docs live in the business-planning workspace.** `/Users/david/system-docs/` is stale; the maintained copies are under `~/.openclaw/workspace-main/projects/business-planning/Configuration/Systems/`.

13. **Authority questions now have a canonical decision record.** Use [AUTHORITY_DECISIONS.md](AUTHORITY_DECISIONS.md) before guessing which Hermes runtime, control panel, credential path, or docs tree is authoritative.
