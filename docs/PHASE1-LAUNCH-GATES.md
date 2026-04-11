# PropertyOps AI — Phase 1 Launch Gate Checklist

**Document Type:** Go/No-Go Gate Checklist  
**Created:** April 11, 2026  
**Owner:** Hermes (CEO)  
**Status:** 🟡 In Progress — Laura pilot gates partially complete; Tony and billing gates deferred

---

## Purpose

This document defines the explicit go/no-go criteria that must pass before each phase transition. No phase advances without CEO sign-off on all gates in that phase.

---

## Gate 1: Laura Pilot → General Availability

**Prerequisite:** 50/50 CEO-validated reports completed, all five pilot landlords active.

### 1.1 Compliance Gates

| Gate | Criteria | Status | Evidence |
|------|---------|--------|---------|
| **Fair Housing counsel review** | Outside counsel has reviewed Laura's output format, disclaimer language, and "document integrity concern" framing. Written sign-off received. | ⏳ Pending | Counsel engagement letter + sign-off memo |
| **FTC FCRA compliance** | Laura outputs do not constitute a "consumer report" under FCRA. Counsel has confirmed or provided guidance on how to maintain this. | ⏳ Pending | Counsel memo or signed opinion |
| **Zero prohibited language** | QA scan of all 50 pilot reports confirms no scoring, verdicts, risk levels, pass/fail language, or Fair Housing-triggerable classifications. | ✅ Complete | QA compliance scan log |
| **Disclaimer present on all reports** | Fixed footer legal disclaimer appears on every Laura output page; cannot be hidden. | ✅ Complete | UI audit screenshot |
| **Application intake fee jurisdictional review** | For each pilot market: confirmed that $15–35 intake fee is permitted or documented which jurisdictions it must be waived. | ⏳ Pending | Jurisdiction checklist per pilot landlord |

### 1.2 Product Accuracy Gates

| Gate | Criteria | Status | Evidence |
|------|---------|--------|---------|
| **False positive rate** | <5% false positive rate across 50 validated reports. (False positive = Laura flagged a genuine document as anomalous.) | ⏳ In Progress | Report accuracy log |
| **False negative rate** | David has reviewed all 50 reports and confirmed no known fraudulent documents escaped detection. | ⏳ In Progress | CEO review log |
| **Review-time baseline captured** | At least 3/5 pilot landlords have provided baseline review-time data (pre-Laura). Required for 40% reduction KPI measurement. | ⏳ Pending | Baseline capture log per account |

### 1.3 Commercial Gates

| Gate | Criteria | Status | Evidence |
|------|---------|--------|---------|
| **Customer agreement template** | Standard pilot agreement reviewed by counsel. Contains: IP ownership, data handling, no-verdict disclaimer, termination clause. | ⏳ Pending | Signed template on file |
| **Manual billing process validated** | At least 3/5 pilot landlords have paid at least one invoice. Payment recorded in Mercury. Reconciliation log current. | ⏳ Pending | Mercury reconciliation log |
| **Data handling documented** | Document explaining what tenant PII is collected, retained, and how it is deleted. Shared with at least 1 pilot landlord. | ⏳ Pending | Data handling summary doc |

### 1.4 Operational Gates

| Gate | Criteria | Status | Evidence |
|------|---------|--------|---------|
| **CEO review gate 50/50** | All 50 initial reports reviewed and approved by David. Counter shows 50/50 in Mission Control. | ⏳ In Progress | Mission Control counter screenshot |
| **Onboarding call completed** | All 5 pilot landlords have completed onboarding call with David. | ⏳ Pending | Onboarding log |
| **Pilot health check protocol active** | PHASE0-PROTOCOLS.md Day 14 and Day 30 checkpoints have been scheduled. | ✅ Complete | PHASE0-PROTOCOLS.md |

---

## Gate 2: Tony Closed Beta Entry

**Prerequisite:** Gate 1 fully passed.

| Gate | Criteria | Status | Evidence |
|------|---------|--------|---------|
| **Laura pilot completed** | 50/50 reports validated, <5% false positive rate. | ⏳ Depends on Gate 1 | Gate 1 evidence |
| **Compliance audit passed** | Zero Fair Housing violations found in Laura pilot outputs. | ⏳ Depends on Gate 1 | QA audit log |
| **Manual billing validated** | 3+ pilot landlords have paid invoices. | ⏳ Depends on Gate 1 | Mercury log |
| **Tony Emergency Taxonomy confirmed** | All 8 emergency categories (fire, smoke, gas, flood, power loss, broken exterior lock, sewage, structural breach) reliably trigger RED escalation in test suite. | ⏳ Pending | Test suite results |
| **Tony draft-only UI confirmed** | No autonomous send button in any tenant-facing UI. Only "Submit for Approval" action present. | ✅ Complete | UI audit screenshot |
| **One-click approval in Mission Control** | CEO approve/reject actions functional with audit trail (userId + timestamp). | ✅ Complete | Mission Control screenshot |
| **Habitability escalation tested** | 10 test habitability messages classified correctly as RED. | ⏳ Pending | Test results |
| **Beta landlord agreement** | Closed beta agreement addendum covers Tony-specific scope. | ⏳ Pending | Agreement template |

---

## Gate 3: Billing Automation (Phase 3)

**Prerequisite:** Gate 2 passed. 6+ months of manual billing data.

| Gate | Criteria | Status | Evidence |
|------|---------|--------|---------|
| **Pricing validated** | 3+ months of paying pilots confirms tier pricing is accepted. No significant pricing objections. | ⏳ Deferred | Billing history |
| **Stripe integration tested** | Subscription creation, invoice generation, dunning tested in Stripe test mode. | ⏳ Deferred | Test mode logs |
| **Tax handling confirmed** | Tax calculation and remittance approach reviewed with accountant. | ⏳ Deferred | Accountant sign-off |
| **Migration plan for Phase 0 accounts** | Revenue has documented migration path from manual → Stripe for each pilot account. | ⏳ Deferred | Migration plan doc |
| **Failed payment handling** | Dunning sequence defined and tested. Customer communication templates approved. | ⏳ Deferred | Dunning runbook |

---

## Gate 4: Controlled Autonomy (Phase 4)

**Prerequisite:** Gates 1–3 passed. Compliance baseline established.

| Gate | Criteria | Status | Evidence |
|------|---------|--------|---------|
| **Tony calibrated confidence at 95%** | Empirical accuracy rate on production drafts ≥95% against expert review baseline. | ⏳ Deferred | Accuracy measurement log |
| **Anti-automation-bias UI** | Mission Control UI makes it easy to reject or edit, hard to rubber-stamp. UX review passed. | ⏳ Deferred | UX audit |
| **Compliance audit — autonomous scope** | Outside counsel has reviewed autonomous sending scope and approved. | ⏳ Deferred | Counsel sign-off |
| **CEO explicit authorization per landlord** | Each landlord individually opts in to autonomous mode. No default enrollment. | ⏳ Deferred | Opt-in records |

---

## Sign-Off Record

| Gate | Passed By | Date | Notes |
|------|----------|------|-------|
| Gate 1 — Laura GA | David | | |
| Gate 2 — Tony Closed Beta | David | | |
| Gate 3 — Billing Automation | David | | |
| Gate 4 — Controlled Autonomy | David | | |

---

## Document Maintenance

**Update this document when:**
- Any gate status changes (pending → complete or failed)
- New compliance requirements are identified
- Gate criteria are revised by CEO decision

**This document is referenced by:**
- `docs/LAUNCH-DECISION.md` — overall GTM sequence
- `docs/LAURA-PILOT-READINESS.md` — Laura-specific readiness detail
- `agents/ceo/PHASE0-PROTOCOLS.md` — Phase 0 KPI and checkpoint protocols

---

**Approved By:** Hermes (CEO)  
**Date:** April 11, 2026  
**Next Review:** After 10/50 Laura pilot reports validated
