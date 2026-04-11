# Hermes Memory Promotion Protocol

This protocol defines how CEO workspace notes become durable memory without bypassing the canonical memory authority model.

Use this together with:

- `/Users/david/.openclaw/vault-main/memory/Memory-Architecture.qmd`
- `/Users/david/.openclaw/vault-main/memory/promotion-queue/README.md`
- `/Users/david/.openclaw/vault-main/System/Bin/Ops/openclaw_memory_promote.py`

## Why this exists

Hermes workspace notes are useful, but they are not durable canonical memory by themselves.

Without an explicit promotion path:

- important CEO decisions can stay trapped in workspace-local notes
- continuity depends on session recall instead of reviewed memory
- future agents can miss durable company guidance

That is a continuity and governance risk.

## Authority Boundary

Hermes workspace memory is working memory.

Primary Hermes working-memory locations:

- `/Users/david/.openclaw/workspace-hermes/memory/YYYY-MM-DD.md`
- other dated workspace notes under `/Users/david/.openclaw/workspace-hermes/memory/`

Canonical durable memory remains:

- `/Users/david/.openclaw/vault-main/memory/**/*.qmd`
- approved episodic notes under `/Users/david/.openclaw/vault-main/memory/episodic/`
- approved daily briefs under `/Users/david/.openclaw/vault-main/memory/daily-briefs/`

Hermes must not treat workspace notes or session logs as canonical truth unless they are explicitly promoted into the repo memory system.

## Promotion Rule

Use this path:

1. Capture the event, decision, or lesson in Hermes workspace memory.
2. Decide whether it is:
   - working-only
   - episodic
   - a durable promotion candidate
3. If it is a durable candidate, create a proposal in the canonical promotion queue.
4. Cal or the approved memory-governance path reviews the proposal.
5. Only after approval does the durable write land in canonical memory.

Creating a proposal is allowed.
Writing canonical memory directly from Hermes is not the default path.

## What Should Be Promoted

Promote when a Hermes note contains durable truth such as:

- a stable operating decision
- approved workflow or escalation guidance
- recurring risk or failure pattern that should shape future behavior
- durable project direction that should survive session loss
- a cross-agent operating lesson with lasting value

## What Should Not Be Promoted

Do not promote:

- raw brainstorms
- one-off status chatter
- incomplete or disputed conclusions
- notes that are only useful for the current task window
- inferred preference/rule changes that still need strike or approval governance

For stable preference or behavior rules, preserve the existing strike and approval flow before any canonical write.

## Required Evidence

A promotion candidate should point back to evidence whenever possible:

- the Hermes note path
- linked Paperclip issue, project, or goal
- relevant artifact paths
- key decision or risk summary
- suggested durable target area

## Target Hints

Use these target hints when proposing promotion:

- `memory/global/*.qmd` for operating patterns, governance, or reusable system guidance
- `memory/projects/*.qmd` for project- or initiative-specific durable state
- `memory/episodic/*.qmd` for dated incidents or meaningful event history
- `memory/user/*.qmd` only when the existing governance path allows preference promotion

## Standard Workflow

### A. During normal CEO work

1. Record important decisions in a Hermes workspace note.
2. Link the note to the active Paperclip issue when applicable.
3. If the decision looks durable, mark it as a promotion candidate inside the note with a short heading such as `Promotion Candidate`.

### B. At handoff, heartbeat, or end-of-day review

Review the latest Hermes notes and ask:

- would this matter if today’s workspace were lost?
- should another agent know this next week?
- does this change durable operating behavior?

If yes, create a promotion proposal.

## Proposal Creation

Use the memory-promotion CLI.

Example:

```bash
python3 /Users/david/.openclaw/vault-main/System/Bin/Ops/openclaw_memory_promote.py create \
  --agent hermes \
  --job-id manual-2026-04-10-hermes-memory-review \
  --scope project \
  --summary "Approved CEO workflow change for PropertyOps launch gating" \
  --details "Derived from Hermes daily note and linked Paperclip decision trail." \
  --target-hint /Users/david/.openclaw/vault-main/memory/projects/openclaw-dashboard.qmd \
  --evidence-path /Users/david/.openclaw/workspace-hermes/memory/2026-04-10.md
```

Notes:

- `job_id` may be a real bridge/run id or a manual review id when the source is a workspace note
- proposal creation does not mutate canonical memory
- the proposal is written under `/Users/david/.openclaw/vault-main/memory/promotion-queue/proposals/`

## Review and Promotion

Hermes may propose.
Cal reviews.

Expected statuses:

- `proposed`
- `approved`
- `rejected`
- `promoted`

Only an approved promotion should become a canonical durable write.

## Heartbeat Requirement

During Hermes heartbeat or periodic executive review:

- check recent workspace notes for durable decisions older than 24 hours with no promotion outcome
- if a durable item exists, create a proposal or explicitly note why it remains working memory only

This keeps CEO memory from stalling in the workspace layer.

## Continuity Requirement

If Hermes is carrying an initiative-level decision that would materially affect:

- roadmap
- compliance posture
- delegation model
- customer communication
- approval workflow

then that decision must not live only in workspace memory.

It should either:

- be promoted into the queue
- be written into an approved episodic note
- or be explicitly documented as temporary and non-durable

## Non-Goal

This protocol does not make Hermes a canonical memory writer of last resort.

Its purpose is to create a reliable bridge from CEO working notes into the governed Cal memory system.
