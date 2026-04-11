# Operations View & Audit Log - Implementation Guide

Date: 2026-04-10
Status: Prototype implementation guide with production notes

## Overview

This document describes the Mission Control operations surfaces intended to support:
- audit visibility
- cron visibility and management
- human review accountability
- operational memory for later improvement

This revision is intentionally explicit about the difference between:
- what exists today in local Mission Control
- what is still required for production-grade operations and compliance use

---

## 1. Current State

Mission Control currently includes:
- an audit API surface
- a cron API surface
- telemetry/health routes
- a local file-backed review queue for Phase 4 fallback review work
- lightweight local review pages such as Review Queue, Review Inbox, and Review Brief

Important limitations:
- there is no application auth layer in the local Mission Control app today
- the audit store is currently in-memory
- the cron store is currently in-memory
- the review queue is more durable than the audit/cron stores because it is file-backed, but it is still a local operational fallback rather than a finalized production workflow

Because of that, this app should currently be described as a local operator console / prototype Mission Control surface.

---

## 2. Audit Log View

### What Exists

The current audit implementation provides:
- queryable API shape
- structured entries
- hash-chain semantics in application memory
- retention metadata in responses

### What It Does Well

- gives the system a consistent event model
- supports filtering and operational inspection
- creates a good foundation for a future audit viewer

### What Is Not Yet True

The current implementation should not be described as fully tamper-evident or compliance-grade because:
- entries are stored in memory
- restart/redeploy durability is not guaranteed
- the hash chain is meaningful inside process memory, but not sufficient by itself for durable forensic assurance

Recommended wording:
- `Mission Control includes a prototype audit-log service with hash-chain semantics that should later be backed by durable append-only storage.`

---

## 3. Cron Job Manager

### What Exists

The current cron API provides:
- list/read behavior for locally modeled jobs
- create behavior for the in-app cron model
- aggregate stats from an in-memory store

### What It Does Well

- gives a clean contract for a future cron management UI
- helps shape how job metadata and execution history should be represented

### What Is Not Yet True

The current Mission Control cron manager is not the same as the real OpenClaw cron system:
- Mission Control uses an in-memory store for its local prototype
- the real operating cron system lives in OpenClaw job configuration on the machine
- changes made through the local prototype do not automatically equal authoritative changes in the live OpenClaw scheduler unless explicitly wired through

Recommended wording:
- `The current cron manager is a prototype interface and contract layer, not yet the authoritative source of truth for all live scheduled jobs.`

---

## 4. Human Review and Review Gate Support

### What Exists

Mission Control now provides a practical local fallback for Phase 4 review work:
- `/review-queue`
- `/review-inbox`
- `/review-brief`
- file-backed queue state in `data/review-queue.json`

This is useful because it gives humans a working local approval surface while the broader PropertyOps/portal workflow is still being stabilized.

### Limits of the Current Review Surface

- it is local-first, not a finalized multi-user production workflow
- it is not yet integrated with full identity, role, and approval provenance controls
- it should be treated as an operational fallback and iteration surface

Recommended wording:
- `Mission Control currently serves as the most reliable local fallback for Phase 4 human review, but it is not yet the final production review system.`

---

## 5. Production Requirements Still Outstanding

To describe Operations View as production-ready, the system still needs:
- real auth and RBAC in local or deployed Mission Control
- durable audit storage
- durable cron history and authoritative scheduler integration
- explicit source-of-truth rules between OpenClaw runtime state and Mission Control state
- retention and export policy documentation
- stronger approval provenance for human decisions

---

## 6. Recommended Language for Future Docs

Prefer:
- `prototype operations surface`
- `local fallback review queue`
- `durable storage planned`
- `contract and UI foundation`
- `current state versus target state`

Avoid for now:
- `tamper-evident` as an unqualified production claim
- `compliant audit trail` as an unqualified production claim
- `full cron management` if the source of truth is still elsewhere

---

## 7. Bottom Line

The Operations View work is valuable and worth keeping.

What needs revision is not the direction, but the framing:
- audit and cron are promising prototypes
- the review queue is a practical and currently useful fallback
- the document should describe these as stepping stones toward production operations, not as already-finished governance infrastructure
