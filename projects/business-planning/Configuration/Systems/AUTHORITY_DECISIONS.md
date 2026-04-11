# AUTHORITY_DECISIONS.md

**Purpose:** Resolve "which system is authoritative?" ambiguity for actively used PropertyOps and OpenClaw surfaces.
**Status:** Active decision record
**Date:** April 10, 2026
**Scope:** Hermes runtime, PropertyOps control panel, Paperclip runtime and credential authority, and system-doc authority

---

## Why This Exists

Several environment reviews identified split-brain risk in places where multiple systems or copies exist at the same time.

The goal of this document is to state, explicitly and operationally:

- which path is authoritative
- which path is legacy, support-only, or reference-only
- what should be used during incidents
- what should not be treated as production authority

This is an operational decision record, not a historical inventory.

---

## Decision Summary

### 1. System Documentation Authority

**Authoritative docs path:**

- `/Users/david/.openclaw/workspace-main/projects/business-planning/Configuration/Systems/`

**Not authoritative:**

- `/Users/david/system-docs/`

**Operational rule:**

- treat `~/system-docs/` as stale export or working-copy space unless explicitly refreshed
- all new system decisions should be recorded in the business-planning workspace docs

---

### 2. Hermes Runtime Authority

**Authoritative operational Hermes path:**

- `/Users/david/.openclaw/workspace-hermes/`

**Associated control plane:**

- `/Users/david/.openclaw/openclaw.json`
- OpenClaw agent `hermes`

**Non-authoritative for normal PropertyOps operations:**

- `/Users/david/.hermes/`

**Interpretation of `~/.hermes/`:**

- standalone Hermes app state
- useful for standalone testing, provider experiments, or vendor-specific runtime configuration
- not the canonical PropertyOps operating workspace

**Operational rule:**

- when a workflow question concerns PropertyOps behavior, startup, agent instructions, memory, Paperclip delegation, or control-panel implementation, use `workspace-hermes/`
- do not treat `~/.hermes/` as the source of truth for PropertyOps operating policy
- if the standalone Hermes app is intentionally used, that use should be treated as an exception path and documented explicitly

**Incident owner default:**

- OpenClaw / workspace-hermes owner path first
- standalone Hermes app only if the incident is clearly isolated to `~/.hermes/`

---

### 3. PropertyOps Control Panel Authority

**Authoritative PropertyOps control panel path:**

- `/Users/david/.openclaw/workspace-hermes/control-panel/`

**Non-authoritative for current PropertyOps operations:**

- `/Users/david/Documents/mission-control/`

**Interpretation of `~/Documents/mission-control/`:**

- separate application lineage
- may remain valuable as historical reference, architecture inspiration, or legacy implementation material
- should not be treated as the current PropertyOps production control plane unless explicitly re-designated

**Operational rule:**

- for current PropertyOps dashboard, RBAC, Laura/Tony portal work, and compliance workflow changes, use `workspace-hermes/control-panel/`
- do not assume feature parity or state continuity with `Documents/mission-control/`
- if `mission-control/` is kept, its role should be reference/legacy unless reactivated by an explicit decision

**Incident owner default:**

- `workspace-hermes/control-panel/` first

---

### 4. Paperclip Runtime Authority

**Authoritative active Paperclip service:**

- `~/.paperclip/instances/default/`
- local API at `http://127.0.0.1:3100/api`

**Current runtime note:**

- `~/.paperclip/context.json` currently points to `currentProfile: "default"`
- live health and access logs during this review were consistent with the `default` instance being the board actually serving PropertyOps traffic

**Secondary / non-authoritative for current operations:**

- `~/.paperclip/instances/openclaw-local/`

**Interpretation of `openclaw-local`:**

- secondary integration profile
- potentially useful for local experimentation or future redesign
- not the current authoritative Paperclip board runtime unless explicitly re-designated

**Operational rule:**

- when troubleshooting live Paperclip board behavior, auth callbacks, logs, or server health, inspect `instances/default/` first
- do not assume `openclaw-local` is the active runtime just because it references OpenClaw
- keep `context.json` on `default` unless the runtime itself is intentionally migrated

**Incident owner default:**

- `instances/default/` first

---

### 5. Paperclip Credential Authority

**Authoritative current credential path:**

- `/Users/david/.openclaw/workspace-hermes/paperclip-api-key.json`

**Current state note:**

- earlier reviews flagged a duplicate copy under `vault-main`
- as of this decision record, that duplicate was not present in the live filesystem check

**Operational rule:**

- treat `workspace-hermes/paperclip-api-key.json` as the current source of truth
- do not recreate duplicate copies in `vault-main` or other workspaces
- treat the token as company-scoped to the active PropertyOps company, not as a global Paperclip admin token
- longer-term preferred end state is a single centralized credential source or environment-variable flow, but that is a future hardening step, not the current authority record

**Incident owner default:**

- workspace-hermes path first

---

## Incident Routing Rules

Use these defaults unless the evidence clearly points elsewhere:

- Hermes workflow / startup / Paperclip delegation issue:
  - `/Users/david/.openclaw/workspace-hermes/`
- PropertyOps UI / control-panel issue:
  - `/Users/david/.openclaw/workspace-hermes/control-panel/`
- Standalone Hermes vendor/runtime issue:
  - `/Users/david/.hermes/`
- System-doc question:
  - `/Users/david/.openclaw/workspace-main/projects/business-planning/Configuration/Systems/`

---

## What This Resolves

This record resolves the following ambiguities for operational use:

- the active PropertyOps Hermes authority is the OpenClaw `workspace-hermes` system, not the standalone Hermes app
- the active PropertyOps control panel is the Next.js app in `workspace-hermes/control-panel`
- the active Paperclip credential file is the workspace-hermes copy
- the active Paperclip board runtime is the `default` instance on port `3100`
- the active system documentation source is the business-planning workspace docs

---

## What This Does Not Do

This record does not:

- delete legacy paths
- migrate credentials
- disable the standalone Hermes app
- archive `Documents/mission-control/`

It only establishes authority so future work and incident response stop guessing.

---

## Follow-Up Actions

Recommended next steps:

1. Update `RISKS_AND_GAPS.md` so the Paperclip duplicate-key item is marked resolved or downgraded.
2. Add a short pointer in `EXECUTIVE_SUMMARY.md` and `DIRECTORY_MAP.md` to this file.
3. Decide whether `Documents/mission-control/` should be archived formally.
4. Decide whether `~/.hermes/` should remain available for standalone use or be explicitly labeled as non-production.
