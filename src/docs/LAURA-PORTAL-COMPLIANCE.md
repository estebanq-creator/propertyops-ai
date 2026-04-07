# Laura Portal Compliance Documentation

**Last Updated:** 2026-04-07  
**Version:** 1.0.0  
**Status:** Phase 0 - First 5 Landlords

---

## Executive Summary

The Laura Portal is a **forensic document integrity analysis system** designed for independent landlords and small property managers (5–150 units). It provides anomaly detection in tenant onboarding documents while maintaining strict compliance with Fair Housing Act requirements.

**Critical Constraint:** Laura does NOT provide tenant screening, credit scoring, or eviction recommendations. It is a forensic analysis tool ONLY.

---

## Compliance Framework

### 1. Fair Housing Act Compliance

#### Prohibited Activities
- ❌ No tenant screening decisions
- ❌ No credit scoring or derived metrics
- ❌ No pass/fail verdicts
- ❌ No eviction recommendations
- ❌ No language suggesting housing eligibility

#### Required Practices
- ✅ Anomaly flags with evidence citations only
- ✅ Human review required for all decisions
- ✅ Clear disclaimers on every page
- ✅ Audit trail for all actions
- ✅ Neutral, evidence-based language

### 2. Forensic Analysis Scope

**What Laura Does:**
- Analyzes document metadata for inconsistencies
- Detects image manipulation or alterations
- Identifies font variations suggesting edits
- Flags template mismatches
- Detects signature anomalies
- Reports text alteration evidence

**What Laura Does NOT Do:**
- Make housing decisions
- Provide screening recommendations
- Generate risk scores
- Suggest approval/denial actions
- Replace background checks
- Substitute for legal counsel

### 3. Review Gate Workflow (Phase 0)

#### First 50 Reports Requirement

All forensic reports for the first 5 landlords must pass through manual validation:

```
Intel Agent → Mission Control (David) → Landlord Portal
```

**Status States:**
- `pending_review` - Awaiting Mission Control validation
- `approved` - Validated, visible to landlord
- `rejected` - Not validated, not visible to landlord

**Counter:** 0/50 validated (bypass enabled at 50)

#### Approval Process

1. Intel Agent generates forensic report
2. Report enters review queue (pending_review)
3. Mission Control reviews anomalies
4. Mission Control approves or rejects
5. If approved: report visible to landlord
6. If rejected: report archived (not visible)

**Audit Trail:** Every approval/rejection is logged with:
- Timestamp
- Actor (reviewer ID)
- Previous status
- New status
- Rejection reason (if applicable)

---

## Technical Implementation

### Legal Disclaimer Component

**Location:** `src/components/legal/DisclaimerFooter.tsx`

**Requirements:**
- Fixed position footer on every Laura Portal page
- Cannot be dismissed, hidden, or removed
- Must include:
  - Fair Housing Act compliance statement
  - Forensic analysis disclosure
  - No eviction advice notice
  - Audit trail notice

**Usage:**
```tsx
import { DisclaimerFooter } from '@/components/legal/DisclaimerFooter';

// Full footer (use at bottom of page)
<DisclaimerFooter />

// Compact version (use within content)
<CompactDisclaimer />
```

### API Endpoints

#### GET /api/landlord/reports

Returns ONLY approved reports for authenticated landlord.

**Compliance:**
- Filters out pending_review and rejected reports
- Returns anomaly flags only (no scores)
- Includes review gate progress counter

#### POST /api/landlord/reports/[id]/approve

Approves a report (owner only).

**Compliance:**
- Creates audit trail entry
- Updates review gate counter
- Requires owner authentication

#### POST /api/landlord/reports/[id]/reject

Rejects a report (owner only).

**Compliance:**
- Creates audit trail entry
- Records rejection reason
- Updates review gate counter

#### GET /api/landlord/review-queue

Returns pending reports for Mission Control.

**Compliance:**
- Owner-only access
- Shows review gate progress
- Sorts by severity (high first)

### UI/UX Compliance Requirements

#### Language Guidelines

**Use:**
- "Anomaly detected"
- "Document integrity issue"
- "Forensic analysis flag"
- "Evidence of alteration"
- "Inconsistency detected"

**Avoid:**
- "Tenant failed"
- "High risk"
- "Reject this applicant"
- "Eviction recommended"
- "Untrustworthy"

#### Visual Design

- Severity colors: red (high), yellow (medium), blue (low)
- No red/green "pass/fail" indicators
- Evidence citations required for every flag
- Clear separation between analysis and decision

---

## Seed Data - First 5 Landlords

### Landlord Accounts

| ID | Name | Email | Properties | Company |
|----|------|-------|------------|---------|
| landlord-001 | Sarah Chen | sarah.chen@email.com | prop-001, prop-002 | Chen Properties LLC |
| landlord-002 | Marcus Johnson | marcus.johnson@email.com | prop-003 | Johnson Rentals |
| landlord-003 | Elena Rodriguez | elena.rodriguez@email.com | prop-004, prop-005, prop-006 | Rodriguez Housing Group |
| landlord-004 | David Kim | david.kim@email.com | prop-007 | Kim Investment Properties |
| landlord-005 | Jennifer Walsh | jennifer.walsh@email.com | prop-008, prop-009 | Walsh Residential |

### Sample Reports

5 sample reports provided for testing review gate workflow:
- report-001: Pay stub with metadata inconsistency (medium) + font variation (low)
- report-002: ID with image manipulation detected (high)
- report-003: Bank statement - clean (no anomalies)
- report-004: Employment letter with template mismatch (medium)
- report-005: Lease with signature anomaly (high) + text alteration (high)

---

## Compliance Checklist

### Pre-Launch Verification

- [ ] No scores anywhere in UI (numeric, letter grades, derived metrics)
- [ ] No pass/fail language
- [ ] No credit decision language
- [ ] No eviction advice or recommendations
- [ ] Anomaly flags only with evidence citations
- [ ] Review gate enforced (0/50 counter visible)
- [ ] Legal disclaimer on every page (cannot be hidden)
- [ ] Audit trail for all approvals/rejections
- [ ] Owner-only access to review queue
- [ ] Landlords see ONLY approved reports
- [ ] Neutral, evidence-based language throughout

### Ongoing Compliance

- [ ] Monthly audit of disclaimer visibility
- [ ] Quarterly review of language/tone
- [ ] Annual Fair Housing training for Mission Control
- [ ] Continuous audit trail monitoring
- [ ] Regular backup of review gate state

---

## Risk Mitigation

### Potential Risks

1. **Misuse Risk:** Landlords may attempt to use Laura for screening
   - **Mitigation:** Clear disclaimers, terms of service, user education

2. **Compliance Risk:** Language may inadvertently suggest decisions
   - **Mitigation:** Regular audits, legal review, automated language checks

3. **Technical Risk:** Review gate bypass before 50 validations
   - **Mitigation:** Hard-coded enforcement, database constraints, monitoring

4. **Legal Risk:** Tenant challenges based on Laura analysis
   - **Mitigation:** Audit trail, human review requirement, legal disclaimers

### Escalation Protocol

If compliance concerns arise:
1. Document the issue
2. Notify Mission Control (David)
3. Pause affected functionality if critical
4. Consult legal counsel
5. Implement fix with audit trail
6. Resume with monitoring

---

## Future Phases

### Phase 1 (After 50 Reports Validated)
- Review gate bypass option available
- Continue forensic-only posture
- Expand to additional landlords

### Phase 2 (Customer Evidence Required)
- Evaluate Tony (Operational Layer) integration
- Maintenance triage workflow
- Tenant communication drafting

### Phase 3 (Scale)
- Multi-region deployment
- Enhanced audit trail features
- Advanced forensic capabilities

---

## Contact

**Mission Control:** David (Founder)  
**Compliance Questions:** Escalate to legal counsel  
**Technical Issues:** PropertyOps AI Engineering

---

**Document Control:** This is a living document. Update with every compliance change or feature addition.
