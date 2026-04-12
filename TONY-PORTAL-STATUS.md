# Tony Portal Status Tracker

**Initiative:** PRO-27: Tony Portal - Draft-Only Tenant Maintenance Interface (Phase 2D)  
**Goal:** Phase 2D: Tony Portal - Tenant Maintenance Interface (Draft-Only)  
**Status:** ✅ IMPLEMENTATION COMPLETE — 🟡 CLOSED BETA (Draft-Only)  
**Date:** 2026-04-07  
**GTM Status:** Not general availability — beta opens after Laura pilot validation (50/50 reports)

**Launch Decision:** `../docs/LAUNCH-DECISION.md`  
**Messaging:** `../docs/LAUNCH-MESSAGING.md` (Tony Beta Next section)

---

## Paperclip References

| Item | ID | Status | Link |
|------|----|--------|------|
| **PRO-27** (Initiative Tracker) | `678559bd-3ec7-4865-a2c2-55f3b2265275` | ⏳ Backlog | Parent tracker |
| **Goal** (Phase 2D) | `a534b4a0-8bb5-45ab-be4a-7814822637d8` | 🔄 Active | Goal |
| **Project 1** (Tony Portal UI) | `21511327-d31c-4a20-8d8c-197a0dbb9b94` | 🔄 In Progress | Frontend build |
| **Project 2** (Compliance Watchdog) | `d19036ae-c933-422a-8abd-bd2434288f1d` | 🔄 In Progress | Habitability escalation |

---

## Implementation Summary

### ✅ Complete Deliverables

| Component | File Path | Status |
|-----------|-----------|--------|
| **Tenant Message Store** | `src/lib/tenant-messages.ts` | ✅ Complete |
| **Tenant Messages API** | `src/app/api/tenant/messages/route.ts` | ✅ Complete |
| **Message Action API** | `src/app/api/tenant/messages/[id]/route.ts` | ✅ Complete |
| **CEO Approval Queue API** | `src/app/api/owner/approval-queue/route.ts` | ✅ Complete |
| **Tenant UI** | `src/app/tenant/messages/page.tsx` | ✅ Complete |
| **CEO Approval UI** | `src/app/owner/approval-queue/page.tsx` | ✅ Complete |
| **Legal Disclaimer** | `src/components/legal/DisclaimerFooter.tsx` | ✅ Reused |

---

## Phase 2 Constraints Enforced

### 1. Draft-Only ✅
- Tenant creates draft → `status: draft`
- Zero autonomous send authority
- No direct tenant→landlord messaging
- All messages require CEO approval

### 2. One-Click Approval ✅
- Tenant submits draft → `status: submitted`
- Appears in CEO Mission Control: `/owner/approval-queue`
- Approve/reject with one click
- Only approved messages visible to landlord

### 3. Habitability Escalation ✅
- Automatic keyword detection: "broken", "leaking", "damage", "no heat", "no water"
- **RED badge** in approval queue
- Visual escalation for immediate CEO attention
- Compliance Watchdog integration ready (keyword-based, swappable for API)

---

## Workflow

```
┌─────────────┐
│   Tenant    │
│  (Tony UI)  │
└──────┬──────┘
       │
       ▼
   Compose Message
       │
       ▼
   Save as Draft (status: draft)
       │
       ▼
   Submit for Approval (status: submitted)
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
  Habitability?          Normal Issue
  (RED badge)            (GREEN badge)
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  CEO Mission    │
         │    Control      │
         │ (Approval Queue)│
         └────────┬────────┘
                  │
          ┌───────┴───────┐
          │               │
          ▼               ▼
      Approve          Reject
   (status: approved)  (status: rejected)
          │
          ▼
    Visible to Landlord
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/tenant/messages` | Create draft message |
| GET | `/api/tenant/messages?tenantId=X` | Get tenant's drafts |
| GET | `/api/tenant/messages/[id]` | Get single draft |
| POST | `/api/tenant/messages/[id]` | Submit/approve/reject action |
| GET | `/api/owner/approval-queue` | Fetch pending approvals |
| POST | `/api/owner/approval-queue` | Approve/reject with audit trail |

---

## URLs (Local Development)

| Page | URL | Purpose |
|------|-----|---------|
| Tenant Portal | `http://localhost:3000/tenant/messages` | Compose and submit drafts |
| CEO Approval Queue | `http://localhost:3000/owner/approval-queue` | Review and approve/reject |

---

## Testing Checklist

- [ ] Compose message as tenant
- [ ] Save as draft
- [ ] Submit draft for approval
- [ ] Visit approval queue as CEO
- [ ] Verify habitability flag (RED for urgent issues)
- [ ] Approve message with one click
- [ ] Reject message with reason
- [ ] Verify audit trail (userId + timestamp)
- [ ] Confirm legal disclaimer visible on all pages

---

## Next Steps

1. **Local Testing** (15 min)
   ```bash
   cd /Users/david/.openclaw/workspace-hermes/control-panel
   npm run dev
   ```

2. **Deploy to Production** (after validation)
   ```bash
   vercel --prod --yes
   ```

3. **Onboard Test Tenants** (Phase 0)
   - Create 5-10 test tenant accounts
   - Submit varied maintenance requests
   - Validate approval workflow under load

4. **Monitor Compliance**
   - Audit trail verification
   - Habitability escalation accuracy
   - Fair Housing compliance review

---

## Compliance Notes

**Fair Housing Act (42 U.S.C. § 3601):**
- No discriminatory language in messages
- Neutral, factual tone enforced
- Legal disclaimer on all pages

**Audit Trail:**
- Every approval/rejection logged
- userId + timestamp required
- Immutable record kept

**Habitability Law:**
- Urgent issues flagged RED
- Bypassed to CEO for immediate review
- Prevents legal exposure from delayed responses

---

**Last Updated:** 2026-04-07 13:28 EDT  
**Git Commit:** Pending  
**Auditor:** Hermes (CEO)
