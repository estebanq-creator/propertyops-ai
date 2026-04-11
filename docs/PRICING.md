# PropertyOps AI — Pricing Tier Model

**Document Type:** Canonical Pricing Reference  
**Created:** April 11, 2026  
**Owner:** Hermes (CEO)  
**Status:** ✅ Active — Manual billing for Phase 0 pilots; automated billing deferred to Phase 3

---

## One-Sentence Summary

PropertyOps AI charges per unit per month at two tiers (Starter and Operator), with an optional per-application intake fee where jurisdiction permits.

---

## Subscription Tiers

| Tier | Product Access | Price | Target Segment |
|------|---------------|-------|----------------|
| **Starter** | Laura forensic analysis only | $5–7 / unit / mo | Landlords who need document integrity analysis; not yet ready for full operations suite |
| **Operator** | Laura + Tony maintenance drafting | $8–10 / unit / mo | Landlords managing maintenance ops; primary ICP (40–150 units) |
| **Autonomous** | Full suite + controlled autonomy features | Custom / negotiated | Post-Phase 4 only; requires validated trust baseline |

### Volume Discount

- **76–150 unit portfolios:** price at lower end of tier range (e.g., $8/unit for Operator)
- **150+ units:** escalate to David for custom pricing

---

## Application Intake Fee

| Fee | Amount | Conditions |
|-----|--------|-----------|
| Application intake processing | $15–35 / application | Where permitted by jurisdiction; collected per application submitted through Laura |

- Billed manually in Phase 0 alongside subscription invoice
- Revenue logs each fee against the account in Paperclip
- Do not collect in jurisdictions where application fee caps apply without first verifying local limits

---

## Representative ARR Examples

| Portfolio | Tier | Price | Monthly | Annual |
|-----------|------|-------|---------|--------|
| 40 units | Starter | $6/unit | $240 | $2,880 |
| 55 units | Operator | $9/unit | $495 | $5,940 |
| 100 units | Operator | $8/unit | $800 | $9,600 |
| 150 units | Operator | $8/unit | $1,200 | $14,400 |

**ROI anchor:** Average eviction costs $3,500–$7,000. One prevented eviction per year covers the annual subscription cost.

---

## Billing Model by Phase

| Phase | Billing Method | Automation |
|-------|---------------|------------|
| **Phase 0 (Pilots 1–5)** | Manual invoice by David | None — Revenue records to Mercury only |
| **Phase 1 (General availability)** | Manual invoice with Stripe payment links | Semi-manual |
| **Phase 3 (Billing automation)** | Stripe subscriptions, automated invoicing | Full |

**Phase 0 rules:**
- David generates all invoices
- Revenue records payments received in Mercury; maintains reconciliation log
- Stripe subscriptions NOT created for Phase 0 accounts — creates compliance/onboarding friction before value is validated
- On Phase 0 → Phase 1 graduation: Revenue creates Stripe subscription, migrates billing, confirms with David before activating

---

## Pricing Authority

| Decision | Authority |
|----------|-----------|
| Standard tier pricing (within range) | Outbound Sales may quote |
| Volume discount (76–150 units, lower-end of range) | Outbound Sales may quote |
| Custom / enterprise pricing | David only |
| Price changes to tier definitions | David only |
| Promotional codes / discounts beyond standard | Hermes approval required |

**Outbound Sales guidance:** Quote ranges, not exact figures. Do not deflect with "flexible tiers" — it erodes trust. Say: "Starter runs $5–7/unit/month, Operator $8–10/unit/month. For your portfolio size, you're looking at roughly $X–Y/month."

---

## What Is Not Yet Priced

| Feature | Status | Notes |
|---------|--------|-------|
| Autonomous tier | Deferred to Phase 4 | Custom only; not available until trust/compliance gates passed |
| Usage-based billing metering | Deferred to Phase 3 | Flat-rate for pilots |
| Multi-property / multi-owner packages | Deferred to Phase 4 | Single-owner pilots first |
| API access for third-party integrations | Deferred to Phase 4 | No integration demand yet |

---

## Document Maintenance

**Update this document when:**
- David approves a pricing change
- Automated billing launches (Phase 3) — update billing model table
- Volume discount policy changes
- Application intake fee jurisdictional guidance changes

**This document is referenced by:**
- `agents/outbound-sales/INSTRUCTIONS.md` — pricing guidance for sales reps
- `agents/revenue/INSTRUCTIONS.md` — billing model for Revenue agent
- `docs/MANUAL-BILLING-PILOT.md` — pilot invoicing workflow
- `docs/LAUNCH-DECISION.md` — manual billing rationale

---

**Approved By:** Hermes (CEO)  
**Date:** April 11, 2026  
**Next Review:** Phase 3 billing automation launch
