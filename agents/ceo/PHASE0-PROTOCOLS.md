# CEO Agent — Phase 0 Protocols

This file defines the two active operational protocols for Phase 0: the KPI measurement protocol and the Referral Engine. These are not aspirational — they are running processes that Hermes executes for every Phase 0 account from day one.

**Phase 0 scope:** 5 manual accounts. Laura outputs reviewed by David before any landlord sees them. Every Document Integrity Report is founder-reviewed before delivery.

---

## Protocol 1: KPI Measurement

### Primary KPI: Manual Review Time per Application

Measure the landlord's total time from document receipt to final review decision, before and after Laura's Document Integrity Report is introduced.

**Target:** ≥40% reduction in per-application review time within 30 days of active use.

**Baseline measurement (Week 0 — before platform access):**
- Log the landlord's average time per application using their current workflow
- Document specific friction points they describe (document comparison, fraud checks, organizing submissions)
- This baseline is the denominator for the 40% reduction claim — it must be captured before the pilot begins, not estimated retroactively
- Log in Paperclip as a note on the account's issue

**Mid-point check-in (Day 14):**
- Qualitative friction log: what's working, what's still slow
- Review early anomaly flags together with the landlord
- Prompt any workflow adjustments needed
- If landlord hasn't used the platform yet: diagnose the blocker and resolve it — a stalled pilot is not a failed pilot

**KPI measurement (Day 30):**
- Post-Laura review time per application
- Anomaly log with landlord-confirmed accuracy labels (genuine anomaly / false positive / inconclusive)
- If 40% target is not met: extend the pilot, identify the friction cause, resolve before scaling to next account
- A failed metric is more valuable than a skipped one — do not declare success without the data

**Case study draft (Day 35):**
- One-page format: before/after KPI delta, one landlord quote, one anomaly example (anonymized)
- Primary sales tool for Account 2 outreach
- Assign to Revenue Agent for draft; Hermes reviews before use externally

### Secondary KPI: Document Anomaly Catch Rate

Log every anomaly Laura flags during the pilot. At conclusion, landlord confirms each flag as:
- Genuine anomaly
- False positive
- Inconclusive

**Target:** establish a baseline precision rate. Even 1–2 genuine catches per 20 applications is a compelling fraud-risk ROI anchor given the $3,500–$7,000 average eviction cost.

**This data feeds Phase 3 entry requirements.** Labeled outcomes from Phase 0 and Phase 2 are the calibration dataset that unlocks Calibrated Confidence gate. Do not skip the labeling step.

### Exception Report Integration

The Phase 0 pulse in the nightly exception report must include:

```
Phase 0:  [x/5 accounts active] | Review-time baseline: [captured/pending per account]
          Anomaly flags this week: [x] | Confirmed genuine: [x] | False positive: [x]
          Referral asks made: [x] | Warm referrals in pipeline: [x]
```

Remove this section when Phase 0 exits (5 accounts confirmed, case study drafted).

---

## Protocol 2: Referral Engine (Retention Flip)

Phase 0 accounts are not just a validation cohort — they are the primary acquisition engine for Phase 1. The referral ask is not made at contract signing or at the end of a positive call. It is made at the moment of highest emotional impact.

**Target:** ≥2 of 5 Phase 0 accounts generate one qualified referral before Phase 1 paid outreach begins.

A qualified referral is: a landlord managing 30+ units, introduced by a Phase 0 account, who agrees to a demo or pilot conversation.

### The Three Referral Triggers

**Trigger 1: Confirmed Genuine Anomaly Catch**

| Field | Value |
|-------|-------|
| Timing | Within 24 hours of landlord confirming the flag was genuine |
| The Ask | "Do you know one other landlord managing 30+ units who's had a bad tenant situation? I'd like to show them what we caught for you." |
| Incentive | One free month of service credited to their account when the referred account completes a pilot |
| Why this moment | The landlord has a concrete, dollar-denominated story right now. That story is more persuasive than cold outreach and comes with peer credibility. |

**Action:** Surface in the next exception report as `⚡ IMMEDIATE` with the landlord's name, the confirmed anomaly, and a draft referral ask ready for the founder to send.

---

**Trigger 2: Day 35 KPI Milestone Met**

| Field | Value |
|-------|-------|
| Timing | Day 35 (after case study draft is complete) |
| The Ask | "Would you be willing to share your before/after numbers with a prospective customer on a brief call?" |
| Incentive | Named co-credit in the published case study; extended audit log retention at no charge |
| Why this moment | The landlord has seen the quantified value. The case study ask is a natural extension of having already completed the measurement together. |

**Action:** Add to the Day 35 case study workflow. After Hermes reviews the case study draft, route a referral ask brief to the founder for each account that met the 40% KPI target.

---

**Trigger 3: Tony Phase 2 Launch**

| Field | Value |
|-------|-------|
| Timing | When Tony activates for a Phase 0 account (Month 3 transition) |
| The Ask | "We're rolling out maintenance triage to a small group first. Who's the most overwhelmed property manager you know?" |
| Incentive | Early access to Tony for referred account; prioritized onboarding |
| Why this moment | The landlord is experiencing a new capability. The "overwhelmed PM" framing anchors the ask in operational pain — it's not a generic referral request. |

**Action:** Hermes schedules this ask in the nightly report for the account's Tony activation week. Do not make this ask before Tony has demonstrably reduced their inbox load.

---

### Referral Tracking

Maintain a referral log per Phase 0 account in Paperclip (comment on the account's active issue):

```
## Referral Log
- Trigger 1 (anomaly catch): [Date fired / Not yet fired] | Referral: [Name/None] | Status: [pending/converted/declined]
- Trigger 2 (Day 35 KPI): [Date fired / Not yet fired] | Referral: [Name/None] | Status: [pending/converted/declined]
- Trigger 3 (Tony launch): [Date fired / Not yet fired] | Referral: [Name/None] | Status: [pending/converted/declined]
```

If an account reaches Day 35 without Trigger 1 firing (no confirmed anomaly catch), do not skip to Trigger 2 without noting the gap. A zero-anomaly-catch pilot is a product signal that needs to reach the founder.

---

## "Unreasonably Happy" Standard

This is not a customer satisfaction platitude. It is an operational standard applied to every Phase 0 account:

- Every Document Integrity Report is reviewed by the founder before delivery. No Phase 0 account receives an unreviewed output.
- Response time on any question or issue from a Phase 0 account is same-day.
- The founder actively debriefs each anomaly flag with the landlord — not just delivers the report.

Hermes enforces this standard by surfacing any Phase 0 account interaction that has not received a same-day response in the nightly exception report under `⚡ IMMEDIATE`.
