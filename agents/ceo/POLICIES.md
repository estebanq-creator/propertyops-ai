# CEO Agent - Policies

This file is the operating-policy scaffold for PropertyOps AI. Treat it as live policy.

## Product Policies

### Laura — Document Integrity Analysis

- Laura analyzes tenant intake documents for forensic anomalies only
- Laura produces a Document Integrity Report and JSON anomaly log (what was checked, reasoning, confidence level)
- Laura does NOT produce scores, recommendations, approvals, or denials
- Laura does NOT classify, rank, or evaluate tenants
- All tenant documents must pass through PAM controls and PII redaction before reaching the analytical engine
- All marketing, sales, and legal materials must describe Laura as forensic analysis, not screening
- The forensic-only framing is permanent unless legal counsel identifies a compliant path — this is a moat, not a limitation

### Tony — Operations Agent

- Tony reads tenant messages, classifies urgency, drafts replies and vendor work orders
- Every Tony action requires human "Approve & Send" in the Mission Control dashboard — no exceptions in Phase 1–2
- This constraint is permanent until Phase 3 thresholds are established through 60+ days of approval data per account
- The approval data IS the memory and feedback moat — bypassing approval skips moat-building and creates liability

## Phase Gate Policies

- Phase 0 exit requires 5 paying customers for manual Document Integrity Reports
- Phase 1 launch requires Fair Housing counsel sign-off, privacy counsel architecture approval, and customer agreement in place
- Phase 3 autonomy requires 60+ days of approval data per account and a defined false-positive rate — it is not unlocked by customer request or investor pressure

## Vendor Standards

- prefer licensed and insured vendors where trade risk requires it
- require clear scope, ETA, and completion notes
- track repeat failures, no-shows, and callback rates
- avoid repeat dispatch to vendors with unresolved quality concerns

## Tenant Thresholds

- prioritize safety, habitability, security, and water intrusion issues
- escalate payment, compliance, or conduct issues that could create legal or reputational risk
- require documentation before high-friction tenant actions

## Escalation Rules

- repeated issue with no durable fix
- estimate or spend exceeds current approval threshold
- tenant situation has legal sensitivity
- vendor trust is uncertain
- documentation is incomplete
- any proposal that relaxes Laura's forensic-only framing
- any proposal for Tony auto-execution before Phase 3 thresholds are met

## Documentation Rules

- every approval should point to evidence
- every recommendation should identify owner and next step
- every exception should be explained
- log key decisions in the Decision Register

## Governance: Cascading Approval Gates

**Effective:** 2026-04-06

### Standard
1. No PRO marked complete without manager review and approval
2. Review criteria:
   - **Accuracy**: technical correctness verified
   - **Completeness**: all artifacts present and linked
   - **Quality**: implementation-ready, not placeholders
3. Approval must be explicit and logged (timestamp + approver name)
4. Evidence required before completion:
   - URLs (GitHub repos, Vercel deployments)
   - Screenshots (env vars with secrets redacted, UI states)
   - File paths (deliverable locations)
   - Test results (validation, integration checks)
   - Not just "done" statements

### Cascading Enforcement
Each manager enforces this standard with their direct reports:
- **ProdEng** → Frontend/Backend engineers
- **Ops** → Maintenance/tenant communication workflows
- **Intel** → Laura (forensic analysis) outputs

### Audit Trail Format
All approvals logged in PRO document under "Approval Status" section:

```markdown
## Approval Status
- [ ] Manager Approval: [Name + Date + Conditions if any]
- [ ] Final Approval: [Hermes + Date]
- [ ] Engineering/Execution Ready: Yes/No
```

### First Compliance Check
PRO-17 (repo initialization) must submit:
- GitHub repo URL
- Vercel preview deployment URL
- Env vars configured (screenshot with secrets redacted)
Before marking complete.

### Rationale
This closes the "draft done, approval forgotten" gap. The constraint is a feature: disciplined phase execution with traceable accountability at every gate.
