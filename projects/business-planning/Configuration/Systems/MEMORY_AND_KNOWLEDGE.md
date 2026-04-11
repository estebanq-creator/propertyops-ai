# MEMORY_AND_KNOWLEDGE.md

**Purpose:** Memory layers, canonical vs working vs runtime, indexing/retrieval, knowledge sources, promotion governance.
**Scope:** Cal/vault-main memory system, Hermes workspace memory, Vicky workspace memory.
**Key Files Referenced:** `~/.openclaw/vault-main/MEMORY.md`, `~/.openclaw/vault-main/memory/global/operating-patterns.qmd`, `~/.openclaw/workspace-hermes/AGENTS.md`, `~/.openclaw/workspace-main/SOUL.md`

---

## Memory Architecture Overview

The system uses a file-based, tiered memory architecture. There is no external vector database for long-term storage — all canonical memory lives in Markdown/QMD files on disk. A local SQLite vector store (`sqlite-vec`) is used for semantic search over working memory.

---

## Memory Tiers (Cal / vault-main)

Defined in `vault-main/MEMORY.md` (frontmatter: `authority: medium`, `retrieval_tier: 3`, `scope: memory-router`):

### Tier 1 — Canonical Durable Memory
- **Location:** `vault-main/memory/*.qmd`
- **Format:** Quarto Markdown (QMD) with YAML frontmatter
- **Authority:** High
- **Contents:** Stable facts, approved decisions, durable preferences, lasting project guidance
- **Examples:**
  - `memory/global/operating-patterns.qmd` (authority: high, created 2026-03-13) — System-wide behavioral rules
  - `memory/user/preferences.qmd` — Explicit user preferences and approved 3-strike promotions
  - `memory/projects/openclaw-dashboard.qmd` — Dashboard project memory

### Tier 2 — Episodic Memory
- **Location:** `vault-main/memory/episodic/*.qmd`
- **Purpose:** Important events, decisions, milestones
- **Authority:** Medium (event records)

### Tier 3 — Working Memory / Daily Notes
- **Location:** `vault-main/memory/YYYY-MM-DD.md` (Cal's daily notes)
- **Location:** `workspace-*/memory/YYYY-MM-DD.md` (workspace-local runtime notes)
- **Purpose:** Day-to-day working notes, captures, in-progress context
- **Promotion rule:** Workspace-local files are runtime-local unless deliberately promoted to vault-main

### Tier 4 — Session Evidence / Raw History
- **Location:** `~/.openclaw/sessions/` (160+ session directories)
- **Purpose:** Raw execution logs, tool calls, conversation history
- **Authority:** None (raw evidence only, not authoritative)

### Special Files
- `vault-main/MEMORY.md` — Short routing digest. Points to where to look. NOT a memory store itself.
- `vault-main/memory/nightly/latest.qmd` — Latest nightly digest, navigation aid

---

## Memory Retrieval Order

Per `vault-main/MEMORY.md`:
1. Canonical durable memory (`memory/*.qmd`)
2. Episodic memory (`memory/episodic/*.qmd`)
3. Working notes (`memory/YYYY-MM-DD.md`)
4. Session evidence (only when raw history explicitly needed)

---

## Memory Promotion Governance

### Behavioral Preference Promotion
- **Gatekeeper file:** `rule_strikes.json`
- **Policy:** An inferred behavioral preference must receive 3 confirmed occurrences ("strikes") before promotion to `memory/user/preferences.qmd`
- **Single-interaction inferences** are NOT promoted — they stay in working notes or are discarded
- **Cal is the only agent authorized** to approve promotion into shared production skills

### Memory Maintenance Skills
Maintenance is handled by skill files, not inline cron logic:
- `skills/memory-maintenance/SKILL.md` — daily/weekly memory maintenance
- `skills/memory-governance/SKILL.md` — preference promotion governance
- `skills/skill-extraction-review/SKILL.md` — local skill extraction
- `skills/shared-skill-promotion/SKILL.md` — cross-agent promotion

The Weekly Behavioral Governance Maintenance cron job (Cal, Sundays 18:00 ET) calls the governance skill.

### Daily Memory Audit
The prior nightly extraction flow was replaced by a daily `Daily Memory Audit` workflow. This workflow only carries forward clearly durable changes — filtering out transient session artifacts.

---

## Vector Search (Semantic Memory)

**Provider:** Local Ollama at `http://127.0.0.1:11434`
**Model:** `nomic-embed-text`
**Store:** SQLite with `sqlite-vec` extension
**Library path:** `/Users/david/.openclaw/plugins-src/opik-openclaw/node_modules/sqlite-vec-darwin-arm64/vec0.dylib`

This enables semantic search over indexed memory content. Configured in `agents.defaults.memorySearch` in `openclaw.json`.

**Requirement:** Local Ollama must be running at port 11434 for memory search to function. If local Ollama is unavailable, memory search fails.

---

## Hermes Workspace Memory

Defined in `workspace-hermes/AGENTS.md`:

- **Daily notes:** `workspace-hermes/memory/YYYY-MM-DD.md`
- **Long-term memory:** `workspace-hermes/MEMORY.md` (currently a single operational note)
- **Rule:** "Only load MEMORY.md in direct main sessions. Do not load it in shared or public contexts."
- **Session startup:** Reads today's and yesterday's memory notes automatically

Hermes memory is workspace-local, not promoted to vault-main. The CEO persona's institutional memory is maintained within the hermes workspace.

---

## Hermes App Memory (Standalone)

In `~/.hermes/`:
- **State DB:** `state.db` (5.4 MB SQLite) — session state, persistent memory
- **Memories dir:** `memories/` (6 dirs) — structured memory storage
- **Config settings:**
  - `memory_enabled: true`
  - `user_profile_enabled: true`
  - `memory_char_limit: 2200` — memory compressed beyond this
  - `user_char_limit: 1375` — user profile compressed beyond this
  - `provider: ''` — auto-selects from available providers

---

## Vicky Workspace Memory

`workspace-vicky/` contains: `SOUL.md`, `IDENTITY.md`, `AGENTS.md`, `MEMORY.md`
Memory is workspace-local. Vicky has a separate operational context from Cal.

---

## Codex Memory

`~/.codex/` maintains:
- `state_5.sqlite` — application state
- `logs_1.sqlite` — execution history (66 MB, significant history)
- `history.jsonl` — command history (30 KB)
- `shell_snapshots/` — captured shell states
- `session_index.jsonl` — index of all sessions

Codex memory is session-scoped and execution-history-focused, not knowledge-management focused.

---

## Knowledge Sources

### vault-main (Obsidian-Compatible Vault)
The vault uses PARA framework organization:
- `Projects/` — Active projects (openclaw-dashboard, business-incubator, etc.)
- `Areas/` — Life and work areas
- `Resources/` — Reference materials
- `Archives/` — Historical content
- `Capture/` — Inbox (quick captures before organization)

The vault is readable by Obsidian (`.obsidian/` config present) and by OpenClaw agents (`.clawhub/` integration config present).

### Memory File Format
QMD files use YAML frontmatter:
```yaml
---
id: global-operating-patterns
type: pattern
scope: global
status: active
tags: [cal, orchestration, workflow]
memory_type: canonical
authority: high
promotion_source: reviewed_durable
retrieval_tier: 1
created: 2026-03-13
updated: 2026-03-14
confidence: high
source: repo-policy
---
```
This metadata enables structured retrieval and authority ranking.

---

## Open Questions / Ambiguities

- How memory search (semantic/vector) integrates with the tiered file-based system is not fully documented — it's unclear if the SQLite vector store indexes all QMD files or only specific directories.
- The `promotion-queue/` directory exists but its exact usage protocol is not documented beyond the skill files.
- The `rule_strikes.json` file location is not specified in the documentation — likely in vault-main but not confirmed.
- Hermes workspace memory (`workspace-hermes/memory/`) accumulates daily notes but has no documented promotion path to long-term storage. CEO institutional memory may be lost if workspace is reset.
- Paperclip credential duplication no longer appears to be the main problem. The stronger remaining risk is secret sprawl into working docs/scripts if the workspace-local credential path is copied around casually.
- Whether the `~/.hermes/memories/` dirs are synchronized with `workspace-hermes/memory/` is unknown.
