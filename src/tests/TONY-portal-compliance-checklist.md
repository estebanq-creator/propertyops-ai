# TONY Portal Compliance Checklist

**Document Type:** Legal Compliance Validation  
**Severity:** CRITICAL  
**Phase:** Phase 2B (Tenant Portal - Tony)  
**Date Created:** 2026-04-07  
**Last Updated:** 2026-04-07  

---

## Legal Guardrails Overview

Tony Portal is a **draft-only tenant communication interface**. Tenants can compose messages, but **zero messages can be sent without CEO approval**. Tony is NOT an autonomous communication tool. All compliance requirements stem from Fair Housing Act obligations and the need to prevent unauthorized legal communications.

**Core Principle:** Tony drafts, CEO approves. Tenants cannot send directly.

---

## Compliance Validation Checklist

### 1. Zero Autonomous Send Authority ✅/❌

**Requirement:** Tenants cannot send messages directly. All messages must go through approval queue.

- [ ] No "Send" button visible to tenants in any UI view
- [ ] Only "Submit for Approval" or "Save Draft" buttons present
- [ ] API endpoints for sending require approval token/flag
- [ ] Direct send API calls from tenant context are rejected
- [ ] No keyboard shortcuts that trigger send (e.g., Ctrl+Enter)
- [ ] No auto-send on form submission
- [ ] No email/SMS integration that bypasses approval queue

**Validation Method:** 
- UI audit of all tenant message composition pages
- API endpoint security review (tenant vs. CEO permissions)
- Network request inspection for send operations
- Code scan for direct send triggers

**Severity if Violated:** CRITICAL

---

### 2. All Messages Require CEO Approval Before Sending ✅/❌

**Requirement:** Every tenant message must be reviewed and approved by CEO before transmission.

- [ ] Approval queue exists and is accessible to CEO
- [ ] Messages show "Pending Approval" status after tenant submission
- [ ] CEO can approve, reject, or edit before sending
- [ ] Approved messages show "Approved by [CEO Name] on [timestamp]"
- [ ] Rejected messages show "Rejected" status with optional reason
- [ ] No messages bypass approval workflow
- [ ] Habitability issues auto-bypass to CEO with RED flag

**Validation Method:**
- End-to-end test: tenant submits → CEO approves → message sends
- Database inspection: approval_status field required on all messages
- API review: send operation requires approval_id or approved_by field

**Severity if Violated:** CRITICAL

---

### 3. Habitability Issues Flagged RED and Bypassed to CEO ✅/❌

**Requirement:** Habitability-related messages must be flagged RED and routed directly to CEO.

**Habitability Keywords (RED Flag Triggers):**
- [ ] "no heat" / "heating"
- [ ] "no water" / "water leak" / "plumbing"
- [ ] "electric" / "power outage" / "no electricity"
- [ ] "mold" / "mildew"
- [ ] "pest" / "infestation" / "rodent" / "bug"
- [ ] "unsafe" / "dangerous" / "hazard"
- [ ] "broken" + (lock, window, door, appliance)
- [ ] "emergency" / "urgent"

**RED Flag Requirements:**
- [ ] Messages containing habitability keywords are auto-flagged RED
- [ ] RED-flagged messages appear at top of CEO approval queue
- [ ] RED-flagged messages show visible warning indicator
- [ ] RED-flagged messages cannot be auto-approved
- [ ] RED-flagged messages require explicit CEO acknowledgment

**Validation Method:**
- Test message composition with habitability keywords
- Verify RED flag is applied automatically
- Confirm CEO queue prioritization
- Code review of keyword detection logic

**Severity if Violated:** CRITICAL

---

### 4. Audit Trail for All Message Actions ✅/❌

**Requirement:** Every message action must be logged with full audit trail.

**Audit Log Requirements:**
- [ ] Timestamp (ISO 8601, timezone-aware)
- [ ] User ID (who performed action: tenant or CEO)
- [ ] Message ID
- [ ] Action type (DRAFT_CREATED, SUBMITTED_FOR_APPROVAL, APPROVED, REJECTED, SENT, EDITED)
- [ ] Property ID (scope)
- [ ] IP address (for security audit)
- [ ] Session ID (for traceability)
- [ ] Content hash (for integrity verification)
- [ ] Previous version reference (if edited)

**API Endpoint:**
- `POST /api/audit` - Creates audit log entries
- `GET /api/audit?messageId=...` - Retrieves audit trail for message

**Validation Method:**
- Test each message action (draft, submit, approve, reject, send, edit)
- Verify audit log entries are created for each action
- Confirm all required fields are present in audit logs
- Test audit log retrieval and filtering

**Severity if Violated:** HIGH

---

### 5. Legal Disclaimer on Every Page (Cannot Be Hidden) ✅/❌

**Requirement:** Legal disclaimer must be present on all Tony Portal pages and cannot be dismissed.

**Required Disclaimer Text:**
> **Draft-Only Communication** — Tony allows you to compose messages to your property manager, but all messages require approval before sending. Messages are not sent immediately. For emergencies, contact your property manager directly by phone or call 911 for life-safety issues.

**Placement Requirements:**
- [ ] Present on /tenant (dashboard)
- [ ] Present on /tenant/messages (list view)
- [ ] Present on /tenant/messages/new (composition view)
- [ ] Present on /tenant/messages/[id] (detail view)
- [ ] Present on all sub-pages
- [ ] Cannot be dismissed, closed, or minimized
- [ ] Cannot be hidden behind tooltips or accordions
- [ ] Visible without scrolling (or sticky header/footer)
- [ ] Clear, readable font size (minimum 12px)

**Validation Method:**
- UI audit of all Tony Portal pages
- Test that disclaimer cannot be removed
- Verify disclaimer text matches required language

**Severity if Violated:** CRITICAL

---

### 6. Fair Housing Compliance Language Present ✅/❌

**Requirement:** Fair Housing Act compliance statement must be present.

**Required Language:**
> PropertyOps AI complies with the Federal Fair Housing Act. This tool does not consider race, color, religion, sex, handicap, familial status, or national origin in any communication or action. All communications are reviewed for compliance before sending.

**Placement:**
- [ ] Present in footer or dedicated compliance section
- [ ] Accessible from all Tony Portal pages
- [ ] Included in terms of service / user agreement
- [ ] Visible to tenants during onboarding

**Validation Method:**
- Text scan for Fair Housing language
- Verify placement is accessible and visible
- Confirm language matches required text

**Severity if Violated:** CRITICAL

---

### 7. No Prohibited Terminology ✅/❌

**Requirement:** Tony Portal must not contain language that could trigger Fair Housing violations or imply legal decisions.

**Prohibited Terms (Must Not Appear in Tenant-Facing UI):**
- [ ] "eviction" / "evict"
- [ ] "screening" / "screen" (use "onboarding" or "application review")
- [ ] "credit decision" / "credit check" (use "financial verification" if needed)
- [ ] "approve" / "approval" for tenant status (only for message workflow)
- [ ] "reject" / "rejection" for tenant status
- [ ] "deny" / "denial"
- [ ] "eligible" / "ineligible"
- [ ] "qualified" / "unqualified"

**Permitted Language:**
- "Message approved for sending" (internal workflow only)
- "Draft submitted for review"
- "Pending approval"

**Validation Method:**
- Full text scan of tenant-facing UI, API responses, error messages
- Database schema review for prohibited field names
- Notification template review

**Severity if Violated:** CRITICAL

---

### 8. Approval Queue Presence Test ✅/❌

**Requirement:** CEO approval queue must exist and function correctly.

**Approval Queue Requirements:**
- [ ] Queue accessible at /ceo/approvals or equivalent
- [ ] Queue shows pending messages with tenant name, property, timestamp
- [ ] Queue shows message preview or excerpt
- [ ] Queue shows RED flag indicator for habitability issues
- [ ] Queue allows approve, reject, edit actions
- [ ] Queue sortable by timestamp, priority, property
- [ ] Queue filterable by status (pending, approved, rejected)
- [ ] Queue shows count of pending items

**Validation Method:**
- CEO login and queue access test
- Verify all pending messages appear in queue
- Test approve/reject/edit actions
- Confirm RED-flagged messages are highlighted

**Severity if Violated:** HIGH

---

### 9. UI Audit: No "Send" Button Visible to Tenants ✅/❌

**Requirement:** Tenants must never see a "Send" button—only "Submit for Approval".

**UI Elements to Verify:**
- [ ] Message composition form: "Submit for Approval" button only
- [ ] Message draft list: No "Send" action in row actions
- [ ] Message detail view: No "Send" button
- [ ] Mobile view: No "Send" button
- [ ] Keyboard shortcuts: No Ctrl+Enter or similar send triggers
- [ ] Context menus: No "Send" option
- [ ] Toolbar: No "Send" icon

**Button Text Requirements:**
- [ ] Primary action: "Submit for Approval" or "Submit for Review"
- [ ] Secondary action: "Save Draft"
- [ ] No variant: "Send", "Send Now", "Send Message"

**Validation Method:**
- Visual inspection of all tenant message UI views
- Code scan for button labels and action handlers
- Accessibility tree inspection (screen reader labels)

**Severity if Violated:** CRITICAL

---

### 10. API Validation: Drafts Cannot Be Sent Without Approval ✅/❌

**Requirement:** Backend must enforce approval requirement even if UI is bypassed.

**API Security Requirements:**
- [ ] POST /api/messages/send requires approval_id or approved_by field
- [ ] Tenant-role API calls to send endpoint are rejected with 403
- [ ] CEO-role API calls to send endpoint require prior approval record
- [ ] Direct database inserts bypassing approval are detected/flagged
- [ ] Webhook or integration sends require approval token

**Error Responses:**
- [ ] 403 Forbidden: "Message requires CEO approval before sending"
- [ ] 400 Bad Request: "Missing approval_id for send operation"

**Validation Method:**
- API penetration test: attempt direct send without approval
- Verify 403/400 responses
- Code review of send endpoint authorization logic
- Database trigger/constraint review (if applicable)

**Severity if Violated:** CRITICAL

---

## Summary

| # | Requirement | Status | Severity |
|---|-------------|--------|----------|
| 1 | Zero autonomous send authority | ❌ PENDING | CRITICAL |
| 2 | All messages require CEO approval | ❌ PENDING | CRITICAL |
| 3 | Habitability issues flagged RED | ❌ PENDING | CRITICAL |
| 4 | Audit trail for all message actions | ❌ PENDING | HIGH |
| 5 | Legal disclaimer on every page | ❌ PENDING | CRITICAL |
| 6 | Fair Housing compliance language | ❌ PENDING | CRITICAL |
| 7 | No prohibited terminology | ❌ PENDING | CRITICAL |
| 8 | Approval queue presence | ❌ PENDING | HIGH |
| 9 | UI audit: No "Send" button | ❌ PENDING | CRITICAL |
| 10 | API validation: Drafts require approval | ❌ PENDING | CRITICAL |

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
- All violations must be documented in `TONY-portal-validation-report.md`.
- Prohibited language patterns should be added to `prohibited-language-list.md`.
- Habitability keyword list should be reviewed quarterly and expanded based on real tenant messages.
