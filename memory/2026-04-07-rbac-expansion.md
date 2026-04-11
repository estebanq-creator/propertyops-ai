# RBAC Expansion - Multi-Tenant Portal Architecture

**Date:** April 7, 2026  
**Initiated by:** David (CEO directive)  
**Status:** In Progress  

---

## Executive Summary

PropertyOps AI is expanding from Owner-only Mission Control to a **multi-tenant SaaS platform** with three distinct user roles:

1. **Owner (David)** - Full fleet oversight
2. **Landlord (Laura Portal)** - Forensic Document Integrity for their properties
3. **Tenant (Tony Portal)** - Maintenance messaging and status tracking

**Critical Requirement:** All roles hit the same core application with strictly partitioned access. Zero cross-tenant data leakage.

---

## User Role Definitions

### Owner (David)
**Role:** `owner`  
**Access Level:** Full platform

**Capabilities:**
- Full fleet oversight (all properties)
- Financial approvals
- Nightly Exception Report
- All agent dashboards
- System administration
- Audit log access (all users)

**Route:** `/owner/*`

---

### Landlord (Laura Portal)
**Role:** `landlord`  
**Access Level:** Property-restricted

**Capabilities:**
- Forensic Document Integrity Reports (Laura)
- Restricted to their specific properties only
- View tenant onboarding status
- Receive alerts for document anomalies

**Restrictions:**
- ❌ No financial approvals
- ❌ No access to other landlords' properties
- ❌ No system administration
- ❌ No audit log (except their own actions)

**Route:** `/landlord/*`

---

### Tenant (Tony Portal)
**Role:** `tenant`  
**Access Level:** Unit-restricted

**Capabilities:**
- Maintenance messaging (Tony)
- Status tracking for their unit
- Upload documents for onboarding
- View maintenance request status

**Restrictions:**
- ❌ No access to other tenants' data
- ❌ No access to landlord data
- ❌ No financial information
- ❌ No document analysis results (only status)

**Route:** `/tenant/*`

---

## RBAC Architecture

### User Schema Extension

```typescript
interface User {
  id: string;
  email: string;
  role: 'owner' | 'landlord' | 'tenant';
  propertyIds: string[];  // Properties they can access
  landlordId?: string;    // For tenants: link to their landlord
  createdAt: Date;
  lastLogin: Date;
}
```

### Property Scoping Model

```
Owner (David)
├── Property A
│   ├── Landlord: Alice
│   └── Tenants: Bob, Charlie
├── Property B
│   ├── Landlord: Alice
│   └── Tenants: Dave
└── Property C
    ├── Landlord: Eve
    └── Tenants: Frank
```

**Access Rules:**
- Owner → All properties (A, B, C)
- Landlord Alice → Properties A, B only
- Landlord Eve → Property C only
- Tenant Bob → Property A, Unit X only
- Tenant Dave → Property B, Unit Y only

---

## Security Requirements

### Critical (Zero Tolerance)
1. **No cross-tenant data leakage**
   - Tenant Bob cannot see Tenant Charlie's maintenance requests
   - Landlord Alice cannot see Landlord Eve's properties
   - No enumeration attacks via property IDs

2. **No privilege escalation**
   - Tenant cannot access landlord endpoints
   - Landlord cannot access owner endpoints
   - Session token manipulation must fail

3. **All API routes must enforce role + property scoping**
   - Middleware guards on all routes
   - Database queries include propertyIds filter
   - No hardcoded property IDs in frontend

### High Priority
4. **Audit trail includes userId + propertyId**
   - Every action traceable to user and property
   - Exportable for compliance review

5. **Error messages don't leak information**
   - 403 responses without details
   - No stack traces in production

---

## Implementation Plan

### Phase 2B: RBAC Foundation (Current)

**ProdEng Tasks:**
- [ ] User schema extension (role, propertyIds, landlordId)
- [ ] next-auth v5 configuration with roles
- [ ] Middleware authorization guards
- [ ] API route updates with property scoping
- [ ] Role-based dashboard routing
- [ ] RBAC documentation

**QA Tasks:**
- [ ] Penetration test plan
- [ ] Automated test suite (Jest + Supertest)
- [ ] Security checklist
- [ ] Validation report

### Phase 2C: Landlord Portal (Laura)
- [ ] Forensic document integrity dashboard
- [ ] Property-specific reports
- [ ] Alert notifications
- [ ] Tenant onboarding status view

### Phase 2D: Tenant Portal (Tony)
- [ ] Maintenance messaging interface
- [ ] Status tracking
- [ ] Document upload
- [ ] Communication history

---

## Testing & Validation

### Penetration Test Scenarios

1. **Role Escalation Attempts**
   - Tenant tries to access `/owner/*` routes
   - Landlord tries to call Owner-only API endpoints
   - Session token role manipulation

2. **Cross-Property Access**
   - Landlord A tries Property B's data
   - Tenant A tries Tenant B's maintenance requests
   - Property ID enumeration (sequential IDs)

3. **API Endpoint Manipulation**
   - Direct curl/Postman calls bypassing UI
   - Modified request payloads
   - Injection attacks

4. **Data Leakage**
   - Error messages revealing existence of other properties
   - Search/filter results including unauthorized data
   - Aggregation queries leaking counts

### Validation Gates

**Before Production Deployment:**
- ✅ All automated tests pass
- ✅ Manual penetration testing complete
- ✅ Zero critical/high vulnerabilities
- ✅ RBAC documentation reviewed
- ✅ Hermes approval

---

## Timeline

| Phase | Duration | Target Date |
|-------|----------|-------------|
| Phase 2B: RBAC Foundation | 3-5 days | April 10-12, 2026 |
| Phase 2C: Landlord Portal | 5-7 days | April 15-17, 2026 |
| Phase 2D: Tenant Portal | 5-7 days | April 20-22, 2026 |
| QA Penetration Testing | Ongoing | April 12-22, 2026 |
| Production Deployment | 1 day | April 23, 2026 |

---

## Agents Assigned

| Agent | Role | Session Key |
|-------|------|-------------|
| ProdEng | RBAC Implementation | `agent:hermes:subagent:9d9a56d7-0b4e-4b68-ba91-46...` |
| QA | Penetration Testing | `agent:hermes:subagent:5eb92e0c-4ce6-4851-abc0-82acccea39c1` |

---

## Success Metrics

- **Security:** Zero data leakage incidents in first 30 days
- **Performance:** <100ms overhead from RBAC checks
- **UX:** Role-appropriate dashboards load in <2s
- **Compliance:** Full audit trail for all user actions

---

## Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|------------|
| Cross-tenant data leakage | Critical | QA penetration testing, automated test suite |
| Privilege escalation | Critical | Middleware guards, session validation |
| Scope creep | Medium | Phased rollout, MVP for each portal |
| Performance degradation | Low | Caching, optimized queries |

---

## Audit Trail

- **Directive Received:** April 7, 2026 10:03 EDT
- **ProdEng Spawned:** April 7, 2026 10:05 EDT
- **QA Spawned:** April 7, 2026 10:06 EDT
- **Status:** In Progress

**Evidence Location:** `/Users/david/.openclaw/workspace-hermes/control-panel`
