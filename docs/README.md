# Documentation Guide

Date: 2026-04-10
Purpose: quick guide to the current architecture, spec, and operations docs

## How To Read These Docs

The docs in this system now fall into three buckets:

1. Current state / observed map
- describes what is actually running or configured today
- may include ambiguities and temporary fallback surfaces

2. Target state / design intent
- describes where the system is supposed to go
- should not be read as proof that the implementation is already there

3. Workflow / operating policy
- describes how humans and agents are expected to work together
- may remain valid even when the exact UI surface changes

When in doubt:
- trust current-state docs for what exists now
- trust workflow docs for required human-review behavior
- treat target-state docs as directional until the implementation catches up

---

## Start Here

### For the live system map
- `workspace-main/projects/business-planning/Configuration/Systems/ARCHITECTURE.md`

Best for:
- understanding layers, control surfaces, routing, and current ambiguities

### For owner control-plane intent and gaps
- `workspace-hermes/docs/control-panel-spec.md`

Best for:
- understanding current state versus target state for the owner control panel

### For Mission Control operations surfaces
- `workspace-main/projects/mission-control/docs/OPERATIONS_VIEW.md`
- `workspace-main/projects/mission-control/docs/TELEMETRY_API.md`

Best for:
- understanding which local Mission Control features are prototype, which are useful today, and what still needs hardening

### For human-in-the-loop workflow expectations
- `workspace-hermes/docs/2026-04-02-ope-2-org-structure-hitl-workflow.md`

Best for:
- understanding why human review exists and how it should function even when the preferred review surface changes

### For PRO-28 compliance-oriented safeguards
- `workspace-hermes/control-panel/PRO-28-COMPLIANCE-REPORT.md`
- `workspace-hermes/control-panel/PRO-28-STATUS.md`

Best for:
- understanding what safeguards were implemented and what claims should still be treated cautiously

---

## Practical Source Of Truth Guide

If you are asking one of these questions, start here:

- `What is actually running today?`
  Start with `ARCHITECTURE.md`

- `What is the current review fallback for human approvals?`
  Start with `OPERATIONS_VIEW.md` and then `2026-04-02-ope-2-org-structure-hitl-workflow.md`

- `Is this control already production-ready?`
  Check whether the doc explicitly says current state, prototype, or target state. If it does not, assume it needs verification.

- `What should we say externally about compliance or security?`
  Start with `PRO-28-COMPLIANCE-REPORT.md` and prefer the revised cautious wording.

- `What was the intended design of the owner review plane?`
  Start with `control-panel-spec.md`

---

## Notes On Reliability

As of April 10, 2026:
- local Mission Control is the most dependable fallback review surface for Phase 4 style human review work
- some control-plane concepts are still split across Paperclip, Control Panel, and Mission Control
- some docs describe target architecture while others describe observed current state
- the revised docs should now make that distinction much clearer than before

---

## Maintenance Rule

When updating docs in this area:
- label whether the document is current state, target state, or workflow policy
- avoid unqualified words like `secure`, `compliant`, `immutable`, or `production-ready` unless the implementation truly supports them
- if a fallback surface becomes the practical standard, note that explicitly instead of pretending the intended surface is already authoritative
