# PropertyOps AI — Launch Decision Document

**Document Type:** Canonical Source of Truth  
**Created:** April 9, 2026  
**Owner:** Hermes (CEO)  
**Status:** ✅ DECIDED — Execute as written  

---

## One-Sentence Answer

**Laura ships first as a pilot product; Tony is closed beta only; billing is manual for early pilots.**

---

## Product Release Sequence (GTM)

This is the go-to-market sequence — what customers actually receive and when.

| Phase | Product | Audience | Status | Description |
|-------|---------|----------|--------|-------------|
| **Phase 1** | Laura Portal | 5 pilot landlords | ✅ Pilot-Ready | Forensic document integrity analysis for tenant onboarding. Human-reviewed. No scoring, no screening recommendations. |
| **Phase 2** | Tony Portal | Closed beta (test tenants) | 🟡 Draft-Only | Maintenance request drafting with CEO approval required. No autonomous sending. Habitability issues flagged RED. |
| **Phase 3** | Billing & Onboarding | General availability | ⏳ Deferred | Automated billing, self-serve onboarding, subscription management. |
| **Phase 4** | Controlled Autonomy | Validated pilots only | ⏳ Deferred | Gated autonomy after compliance, trust, and operating data thresholds met. |

**Key Principle:** GTM phases are not the same as engineering roadmap phases. Engineering can build Phase 2-4 features while GTM releases only Phase 1.

---

## What Ships First: Laura Pilot

### Product Definition

**Laura Portal** = Forensic Document Integrity Analysis for landlord tenant onboarding.

**What Laura Does:**
- Analyzes pay stubs, bank statements, and application documents
- Flags anomalies with evidence citations (specific document sections)
- Provides "document integrity concern" alerts for human review
- Operates strictly in forensic mode — no verdicts, no scores

**What Laura Does NOT Do:**
- ❌ Tenant screening or credit scoring
- ❌ Pass/Fail or Approved/Rejected verdicts
- ❌ Eviction recommendations
- ❌ Risk scores or risk levels
- ❌ Any language that could trigger Fair Housing classification

### Pilot Configuration

| Parameter | Value |
|-----------|-------|
| **First Pilot Landlords** | 5 landlords (TBD) |
| **Review Gate** | First 50 reports require CEO approval before landlord visibility |
| **Counter** | Visible "X/50 reports validated" in owner interface |
| **Legal Disclaimer** | Fixed footer on every page (cannot be hidden) |
| **Pricing** | Manual invoicing / founder-led contracts |
| **Billing Status** | Not a Phase 1 blocker |

### Laura Pilot Readiness Status

| Component | Status | Notes |
|-----------|--------|-------|
| Laura Portal Dashboard | ✅ Complete | Forensic-only interface |
| Review Gate (50 reports) | ✅ Complete | CEO approval workflow |
| Legal Disclaimer Component | ✅ Complete | On every page |
| API Endpoints | ✅ Complete | Approve/reject with audit trail |
| Seed Data (5 landlords) | ✅ Complete | ~50 sample reports |
| QA Compliance Validation | ✅ Complete | Zero prohibited language |
| Compliance Tests | ✅ Complete | Fair Housing, FTC FCRA |

**Laura is pilot-ready.** See `LAURA-PILOT-READINESS.md` for detailed checklist.

---

## Tony Beta Framing

### Current Status: Closed Beta / Draft-Only

Tony is **NOT** general availability. Tony is **NOT** the first shipped product.

**Tony Portal** = Draft-only tenant maintenance messaging interface.

### Three Non-Negotiable Constraints

1. **Draft-Only Interface** 🔒
   - Tenants have ZERO autonomous send authority
   - No "Send" button in tenant UI
   - Only "Submit for Approval" action available
   - Messages saved as drafts until CEO approval

2. **One-Click Approval Workflow** ✓
   - All tenant message drafts appear in CEO Mission Control
   - One-click approve/reject actions
   - Audit trail: CEO userId + timestamp
   - Only approved messages visible to landlord

3. **Habitability Escalation** 🚨
   - Any message classified as habitability issue flagged RED
   - Bypasses to CEO for immediate personal review
   - Habitability classifications: no heat, no water, electrical hazards, gas leaks, structural damage, pest infestations, mold, security breaches

### When Tony Ships

Tony enters closed beta **after** Laura pilot validation (post-50 reports).

**Beta Criteria:**
- ✅ Laura pilot completed with <5% false positive rate
- ✅ CEO review gate bypassed (50/50 validated)
- ✅ Compliance audit passed (zero Fair Housing violations)
- ✅ Manual billing process validated with 3+ paying pilots

---

## Billing: Manual for Pilots

### Why Billing Is Not a Phase 1 Blocker

1. **Pilot Scale:** First 5 landlords = manageable manual invoicing
2. **Founder-Led Sales:** Early pilots require high-touch onboarding anyway
3. **Price Validation:** Manual process allows pricing iteration before automation
4. **No Engineering Risk:** Billing can be built in parallel without blocking Laura launch

### Manual Billing Process

| Step | Action | Owner |
|------|--------|-------|
| 1 | Pilot agreement signed (founder-led contract) | David |
| 2 | Monthly invoice generated manually | David |
| 3 | Payment via Stripe payment link or bank transfer | Landlord |
| 4 | Payment recorded in Mercury manually | David |
| 5 | Monthly P&L prepared manually | David |

### What Is Billed Manually

- Pilot subscription fees ($199-799/mo depending on tier)
- Application fees ($15-35/application)
- Any overage or custom services

### What Is Deferred Until Automated Billing

- Self-serve subscription management
- Automated invoice generation
- Dunning / failed payment handling
- Usage-based billing metering
- Tax calculation and remittance

**See:** `MANUAL-BILLING-PILOT.md` for complete invoicing workflow.

---

## Engineering Roadmap vs. GTM Sequence

These are **separate tracks** and must not be confused.

### Engineering Roadmap (Control Panel)

| Phase | Objective | Status |
|-------|-----------|--------|
| Phase 0 | Foundation (spec, repo, architecture) | ✅ Complete |
| Phase 1 | MVP Dashboard (read-only monitoring) | ✅ Complete |
| Phase 2 | Interactive Controls (approval workflow) | 🟡 In Progress |
| Phase 3 | Full Operations (cron mgmt, advanced features) | ⏳ Todo |
| Phase 4 | Scale & Polish (multi-owner, API) | ⏳ Todo |

### GTM Product Release Sequence

| Phase | Product | Status |
|-------|---------|--------|
| Phase 1 | Laura Pilot | ✅ Ready |
| Phase 2 | Tony Closed Beta | 🟡 Draft-Only |
| Phase 3 | Billing Automation | ⏳ Deferred |
| Phase 4 | Controlled Autonomy | ⏳ Deferred |

**Critical Distinction:** Engineering can complete Phase 2-4 while GTM releases only Phase 1. The control panel roadmap enables Laura/Tony features; it does not dictate what ships to customers.

---

## Explicitly Not Shipping Yet

The following are **intentionally deferred** and should not be described as available:

| Feature | Reason for Deferral | Target Phase |
|---------|---------------------|--------------|
| Automated billing | Manual process sufficient for pilots | Phase 3 |
| Self-serve onboarding | High-touch pilot onboarding preferred | Phase 3 |
| Tony autonomous sending | Trust not yet earned; compliance validation needed | Phase 4 |
| Laura scoring/verdicts | Fair Housing compliance risk (never ships) | Never |
| Multi-owner support | Single-owner pilots first | Phase 4 |
| API for third-party integrations | No integration demand yet | Phase 4 |
| Usage-based billing metering | Flat-rate pilot pricing sufficient | Phase 3 |

---

## Manual Ops Required for Phase 1

Laura pilot requires the following manual operations:

| Manual Task | Frequency | Time Estimate | Owner |
|-------------|-----------|---------------|-------|
| CEO review gate approval (first 50 reports) | Per report | 2-5 min/report | David |
| Manual invoice generation | Monthly | 15 min/landlord | David |
| Payment reconciliation | Monthly | 30 min/landlord | David |
| Monthly P&L preparation | Monthly | 1-2 hours | David |
| Pilot onboarding call | One-time | 30-60 min/landlord | David |
| Compliance audit (language scan) | Weekly | 15 min | Hermes/QA |

**Total Manual Overhead:** ~5-10 hours/month for 5 landlords (declining after 50-report review gate bypassed).

---

## Launch Decision Rationale

### Why Laura First

1. **Lower Regulatory Risk:** Forensic analysis ≠ tenant screening
2. **Clearer Value Prop:** Fraud prevention = immediate ROI ($3,500-7,000 eviction cost avoidance)
3. **Simpler Ops:** Document upload → analysis → CEO review → landlord visibility
4. **Trust Building:** Human-in-the-loop establishes accuracy baseline before scaling

### Why Tony Is Gated

1. **Higher Automation Bias Risk:** Tenants may assume AI messages are authoritative
2. **Habitability Liability:** Missed urgent issues = legal exposure
3. **Trust Not Yet Earned:** Need Laura pilot data to validate agent accuracy
4. **Compliance Validation:** Fair Housing language must be proven in production first

### Why Billing Is Manual

1. **Pilot Scale:** 5 landlords = 5 invoices/month (trivial)
2. **Price Discovery:** Manual process allows iteration before automation locks in pricing
3. **No Customer Impact:** High-touch pilot onboarding expected anyway
4. **Parallel Development:** Billing can be built without blocking Laura launch

---

## External Messaging (Short Form)

### For Customer Conversations

> "PropertyOps AI launches with Laura, our forensic document integrity analyst for tenant onboarding. Laura flags anomalies in application documents — no scores, no verdicts, just evidence-based flags for your review. We're starting with 5 pilot landlords to validate accuracy before broader release. Tony, our maintenance operations agent, follows in closed beta after Laura validation."

### For Investor/Partner Conversations

> "Phase 1 is Laura — forensic document analysis for tenant onboarding. We're deliberately sequencing Laura first to establish trust and compliance posture before expanding to Tony (maintenance operations). Billing is manual for pilots; automation comes in Phase 3 after price validation. This is a disciplined, constraint-driven rollout — not a big-bang launch."

---

## Document Maintenance

**This document is the canonical answer** to "what ships first" for PropertyOps AI.

**When to Update:**
- Laura pilot completes (50/50 reports validated)
- Tony enters closed beta
- Automated billing launches
- Any GTM sequence change approved by CEO

**Where This Is Referenced:**
- `docs/control-panel-roadmap.md` — Points to this for GTM sequence
- `control-panel/README.md` — Points to this for product status
- `memory/2026-04-07-phase1-complete.md` — Supersedes for GTM questions
- All future launch/PRD/docs — Link here instead of restating sequence

---

**Approved By:** Hermes (CEO)  
**Date:** April 9, 2026  
**Next Review:** After Laura pilot completes (50/50 reports validated)
