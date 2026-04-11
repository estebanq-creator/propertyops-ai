# Tony Portal Directive - Phase 2D (Draft-Only Tenant Interface)

**Date:** April 7, 2026  
**Phase:** 2D (Tenant Portal)  
**Priority:** CRITICAL  
**Compliance Level:** Maximum (Legal & Operational Safeguards)

---

## Executive Directive

Build Tony Portal (Tenant View) for maintenance messaging with **three non-negotiable constraints** that protect the company from unauthorized tenant-landlord communication and ensure legal compliance.

**Core Principle:** Tony drafts, never sends autonomously. All messages require human approval. Habitability issues bypass to CEO immediately.

---

## Three Non-Negotiable Constraints

### 1. Draft-Only Interface 🔒

**Requirement:** Tenants have ZERO autonomous send authority.

**Enforcement:**
- No "Send" button in tenant UI
- Only "Submit for Approval" action available
- Messages saved as drafts until CEO approval
- Tenant cannot bypass approval workflow
- API enforces draft status (cannot send directly)

**UI Language:**
- ✅ "Submit for Approval"
- ✅ "Message Drafted"
- ✅ "Pending Review"
- ❌ "Send" (prohibited)
- ❌ "Sent" (prohibited until approved)

---

### 2. One-Click Approval Workflow ✓

**Requirement:** All tenant message drafts appear in CEO Mission Control for approval before sending.

**Workflow:**
```
Tenant → Tony (draft) → CEO Mission Control → Landlord/Tenant
                  (approve/reject)
```

**CEO Interface (`/owner/approval-queue`):**
- Queue of pending tenant message drafts
- One-click approve/reject actions
- Message preview with tenant info
- Property/unit context
- Timestamp tracking
- Audit trail logging

**After Approval:**
- Message sent to landlord (or tenant confirmation)
- Status: "Approved & Sent"
- Audit log: CEO userId + timestamp

**After Rejection:**
- Message not sent
- Optional: CEO adds reason for rejection
- Tenant notified: "Message reviewed - no action required" or similar

---

### 3. Habitability Escalation (Compliance Watchdog) 🚨

**Requirement:** Any message classified as "habitability" issue is flagged RED and bypassed to CEO for immediate personal review.

**Habitability Classifications:**
- No heat / heating failure
- No water / plumbing failure
- Electrical hazards
- Gas leaks
- Structural damage
- Pest infestations
- Mold issues
- Security breaches (broken locks)
- Any health/safety hazard

**Visual Flag:**
- **RED** background/border in CEO queue
- "HABITABILITY - IMMEDIATE REVIEW REQUIRED" label
- Sorted to top of queue
- Optional: Push notification to CEO

**Workflow:**
```
Tenant → Tony (draft) → Compliance Watchdog → HABITABILITY? → YES → RED FLAG → CEO Immediate Review
                                              → NO → Standard Approval Queue
```

**Legal Rationale:**
- Habitability issues have legal timelines (varies by jurisdiction)
- Immediate CEO awareness protects company from liability
- Ensures proper documentation and response tracking
- Prevents landlord neglect claims

---

## Implementation Requirements

### Frontend Pages

| Page | Purpose | Notes |
|------|---------|-------|
| `/tenant` | Tony Portal Dashboard | Message history, compose button |
| `/tenant/messages` | Message List | All tenant messages with status |
| `/tenant/messages/new` | Compose Message | Draft-only, "Submit for Approval" button |
| `/tenant/messages/[id]` | Message Detail | View status, CEO response if any |
| `/owner/approval-queue` | CEO Approval Interface | One-click approve/reject, RED flags for habitability |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tenant/messages` | POST | Create message draft |
| `/api/tenant/messages` | GET | List tenant's messages |
| `/api/tenant/messages/[id]` | GET | Get message detail |
| `/api/tenant/messages/[id]/submit` | POST | Submit draft for approval |
| `/api/owner/approval-queue` | GET | Get pending drafts for CEO |
| `/api/owner/approval-queue/[id]/approve` | POST | CEO approves message |
| `/api/owner/approval-queue/[id]/reject` | POST | CEO rejects message |
| `/api/compliance/classify` | POST | Classify message (habitability check) |

### Database Schema

**Messages Table:**
```
- id (UUID)
- tenantId (UUID)
- propertyId (UUID)
- unitId (UUID)
- subject (string)
- body (text)
- status (enum: draft, pending_approval, approved, rejected, sent)
- isHabitability (boolean)
- complianceWatchdogClassification (JSON)
- approvedByUserId (UUID, nullable)
- approvedAt (timestamp, nullable)
- rejectionReason (text, nullable)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### Audit Trail

**Every action must be logged:**
- Message created (userId, timestamp, IP)
- Message submitted for approval (userId, timestamp)
- Compliance classification run (timestamp, result)
- CEO approved (userId, timestamp)
- CEO rejected (userId, timestamp, reason)
- Message sent (timestamp, recipient)

---

## Compliance Requirements

### Legal Disclaimer

**Required on every Tony Portal page:**

> "Maintenance Request Notice: All messages are reviewed before being sent to ensure proper routing and compliance. Habitability issues receive priority attention. For emergencies, call 911 or your local emergency services."

**Placement:**
- Fixed footer (similar to Laura Portal)
- Cannot be dismissed or hidden
- Visible on all pages

### Fair Housing Compliance

**Prohibited Language in UI:**
- No eviction-related terminology
- No screening or credit decision language
- No discriminatory phrasing
- Neutral, factual tone throughout

### Data Privacy

- Tenant PII protected
- Messages encrypted at rest
- Access limited to authorized users (tenant, CEO, relevant landlord)
- Audit trail for all access

---

## QA Compliance Validation

**Pre-Deployment Checklist:**

- [ ] Zero "Send" buttons in tenant UI
- [ ] All messages require approval before sending
- [ ] Habitability issues flagged RED
- [ ] Habitability issues bypass to CEO immediately
- [ ] CEO approval queue functional
- [ ] One-click approve/reject working
- [ ] Audit trail logging all actions
- [ ] Legal disclaimer on every page
- [ ] Fair Housing compliance verified
- [ ] No prohibited language in UI

**Automated Tests:**
- UI audit for prohibited terms
- API validation (drafts cannot send without approval)
- Habitability classification test
- Approval queue presence test
- Audit trail validation
- Disclaimer presence test

---

## Success Metrics

**Phase 2D Completion:**
- ✅ All deliverables complete
- ✅ QA compliance tests passing (100%)
- ✅ Zero autonomous send capability
- ✅ 100% of messages routed through approval queue
- ✅ Habitability issues flagged and escalated correctly
- ✅ Audit trail complete for all actions

**Post-Deployment:**
- Tenant message submission rate
- CEO approval turnaround time
- Habitability issue detection accuracy
- Landlord response time (tracked separately)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Tenant bypasses approval | API enforces draft status, no direct send endpoint |
| Habitability issue missed | Compliance Watchdog auto-classification + RED flag |
| CEO approval bottleneck | Queue sorted by priority (habitability first) |
| Audit trail gaps | Middleware logs all actions automatically |
| Legal non-compliance | Disclaimer on every page, Fair Housing audit |

---

## Timeline

**Phase 2D Target:** April 20-22, 2026  
**Current Status:** 🔄 In Progress (April 7, 2026)  
**QA Validation:** Required before deployment  
**Deployment:** After QA sign-off

---

## Paperclip Tracking

**Goal:** `a534b4a0-8bb5-45ab-be4a-7814822637d8`  
**Projects:**
- `21511327-d31c-4a20-8d8c-197a0dbb9b94` (Tony Portal - Draft-Only UI)
- `d19036ae-c933-422a-8abd-bd2434288f1d` (Compliance Watchdog - Habitability Escalation)

**PROs:** To be created (PRO-27 through PRO-31 expected)

---

**APPROVED BY:** Hermes, CEO  
**IMPLEMENTATION:** ProdEng Agent  
**QA VALIDATION:** QA Agent  
**DEPLOYMENT AUTHORITY:** David (CEO escalation point)
