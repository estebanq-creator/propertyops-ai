# PropertyOps AI — Launch Documentation Index

**Created:** April 9, 2026  
**Owner:** Hermes (CEO)  
**Purpose:** Single entry point for all launch-related documentation

---

## Quick Reference

**What ships first?** → Laura Pilot  
**Tony status?** → Closed Beta (Draft-Only)  
**Billing?** → Manual for pilots  
**Canonical answer:** `LAUNCH-DECISION.md`

---

## Core Launch Documents

| Document | Purpose | Status |
|----------|---------|--------|
| **[LAUNCH-DECISION.md](./LAUNCH-DECISION.md)** | **Canonical source of truth** — what ships, when, why | ✅ Decided |
| **[LAURA-PILOT-READINESS.md](./LAURA-PILOT-READINESS.md)** | Operational checklist — smoke tests, manual ops, compliance | ✅ Ready |
| **[MANUAL-BILLING-PILOT.md](./MANUAL-BILLING-PILOT.md)** | Invoicing workflow — pricing, cadence, reconciliation | ✅ Ready |
| **[LAUNCH-MESSAGING.md](./LAUNCH-MESSAGING.md)** | Reusable templates — email, deck, social, FAQ | ✅ Ready |

---

## Supporting Documents (Updated)

| Document | Location | Update Summary |
|----------|----------|----------------|
| Business Plan v4.4 | `../../business-planning/PropertyOps_AI_Executive_Business_Plan_v4.4.md` | Added GTM sequence status, manual billing rationale, LAUNCH-DECISION reference |
| Control Panel README | `../control-panel/README.md` | Updated status to distinguish Engineering vs GTM phases, added LAUNCH-DECISION reference |
| Control Panel Roadmap | `./control-panel-roadmap.md` | Clarified engineering ≠ GTM sequence, updated Phase 1 status to Complete |
| Laura Portal Status | `../control-panel/LAURA-PORTAL-STATUS.md` | Updated to PILOT-READY, added readiness checklist reference |
| Tony Portal Status | `../control-panel/TONY-PORTAL-STATUS.md` | Updated to CLOSED BETA, added LAUNCH-DECISION reference |
| Phase 1 Complete Memo | `../memory/2026-04-07-phase1-complete.md` | Clarified Engineering Phase 1 ≠ GTM Phase 1 |

---

## Decision Summary

### GTM Sequence

| Phase | Product | Status | Constraints |
|-------|---------|--------|-------------|
| Phase 1 | Laura Pilot | ✅ Pilot-Ready | 5 landlords, 50-report review gate, manual billing |
| Phase 2 | Tony Closed Beta | 🟡 Draft-Only | Opens after Laura validation, CEO approval required |
| Phase 3 | Billing Automation | ⏳ Deferred | Manual sufficient until >10 landlords or >$5K MRR |
| Phase 4 | Controlled Autonomy | ⏳ Deferred | Requires trust + compliance + data gates |

### Engineering vs. GTM

**Critical Distinction:** Engineering roadmap phases (control panel) are NOT the same as GTM product release phases.

- **Engineering** can build Phase 2-4 features while **GTM** releases only Phase 1
- Control panel roadmap enables Laura/Tony features; it does not dictate what ships to customers
- See `control-panel-roadmap.md` for engineering timeline

---

## Launch Recommendation

**Status:** ✅ GO — with constraints

**Constraints:**
- 5 pilot landlords maximum (Phase 1)
- CEO review gate active (first 50 reports)
- Manual invoicing only (no automated billing)
- Tony remains draft-only (no autonomous sending)
- Weekly compliance scans required

**Blockers:** None — all launch blockers resolved

**See:** `LAURA-PILOT-READINESS.md` for detailed readiness checklist

---

## Next Actions

| Action | Owner | Timeline |
|--------|-------|----------|
| Review and approve LAUNCH-DECISION.md | David (CEO) | Immediate |
| Approve pilot pricing structure | David (CEO) | Before first onboarding |
| Select 5 pilot landlords | David (CEO) | This week |
| Begin Laura pilot onboarding | David + Hermes | Within 48 hours of approval |
| Validate first 50 reports (review gate) | David (CEO) | Ongoing (6-8 weeks) |
| Tony beta planning | Hermes | After 25/50 reports validated |

---

## Document Maintenance

**Update Triggers:**
- Laura pilot completes (50/50 validated)
- Tony enters closed beta
- Automated billing launches
- Any GTM sequence change (CEO approval required)

**Review Cadence:** Weekly during pilot phase

**Canonical Location:** `~/.openclaw/workspace-hermes/docs/`

---

**Approved By:** ⬜ David (CEO)  
**Date:** April 9, 2026  
**Product Lead:** Hermes (✅)
