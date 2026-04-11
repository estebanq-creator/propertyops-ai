# OPE-2 — Lean Sales + Customer Success Structure and Phase 1 Human-in-the-Loop Workflow

Date: 2026-04-02
Owner: Hermes
Issue: OPE-2

## Decision

For the first 5–10 pilot customers, PropertyOps AI should operate with a deliberately lean commercial team and a mandatory human validation layer on every customer-facing Decision Packet. The objective is to maximize trust, capture edge cases, and harden repeatable operating procedures before wider automation.

## Rationale

1. Phase 1 success depends more on trust, quality, and learning velocity than on headcount efficiency.
2. The business plan explicitly positions the company around decision quality, explainability, and audit readiness rather than generic automation.
3. Early pilots create the training data for policy refinement, messaging, objection handling, and escalation rules.
4. Human review reduces reputational risk while the Hermes Decision Engine is still being calibrated on real customer workflows.

## Risks

1. Human review can become a throughput bottleneck if packet volume rises too quickly.
2. Poor role definition could blur sales promises, onboarding ownership, and quality accountability.
3. Inconsistent validation standards would erode the core claim of decision consistency.
4. Over-customization for early customers could create non-repeatable service debt.

## Immediate Team Design

### Team shape for first 5–10 pilots

1. Founder-led sales (David/CEO)
   - Owns outbound, qualification, closing, and strategic account selection.
   - Keeps messaging disciplined around “decisions with proof.”
   - Avoids selling broad automation or custom services.

2. 1 Customer Success / Onboarding Lead
   - Primary owner from handoff through go-live and first-value milestone.
   - Runs onboarding checklist, intake quality control, training, and weekly pilot reviews.
   - Tracks customer trust signals, objections, and renewal readiness.

3. 1 Decision Operations Analyst
   - Performs packet QA before delivery.
   - Validates evidence completeness, reasoning consistency, and policy adherence.
   - Escalates ambiguous or high-risk cases to Hermes/David.

4. Hermes + OpenClaw system layer
   - Hermes produces the draft decision and reasoning.
   - OpenClaw routes work, logs artifacts, and preserves audit trail.

### Hiring order

1. Customer Success / Onboarding Lead first.
2. Decision Operations Analyst second.
3. Additional sales capacity only after onboarding and QA are stable.

Reason: early-stage failure risk is more likely to come from poor onboarding and inconsistent packet review than from insufficient top-of-funnel volume.

## Role Charters

### Founder-led Sales

Primary outcomes
- 5–10 well-fit pilots
- disciplined promise-setting
- clear ICP learning

Operating rules
- Sell the pilot as a trust-building validation service.
- Lead with fraud detection, explainability, and defensible records.
- Do not promise fully autonomous approvals.
- Close only customers willing to follow the defined pilot workflow.

### Customer Success / Onboarding Lead

Primary outcomes
- fast time-to-first Decision Packet
- smooth onboarding experience
- consistent customer communication

Core responsibilities
- Collect required customer artifacts and policies.
- Confirm operating assumptions before first packet is delivered.
- Train customers on how to read Decision Packets.
- Run weekly review with each pilot account.
- Maintain issue log: objections, confusion points, missing data, feature gaps.

### Decision Operations Analyst

Primary outcomes
- packet accuracy
- consistency across cases
- escalation hygiene

Core responsibilities
- Review every Decision Packet before release.
- Confirm evidence is sufficient and cited.
- Check that recommendation matches reasoning and risk signals.
- Flag unclear cases, contradictions, or missing inputs.
- Record QA findings for model/policy improvement.

## Phase 1 Human-in-the-Loop Workflow

### Workflow objective

No Decision Packet reaches a pilot customer without human validation.

### Standard flow

1. Intake received
   - Customer submits application and source documents.
   - OpenClaw logs intake and required metadata.

2. Preflight completeness check
   - Customer Success or Decision Ops confirms required files and fields are present.
   - Incomplete intake is returned before analysis.

3. Hermes draft generation
   - Hermes produces a draft Decision Packet with:
     - recommendation
     - confidence level
     - fraud/risk signals
     - supporting evidence
     - reasoning
     - counterfactuals
     - audit trail reference

4. Human validation review
   - Decision Operations Analyst reviews the draft against the QA checklist.
   - Reviewer chooses one of three outcomes:
     - Approve for delivery
     - Revise and re-run / annotate
     - Escalate

5. Escalation path for ambiguous or sensitive cases
   - Escalate when any of the following apply:
     - missing or conflicting evidence
     - high fraud suspicion with weak proof
     - policy conflict
     - legal, fair-housing, or reputational sensitivity
     - low confidence with high customer impact
   - Escalation owner: Hermes for structured judgment, David for company-defining or sensitive exceptions.

6. Customer-facing delivery
   - Only validated packets are delivered.
   - Customer Success frames the output consistently and answers questions.

7. Feedback capture
   - Log customer reaction, overrides, outcome quality, and confusion points.
   - Feed recurring patterns into prompt, policy, and checklist updates.

## Decision Packet QA Checklist

Every reviewer must confirm:

1. Completeness
   - Required customer inputs are present.
   - Evidence references are specific, not vague.

2. Internal consistency
   - Recommendation matches evidence and reasoning.
   - Confidence level matches uncertainty.
   - Counterfactuals are relevant and actionable.

3. Explainability
   - A customer can understand why the recommendation was made.
   - Language avoids jargon and unsupported claims.

4. Risk handling
   - Fraud signals are explicit.
   - Material uncertainties are disclosed.
   - High-impact edge cases are escalated, not guessed.

5. Policy alignment
   - Output follows current customer policy and internal standards.
   - Exceptions are documented.

6. Delivery readiness
   - Packet is suitable for external sharing.
   - Reviewer name/date is logged.

## Service-Level Targets for Phase 1

1. Time to first pilot value: within 7 calendar days of kickoff.
2. Packet QA pass rate on first review: target 85%+ after initial calibration.
3. Pilot review cadence: weekly for every pilot customer.
4. Human-reviewed coverage: 100% of Decision Packets in Phase 1.
5. Escalation turnaround: same business day for active pilot cases.

## What Must Be Scripted Before Pilot Launch

1. Sales talk track
   - “We deliver decisions with proof.”
   - “Every early decision is human-validated before you see it.”
   - “The pilot is designed to show where risk hides and why the decision holds up.”

2. Onboarding checklist
   - customer goals
   - approval criteria/policy
   - required documents
   - delivery contact
   - review cadence
   - escalation contact

3. Packet QA form
   - reviewer
   - completeness pass/fail
   - consistency pass/fail
   - explainability pass/fail
   - escalation required Y/N
   - notes

4. Pilot review template
   - packets delivered
   - risk flags found
   - customer overrides
   - time saved / trust gained
   - recurring issues
   - next improvements

## Phase 1 Exit Criteria

Move from mandatory full human validation toward partial automation only when:

1. Packet quality is stable across multiple pilot accounts.
2. Escalation rates are declining.
3. Customers consistently understand and trust packet outputs.
4. Common error modes are documented and mitigated.
5. Internal QA standards are codified into repeatable policy/checklist form.

## Recommended Next Actions

1. Hire or assign a Customer Success / Onboarding Lead immediately.
2. Define the Decision Operations Analyst function, even if initially covered by the founder/team.
3. Turn the QA checklist and onboarding checklist into operational templates inside OpenClaw.
4. Use pilot reviews to refine messaging, escalation rules, and packet structure before scaling sales headcount.

## Executive Summary

The correct Phase 1 structure is not a larger sales team. It is a trust-preserving commercial pod: founder-led sales, one onboarding lead, one decision QA operator, and mandatory human validation on every delivered Decision Packet. This design best protects decision quality, customer trust, and learning velocity during the first 5–10 pilots.