# Manual Billing for Pilots

**Document Type:** Operational Procedure  
**Created:** April 9, 2026  
**Owner:** David (CEO)  
**Status:** ✅ READY FOR USE  

---

## Executive Summary

**Billing is manual for Phase 1 pilots.** This is intentional and acceptable.

- First 5 landlords = ~5 invoices/month (trivial manual overhead)
- Founder-led contracts enable pricing iteration before automation
- No engineering dependency — Laura can launch immediately
- PRO-14 Bookkeeping Agent complete but not required for pilots

**Why This Works:**
- Pilot scale is small (5 landlords)
- High-touch onboarding expected anyway
- Price discovery phase — manual allows flexibility
- Billing automation can be built in parallel

---

## Pilot Pricing Structure

### Target Pricing (To Be Validated)

| Tier | Units | Monthly Price | Per-Unit | Application Fee |
|------|-------|---------------|----------|-----------------|
| **Starter** | 5-20 | $199 | ~$10-40/unit | $25/application |
| **Growth** | 20-75 | $499 | ~$7-25/unit | $25/application |
| **Pro** | 75-150 | $799 | ~$5-11/unit | $35/application |

**Note:** Pricing is intentionally flexible during pilot. Adjust based on landlord feedback and willingness to pay.

---

## Invoice Cadence

### Monthly Cycle

| Date | Action | Owner |
|------|--------|-------|
| 1st | Generate invoices for all pilots | David |
| 3rd | Send invoices via email | David |
| 15th | Payment due date | Landlord |
| 20th | Follow up on late payments | David |
| 30th | Reconcile payments in Mercury | David |

### Invoice Template

```
PROPERTYOPS AI — Monthly Invoice

Invoice #: PO-YYYY-MM-LL (e.g., PO-2026-04-001)
Date: April 1, 2026
Due Date: April 15, 2026

Bill To:
[Landlord Name]
[Property Address]
[Email]

Services:
- PropertyOps AI Pilot Subscription (Month YYYY-MM)
  [Tier Name] — [X] units ........................ $XXX
  
- Application Processing (if applicable)
  [X] applications @ $25/application ............. $XX

Total Due: $XXX

Payment Methods:
1. Stripe Payment Link: [link]
2. Bank Transfer: [Mercury account details]

Questions? Reply to this email or text David at [phone].

Thank you for piloting PropertyOps AI!
```

---

## Manual Invoicing Assumptions

### What We're Assuming

1. **5 or fewer pilot landlords** — manageable manual overhead
2. **Flat-rate pricing** — no usage metering needed yet
3. **Application fees are occasional** — not daily volume
4. **Payment tracking via Mercury** — manual reconciliation acceptable
5. **No dunning automation** — personal follow-up acceptable for pilots

### What Changes at Scale

| Threshold | Change Required |
|-----------|-----------------|
| >10 landlords | Automated invoice generation |
| >20 landlords | Self-serve subscription management |
| >50 applications/month | Automated application fee metering |
| >$10K MRR | Formal billing system (Stripe Billing, Chargebee, etc.) |

**Current State:** ~5 landlords, ~$1-4K MRR — manual is appropriate.

---

## What Is Billed Manually

### Recurring Charges

| Charge Type | Frequency | Method |
|-------------|-----------|--------|
| Pilot subscription | Monthly | Manual invoice |
| Overage (if any) | Monthly | Manual invoice |
| Custom services | Per-service | Manual invoice |

### One-Time Charges

| Charge Type | Method |
|-------------|--------|
| Setup fee (if any) | Manual invoice |
| Application fees | Monthly invoice (batch) |
| Training/onboarding | Manual invoice (if charged) |

---

## What Is Deferred Until Automated Billing

The following are **intentionally not built** for Phase 1:

| Feature | Phase | Reason |
|---------|-------|--------|
| Self-serve subscription upgrades | Phase 3 | Pilots need high-touch anyway |
| Automated invoice generation | Phase 3 | 5 invoices/month is trivial |
| Dunning / failed payment handling | Phase 3 | Personal follow-up acceptable |
| Usage-based billing metering | Phase 3 | Flat-rate sufficient for pilots |
| Tax calculation and remittance | Phase 3 | Manual calculation acceptable |
| Proration for mid-month changes | Phase 3 | Manual proration acceptable |
| Credit card on file (auto-charge) | Phase 3 | Manual payment links work |
| Subscription pause/cancel flow | Phase 3 | Founder-led contracts handle this |

---

## Payment Collection Workflow

### Option 1: Stripe Payment Links (Recommended)

**Setup:**
1. Go to Stripe Dashboard → Products → Payment Links
2. Create product: "PropertyOps AI Pilot — [Tier]"
3. Set price: $[X]/month
4. Generate payment link
5. Save link in landlord record

**Monthly Process:**
1. Email invoice with payment link
2. Landlord clicks link, pays with card
3. Stripe deposits to Mercury (2-3 days)
4. Reconcile in Mercury manually

**Pros:** Simple, no code required, immediate  
**Cons:** Manual reconciliation, no auto-retry

---

### Option 2: Bank Transfer (ACH/Wire)

**Setup:**
1. Provide Mercury account details to landlord
2. Landlord sets up recurring transfer (if their bank supports)

**Monthly Process:**
1. Email invoice with bank details
2. Landlord initiates transfer
3. Monitor Mercury for deposit
4. Reconcile manually

**Pros:** Lower fees (no card processing)  
**Cons:** Slower, more friction, manual tracking

---

### Option 3: Hybrid (Card + ACH)

**Setup:**
1. Stripe Payment Link for card payments
2. Mercury details for ACH/wire

**Monthly Process:**
1. Email invoice with both options
2. Landlord chooses preferred method
3. Reconcile based on method used

**Pros:** Flexibility for landlords  
**Cons:** Slightly more tracking complexity

---

## Reconciliation Process

### Weekly Check (5 min)

1. Open Mercury dashboard
2. Review deposits since last check
3. Match deposits to outstanding invoices
4. Mark invoices as "Paid" in tracking sheet

### Monthly Close (30 min)

1. Generate invoice for next month (1st)
2. Reconcile all payments from prior month
3. Identify any late/missing payments
4. Follow up on outstanding invoices
5. Prepare simple P&L summary (PRO-14 can help)

### Tracking Sheet Template

```
| Landlord | Tier | Monthly Rate | Invoice Sent | Due Date | Paid Date | Amount | Status |
|----------|------|--------------|--------------|----------|-----------|--------|--------|
| Landlord A | Starter | $199 | 2026-04-01 | 2026-04-15 | 2026-04-12 | $199 | Paid ✅ |
| Landlord B | Growth | $499 | 2026-04-01 | 2026-04-15 | - | $0 | Outstanding ⚠️ |
```

**Location:** `~/openclaw/workspace-hermes/docs/pilot-billing-tracker.xlsx` (or Google Sheets)

---

## Why This Is Acceptable for First Pilots

### Time Investment

| Task | Frequency | Time/Month |
|------|-----------|------------|
| Invoice generation | Monthly | 15 min × 5 = 1.25 hours |
| Payment reconciliation | Weekly | 5 min × 4 = 20 min |
| Monthly close | Monthly | 30 min |
| Follow-up on late payments | As needed | ~30 min |

**Total:** ~2.5 hours/month for 5 landlords  
**Cost:** ~$50-100/month in founder time (at $50-100/hr)  
**Revenue:** ~$1-4K/month  
**Overhead:** 2.5-10% — acceptable for validation phase

### Strategic Benefits

1. **Price Discovery:** Manual process allows iteration ("Would you pay $X for Y?")
2. **Relationship Building:** Personal invoices = high-touch experience
3. **Flexibility:** Easy to adjust pricing, add custom services, prorate
4. **No Engineering Distraction:** Billing can be built in parallel without blocking Laura
5. **Validation First:** Prove landlords will pay before automating billing

---

## Transition to Automated Billing

### Trigger Conditions

Automated billing becomes necessary when:

| Condition | Threshold |
|-----------|-----------|
| Landlord count | >10 landlords |
| Invoice volume | >15 invoices/month |
| MRR | >$5K/month |
| Application fees | >20 applications/month |
| Founder time | >5 hours/month on billing |

**Any one condition** → prioritize billing automation  
**Multiple conditions** → billing automation is critical path

---

### Automation Requirements (Phase 3)

| Feature | Priority | Notes |
|---------|----------|-------|
| Stripe Billing integration | P0 | Subscription management |
| Automated invoice generation | P0 | Email on 1st of month |
| Auto-charge (card on file) | P0 | Reduce friction |
| Dunning (failed payment retry) | P1 | 3-attempt retry logic |
| Self-serve upgrade/downgrade | P1 | Landlord portal |
| Usage metering (applications) | P2 | If application fees scale |
| Tax calculation | P2 | When multi-state |
| Proration engine | P2 | Mid-month changes |

**Estimated Effort:** 2-3 weeks engineering time  
**Dependency:** None for Laura pilot launch

---

## PRO-14 Status

**Bookkeeping Agent:** ✅ Complete (mock mode)

| Component | Status | Notes |
|-----------|--------|-------|
| Stripe API connector | ✅ Complete | Test mode working |
| Mercury API connector | 🟡 Mock mode | Awaiting production credentials |
| Reconciliation engine | ✅ Complete | $1 tolerance, >$100 alerts |
| Transaction categorization | ✅ Complete | 100% accuracy on test data |
| P&L generator | ✅ Complete | Monthly reports ready |
| Daily orchestration | ✅ Active | Runs autonomously |

**Production Enablement:** Requires real Mercury credentials (contact Mercury support)

**For Pilot Billing:** PRO-14 can assist with monthly P&L even in mock mode — manually input payment data for now.

---

## FAQ

### Q: Why not just build billing now?

**A:** Engineering time is better spent on Laura validation and Tony beta. Billing is solved problem — document integrity analysis is not. Validate demand first, automate second.

### Q: What if landlords complain about manual invoicing?

**A:** Unlikely for pilots — they expect high-touch onboarding. If concern arises, offer auto-pay via Stripe payment link (save card, charge monthly).

### Q: Can PRO-14 automate this?

**A:** Partially — PRO-14 can generate invoices and reconcile payments, but still requires production Mercury credentials. Even then, subscription management needs Stripe Billing build.

### Q: When do we build automated billing?

**A:** After Laura pilot validation (50 reports) AND when manual overhead exceeds 5 hours/month. Target: Phase 3 (8-12 weeks from launch).

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| CEO | David | ⬜ | Pending |
| Product Lead | Hermes | April 9, 2026 | ✅ |
| Operations | Ops Agent | April 9, 2026 | ✅ |

---

**Next Action:** David to review pricing structure and approve pilot rates  
**Timeline:** Pricing finalized before first pilot onboarding
