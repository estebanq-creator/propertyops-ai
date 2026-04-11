# Technical Specification: PropertyOpsAI Owner Control Panel

Date: 2026-04-10
Status: Draft revision after implementation review
Document type: Current state + target state specification

## Purpose

This document describes the PropertyOpsAI owner control panel in two layers:

1. Current implementation observed in the codebase as of April 10, 2026
2. Target architecture for a production-ready owner review and operations surface

This distinction matters because several security, auth, and persistence controls are partially implemented or stubbed in the current build.

---

## 1. Executive Summary

The owner control panel is conceptually the secure human review surface for PropertyOpsAI. It is intended to provide:
- authenticated owner access
- review and approval workflows for consequential AI outputs
- visibility into cron, telemetry, and audit activity
- a compliant boundary between automated analysis and human authorization

Current reality:
- the main control-panel app exists and includes auth, role guard middleware, health, cron, audit, and review-queue routes
- the auth layer is still development-grade and currently accepts any non-empty credentials as an `owner`
- some review-gate data paths remain in-memory or prototype-only
- the local Mission Control fallback now carries part of the practical human review burden

Because of that, this document should not be read as a statement that production-grade identity, durability, or compliance controls are fully complete.

---

## 2. Current Implementation

### 2.1 Runtime and Stack

Observed implementation in `workspace-hermes/control-panel`:
- Framework: Next.js `16.2.2`
- Language: TypeScript
- Auth library: `next-auth` v5 beta
- Runtime model: App Router APIs + middleware-based route protection

Important note:
- Earlier planning versions of this spec described `Next.js 15+`; the current package version is Next.js 16. The document should track the code, not the original plan.

### 2.2 Authentication

Current behavior:
- credentials auth is wired through Auth.js
- any non-empty email/password pair is currently accepted
- accepted users are assigned the `owner` role in the auth callback
- session cookies are configured with stricter production settings where possible, but credential verification is still stubbed

Implication:
- the current auth layer is suitable for local development and workflow prototyping
- it is not sufficient for a real owner-facing production security boundary

### 2.3 Authorization

Current role-guard middleware exists and protects route families such as:
- `/owner`
- `/landlord`
- `/tenant`
- `/api/*`

However, the effective security posture is limited by the current auth stub. In addition, some route handlers still contain commented production checks rather than enforced access control.

Implication:
- RBAC structure exists
- RBAC assurance is not yet strong enough to describe as complete

### 2.4 Review Gate

The intended review-gate model is:
- Laura produces forensic outputs
- a human owner reviews those outputs
- approval or rejection is explicitly recorded before broader downstream use

Current reality:
- the original control-panel review queue is still prototype-grade
- a more reliable local fallback review queue now exists in Mission Control and is file-backed for local persistence
- the human review path is operational, but split across evolving surfaces rather than finalized in one production panel

### 2.5 Tunnel and Boundary Model

The intended trust boundary is:
- public or semi-public UI surface for authorized humans
- secure network path into local agent/runtime systems through Tailscale
- no direct exposure of raw local agent internals to the public internet

Current reality:
- Tailscale is actively used in the local operating model
- Paperclip and Mission Control are both being accessed through LAN and Tailscale paths during local operations
- secure networking exists operationally, but the application-level trust model should not rely on network location alone long term

---

## 3. Target Architecture

### 3.1 Security Goals

The production owner control plane should guarantee:
- real identity verification for every human user
- enforced RBAC with least-privilege defaults
- durable audit records for all consequential actions
- explicit human approval gates for regulated or high-risk workflows
- secure transport between cloud surfaces and local runtimes
- clear separation between forensic analysis, operational drafting, and execution authority

### 3.2 Target Roles

| Role | Target permissions |
|------|--------------------|
| owner | Full review, approval, audit, cron, system configuration |
| admin | Operational review and audit access without owner-only system controls |
| viewer | Read-only operational visibility |

Important note:
- these roles are still target-state definitions, not fully proven current-state controls

### 3.3 Target Review Flow

1. Intake or agent output is generated
2. Output is classified by risk and workflow type
3. Consequential items enter an owner/admin review queue
4. Human reviewer approves, rejects, or escalates
5. Decision is durably logged with actor, timestamp, rationale, and artifact reference
6. Only approved outputs advance to downstream delivery or execution

### 3.4 Target Persistence Requirements

Production acceptance requires moving beyond in-memory state for critical workflows:
- auth/session events should be auditable
- review decisions should be durable across restart and redeploy
- audit logs should be append-only and verifiable
- approval history should be queryable by actor, object, and date range

### 3.5 Target Trust Boundary

The production trust model should be described as:
- identity first
- network hardening second
- application authorization third
- auditability across every state-changing action

Tailscale remains a good network control, but it should complement rather than replace application authentication and authorization.

---

## 4. Known Gaps

These items should remain explicit in the spec until closed:

1. Auth is stubbed
- Any non-empty credentials currently authenticate as owner.

2. Some compliance-sensitive routes still rely on comments or implied future enforcement
- Example: prototype review-queue owner checks.

3. Review surfaces are split
- The control-panel concept exists, but local Mission Control currently provides part of the practical fallback workflow.

4. Persistence is inconsistent
- Some control-plane features are durable enough for local workflow support, but not yet at a production governance standard.

5. Production readiness language is ahead of implementation in older versions of this document
- This revision intentionally tones that down.

---

## 5. Revision Guidance

This spec should be updated again when the following are complete:
- real credential verification or SSO
- enforced role mapping from a real identity source
- durable review-decision storage
- unified review surface
- durable audit chain and retention implementation
- explicit documentation of which workflows are production-allowed versus prototype-only

---

## 6. Summary

The owner control panel remains the right architectural direction, but it should currently be described as an evolving control surface rather than a completed secure production system.

The most important revision principle is simple:
- describe current controls honestly
- describe target controls clearly
- do not blur the line between the two
