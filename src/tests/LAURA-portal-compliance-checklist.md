# LAURA Portal Compliance Checklist

**Document Type:** Legal Compliance Validation  
**Severity:** CRITICAL  
**Phase:** Phase 2C (Landlord Portal - Laura)  
**Date Created:** 2026-04-07  
**Last Updated:** 2026-04-07  

---

## Legal Guardrails Overview

Laura Portal is a **forensic document integrity interface** for landlords. It is NOT a tenant screening tool. All compliance requirements stem from Fair Housing Act obligations and the need to avoid any language or features that could be construed as credit/tenant decisions.

**Core Principle:** Laura flags anomalies with evidence citations. Laura does NOT score, recommend, or decide.

---

## Compliance Validation Checklist

### 1. Zero Scores Displayed ✅/❌

**Requirement:** No numeric scores, letter grades, or derived metrics displayed anywhere in the UI.

- [ ] No numeric scores (0-100, 1-10, etc.) in report data
- [ ] No letter grades (A, B, C, D, F) in any UI element
- [ ] No color-coded scores (red/yellow/green) that imply rating
- [ ] No percentage-based "risk scores" or "confidence scores"
- [ ] No derived metrics that could be interpreted as scoring (e.g., "risk level: high")

**Validation Method:** 
- Code scan for score-related variables
- UI audit of all report pages
- API response inspection for hidden score fields

**Severity if Violated:** CRITICAL

---

### 2. Zero Pass/Fail Verdicts ✅/❌

**Requirement:** No binary verdict language anywhere in the system.

- [ ] No "Pass" or "Fail" labels
- [ ] No "Approved" / "Rejected" terminology for tenant applications
- [ ] No "Clear" / "Flag" terminology that implies decision
- [ ] No checkmark/X indicators that imply pass/fail
- [ ] No status fields with pass/fail values

**Permitted Language:**
- "Anomaly detected" / "No anomalies detected"
- "Requires review" / "No issues found"
- "Flagged for human review"

**Validation Method:**
- Text scan of all UI strings
- API response field inspection
- Error message review

**Severity if Violated:** CRITICAL

---

### 3. Zero Credit Decision Language ✅/❌

**Requirement:** No language that could be construed as a credit, rental, or occupancy decision.

- [ ] No "approve" / "approval" for tenants (only for report review workflow)
- [ ] No "reject" / "rejection" for tenants
- [ ] No "deny" / "denial" terminology
- [ ] No "eligible" / "ineligible" language
- [ ] No "qualified" / "unqualified" terminology
- [ ] No "recommended" / "not recommended" phrasing

**Permitted Language:**
- "Report approved for landlord view" (internal workflow only)
- "Anomaly flagged for review"
- "Document integrity verified" / "Anomaly detected"

**Validation Method:**
- Full text scan of UI, API responses, error messages
- Database schema review for decision fields

**Severity if Violated:** CRITICAL

---

### 4. Zero Eviction Advice or Screening Recommendations ✅/❌

**Requirement:** Laura does not advise on tenant actions, eviction, or screening decisions.

- [ ] No eviction advice or recommendations
- [ ] No "screening" terminology (use "onboarding" or "document review")
- [ ] No "tenant screening report" language
- [ ] No recommendations to "proceed" or "do not proceed" with tenant
- [ ] No risk assessments that could guide rental decisions

**Permitted Language:**
- "Forensic document analysis"
- "Document integrity review"
- "Anomaly detection"
- "Onboarding document review"

**Validation Method:**
- Text scan of all user-facing content
- API endpoint naming review
- Documentation audit

**Severity if Violated:** CRITICAL

---

### 5. Anomaly Flags with Evidence Citations ✅/❌

**Requirement:** All anomaly flags must include specific evidence citations.

- [ ] Every anomaly flag references specific document section/page
- [ ] Evidence citations are machine-readable (structured data)
- [ ] No vague flags without evidence (e.g., "suspicious" without details)
- [ ] All flags link back to source document location
- [ ] Evidence is quotable and auditable

**Example Compliant Flag:**
```
Anomaly: Income figure mismatch
Location: Bank statement page 2, line 14 vs. Pay stub page 1, line 3
Details: $4,500 vs. $5,200 (13% discrepancy)
Evidence: [OCR extracted values with confidence scores]
```

**Validation Method:**
- Review all anomaly flag data structures
- Verify evidence fields are required, not optional
- Test UI display of evidence citations

**Severity if Violated:** HIGH

---

### 6. Review Gate Counter Visible (0/50) ✅/❌

**Requirement:** First 5 landlords operate under 50-report review gate. Counter must be visible.

- [ ] Counter displays on /landlord dashboard
- [ ] Counter displays on /landlord/reports/[id] pages
- [ ] Counter format: "X/50 reports reviewed" or similar
- [ ] Counter is visible, not hidden in menus
- [ ] Counter updates in real-time as reports are approved
- [ ] At 50/50, bypass confirmation is required

**Validation Method:**
- UI inspection of landlord portal pages
- Test counter increment on report approval
- Verify bypass confirmation at 50 reports

**Severity if Violated:** HIGH

---

### 7. Legal Disclaimer on Every Page (Cannot Be Hidden) ✅/❌

**Requirement:** Legal disclaimer must be present on all Laura Portal pages and cannot be dismissed.

**Required Disclaimer Text:**
> **Forensic Analysis Only** — Laura provides document integrity analysis, not tenant screening recommendations. This tool flags anomalies for human review. It does not make approval/denial decisions, assign scores, or provide eviction advice. All flagged items require human review before any action.

**Placement Requirements:**
- [ ] Present on /landlord (dashboard)
- [ ] Present on /landlord/reports (list view)
- [ ] Present on /landlord/reports/[id] (detail view)
- [ ] Present on all sub-pages
- [ ] Cannot be dismissed, closed, or minimized
- [ ] Cannot be hidden behind tooltips or accordions
- [ ] Visible without scrolling (or sticky footer)
- [ ] Clear, readable font size (minimum 12px)

**Validation Method:**
- UI audit of all Laura Portal pages
- Test that disclaimer cannot be removed
- Verify disclaimer text matches required language

**Severity if Violated:** CRITICAL

---

### 8. Fair Housing Compliance Language Present ✅/❌

**Requirement:** Fair Housing Act compliance statement must be present.

**Required Language:**
> PropertyOps AI complies with the Federal Fair Housing Act. This tool does not consider race, color, religion, sex, handicap, familial status, or national origin in any analysis. Laura's forensic document review is limited to document integrity and anomaly detection only.

**Placement:**
- [ ] Present in footer or dedicated compliance section
- [ ] Accessible from all Laura Portal pages
- [ ] Included in terms of service / user agreement
- [ ] Visible to landlords during onboarding

**Validation Method:**
- Text scan for Fair Housing language
- Verify placement is accessible and visible
- Confirm language matches required text

**Severity if Violated:** CRITICAL

---

### 9. Audit Trail for All Approvals ✅/❌

**Requirement:** Every report approval/rejection must be logged with full audit trail.

**Audit Log Requirements:**
- [ ] Timestamp (ISO 8601, timezone-aware)
- [ ] User ID (who approved/rejected)
- [ ] Report ID
- [ ] Action (approve/reject)
- [ ] Property ID (scope)
- [ ] IP address (for security audit)
- [ ] Session ID (for traceability)
- [ ] Reason/note (optional but supported)

**API Endpoint:**
- `POST /api/audit` - Creates audit log entries
- `GET /api/audit?reportId=...` - Retrieves audit trail for report

**Validation Method:**
- Test approval/rejection actions
- Verify audit log entries are created
- Confirm all required fields are present
- Test audit log retrieval

**Severity if Violated:** HIGH

---

## Summary

| # | Requirement | Status | Severity |
|---|-------------|--------|----------|
| 1 | Zero scores displayed | ❌ PENDING | CRITICAL |
| 2 | Zero Pass/Fail verdicts | ❌ PENDING | CRITICAL |
| 3 | Zero credit decision language | ❌ PENDING | CRITICAL |
| 4 | Zero eviction advice/screening recommendations | ❌ PENDING | CRITICAL |
| 5 | Anomaly flags with evidence citations | ❌ PENDING | HIGH |
| 6 | Review gate counter visible (0/50) | ❌ PENDING | HIGH |
| 7 | Legal disclaimer on every page | ❌ PENDING | CRITICAL |
| 8 | Fair Housing compliance language | ❌ PENDING | CRITICAL |
| 9 | Audit trail for all approvals | ❌ PENDING | HIGH |

---

## Deployment Gate

**DEPLOYMENT PROHIBITED** until all CRITICAL items are marked ✅.

**Sign-off Required:**
- [ ] QA Agent validation complete
- [ ] Hermes (CEO) approval
- [ ] Legal/Compliance review (when PRO-7 hire is complete)

---

## Notes

- This checklist is a living document. Update as requirements evolve.
- All violations must be documented in `LAURA-portal-validation-report.md`.
- Prohibited language patterns should be added to `prohibited-language-list.md`.
