# Laura Portal - Legal Compliance Directive

**Date:** April 7, 2026  
**Initiated by:** David (CEO)  
**Status:** In Progress  
**Compliance Level:** CRITICAL  

---

## Executive Summary

Laura Portal provides **Forensic Document Integrity Analysis** for landlords. This is NOT tenant screening, NOT credit scoring, and NOT eviction advice.

**Three Non-Negotiable Constraints:**
1. Forensic-only interface (no scores, no verdicts)
2. Review gate for first 50 reports (CEO validation required)
3. Legal disclaimer on every page (cannot be hidden)

---

## Legal Guardrails

### What Laura IS
✅ Forensic document integrity analysis  
✅ Anomaly detection with evidence citations  
✅ Pattern flagging for human review  
✅ Document authenticity verification  

### What Laura IS NOT
❌ Tenant screening service  
❌ Credit scoring system  
❌ Eviction recommendation engine  
❌ Pass/Fail verdict provider  
❌ Automated decision maker  

---

## Compliance Requirements

### 1. Forensic-Only Interface

**PROHIBITED:**
- Numeric scores (0-100, 1-10, etc.)
- Letter grades (A, B, C, D, F)
- "Pass" / "Fail" language
- "Approved" / "Rejected" verdicts
- Creditworthiness assessments
- Eviction likelihood metrics
- "Risk score" or "Risk level"
- Screening recommendations

**REQUIRED:**
- "Anomaly detected" language only
- Evidence citations (specific document sections)
- "Flagged for review" not "Failed"
- "Document integrity concern" not "Tenant failed"
- Neutral, factual tone throughout

---

### 2. Review Gate (First 50 Reports)

**Workflow:**
```
Intel Agent → Mission Control (David) → Landlord Portal
     ↓              ↓                        ↓
  Analysis    Manual Validation        Visible Only
  Generated    (Approve/Reject)       After Approval
```

**Rules:**
- Reports 1-50: Manual approval required
- Counter visible: "X/50 reports validated"
- Landlords see ONLY approved reports
- Owner sees ALL reports with approve/reject actions
- After 50: Bypass option with confirmation dialog
- Audit trail: Every approval logged with userId + timestamp

**Rationale:**
- Early deployment validation
- Catch false positives before landlord visibility
- Build confidence in forensic accuracy
- Legal protection: Human-in-the-loop for initial reports

---

### 3. Legal Disclaimer (Every Page)

**Required Language:**

> **Forensic Analysis Notice:** This report provides document integrity analysis only. It does not constitute tenant screening, credit scoring, or eviction advice. All decisions should be made in compliance with Fair Housing laws and local regulations. Consult legal counsel before taking any adverse action.

**Placement:**
- Fixed footer on every Laura portal page
- Cannot be dismissed, hidden, or minimized
- Visible without scrolling (sticky footer)
- Same disclaimer on report detail pages

**Pages Requiring Disclaimer:**
- `/landlord` (dashboard)
- `/landlord/reports` (report list)
- `/landlord/reports/[id]` (report detail)
- `/landlord/properties` (property selector)
- All sub-pages and modals

---

## First 5 Landlords

| # | Landlord | Properties | Reports Expected | Status |
|---|----------|------------|------------------|--------|
| 1 | TBD | TBD | ~10 | ⏳ Pending |
| 2 | TBD | TBD | ~10 | ⏳ Pending |
| 3 | TBD | TBD | ~10 | ⏳ Pending |
| 4 | TBD | TBD | ~10 | ⏳ Pending |
| 5 | TBD | TBD | ~10 | ⏳ Pending |

**Total Reports:** ~50 (review gate threshold)

---

## Implementation Status

| Component | PRO | Status | Owner |
|-----------|-----|--------|-------|
| Laura Portal Dashboard | PRO-21 | 🔄 In Progress | ProdEng |
| Review Gate Interface | PRO-22 | ⏳ Todo | ProdEng |
| Legal Disclaimer Component | PRO-23 | ⏳ Todo | ProdEng |
| API Endpoints (reports/approve/reject) | PRO-21 | 🔄 In Progress | ProdEng |
| Compliance Validation | PRO-24 | ⏳ Todo | QA |
| First 5 Landlords Seed Data | PRO-25 | ⏳ Todo | ProdEng |
| Prohibited Language Audit | PRO-24 | ⏳ Todo | QA |

---

## Compliance Checklist

### Forensic-Only (CRITICAL)
- [ ] Zero scores in UI or API responses
- [ ] Zero "Pass/Fail" language
- [ ] Zero credit decision terminology
- [ ] Zero eviction-related language
- [ ] Anomaly flags with evidence only
- [ ] Neutral, factual tone throughout

### Review Gate (CRITICAL)
- [ ] Counter visible (0/50)
- [ ] Landlords see only approved reports
- [ ] Owner can approve/reject reports
- [ ] Audit trail for all approvals
- [ ] Bypass requires confirmation after 50

### Legal Disclaimer (CRITICAL)
- [ ] Present on /landlord
- [ ] Present on /landlord/reports/[id]
- [ ] Present on all sub-pages
- [ ] Cannot be dismissed/hidden
- [ ] Fair Housing language included

---

## Testing & Validation

### QA Test Cases
1. Scan all pages for prohibited language
2. Verify no scores in API responses
3. Test review gate enforcement (0/50)
4. Verify disclaimer on every page
5. Audit trail validation
6. Bypass workflow after 50 reports

### Approval Gates
- ✅ ProdEng implementation complete
- ✅ QA compliance validation (100%)
- ✅ Zero critical violations
- ✅ CEO sign-off on first 50 reports

---

## Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|------------|
| "Pass/Fail" language in UI | CRITICAL | QA language audit, automated scan |
| Scores displayed anywhere | CRITICAL | API response validation, UI review |
| Review gate bypassed | HIGH | Counter enforcement, approval required |
| Disclaimer missing on page | CRITICAL | Component-level enforcement, QA audit |
| Fair Housing violation | CRITICAL | Legal review, compliance checklist |

---

## Audit Trail

- **Directive Received:** April 7, 2026 10:30 EDT
- **ProdEng Spawned:** April 7, 2026 10:31 EDT
- **QA Spawned:** April 7, 2026 10:31 EDT
- **Status:** In Progress

**Evidence Location:** `/Users/david/.openclaw/workspace-hermes/control-panel`

---

## Legal References

- Fair Housing Act (42 U.S.C. § 3601 et seq.)
- FTC Fair Credit Reporting Act (15 U.S.C. § 1681 et seq.)
- State-specific landlord-tenant laws
- PropertyOps AI Terms of Service (forensic analysis only)

---

**COMPLIANCE STATUS:** ⏳ IN PROGRESS  
**DEPLOYMENT APPROVAL:** ⏳ PENDING QA VALIDATION
