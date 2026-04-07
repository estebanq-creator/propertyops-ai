# RBAC Penetration Test Plan

**PropertyOps AI - Multi-Tenant SaaS Security Validation**

**Version:** 1.0  
**Date:** 2026-04-07  
**Author:** QA Security Agent  
**Status:** Draft - Awaiting ProdEng RBAC Implementation Review

---

## Executive Summary

This penetration test plan validates the RBAC (Role-Based Access Control) implementation for PropertyOps AI's transition from Owner-only to multi-tenant SaaS architecture. The test suite ensures **ZERO tolerance** for:

1. Cross-tenant data leakage
2. Privilege escalation attacks
3. Unauthorized access to restricted endpoints

---

## RBAC Structure Under Test

### User Roles

| Role | Portal | Access Scope | Restrictions |
|------|--------|--------------|--------------|
| **Owner** (David) | Admin Dashboard | Full fleet oversight, all properties, financial approvals, nightly exception reports | None |
| **Landlord** (Laura Portal) | Landlord Portal | Forensic Document Integrity Reports only | Restricted to assigned properties only, NO financial approvals, NO access to other landlords' data |
| **Tenant** (Tony Portal) | Tenant Portal | Maintenance messaging, status tracking | Restricted to their unit only, NO landlord-level data, NO access to other tenants' data |

---

## Test Categories

### 1. Role Escalation Attempts

**Objective:** Verify users cannot escalate privileges or access higher-role endpoints.

| Test ID | Test Case | Attack Vector | Expected Result |
|---------|-----------|---------------|-----------------|
| RE-01 | Tenant → Landlord escalation | Tenant attempts to access `/api/landlord/*` endpoints | 403 Forbidden |
| RE-02 | Tenant → Owner escalation | Tenant attempts to access `/api/owner/*` endpoints | 403 Forbidden |
| RE-03 | Landlord → Owner escalation | Landlord attempts to access `/api/owner/financial-approvals` | 403 Forbidden |
| RE-04 | Role parameter manipulation | Modify JWT payload or session to change role claim | 403 Forbidden / Token invalidation |
| RE-05 | Direct endpoint access | Tenant accesses landlord-only API routes directly | 403 Forbidden |
| RE-06 | Admin endpoint probing | Non-owner accesses `/api/admin/*` routes | 403 Forbidden |

---

### 2. Cross-Property Access Attempts

**Objective:** Verify users cannot access data from properties they don't own/occupy.

| Test ID | Test Case | Attack Vector | Expected Result |
|---------|-----------|---------------|-----------------|
| CP-01 | Landlord A → Landlord B properties | Landlord A queries properties owned by Landlord B | 403 Forbidden / Empty result set |
| CP-02 | Tenant A → Tenant B unit | Tenant A requests maintenance requests for Tenant B's unit | 403 Forbidden |
| CP-03 | Property ID enumeration | Sequential property ID requests (e.g., `/api/properties/1`, `/api/properties/2`) | 403 for non-owned properties |
| CP-04 | UUID guessing | Attempt to access properties via guessed UUIDs | 403 for non-owned properties |
| CP-05 | Cross-tenant document access | Landlord A requests forensic reports for Landlord B's properties | 403 Forbidden |
| CP-06 | Tenant cross-unit messaging | Tenant sends maintenance request to another unit's landlord | 403 Forbidden / Request rejected |

---

### 3. API Endpoint Manipulation

**Objective:** Verify API endpoints properly validate authorization beyond UI-level checks.

| Test ID | Test Case | Attack Vector | Expected Result |
|---------|-----------|---------------|-----------------|
| AE-01 | HTTP method escalation | GET → PUT/POST/DELETE on restricted endpoints | 403 Forbidden |
| AE-02 | Parameter tampering | Modify `propertyId`, `userId`, `tenantId` in API requests | 403 Forbidden |
| AE-03 | Query parameter injection | Add `?propertyId=<other-property>` to requests | Ignored / 403 Forbidden |
| AE-04 | Path traversal | Attempt `/api/properties/../../../admin/users` | 400 Bad Request / 403 Forbidden |
| AE-05 | Batch endpoint abuse | Request bulk data across multiple properties | Filtered to authorized properties only |
| AE-06 | GraphQL/REST mixing | If GraphQL exists, attempt to bypass REST auth | 403 Forbidden |
| AE-07 | Content-Type manipulation | Change `application/json` to `application/xml` etc. | Proper validation, no bypass |

---

### 4. Session & Token Security

**Objective:** Verify session tokens cannot be manipulated to bypass RBAC.

| Test ID | Test Case | Attack Vector | Expected Result |
|---------|-----------|---------------|-----------------|
| ST-01 | JWT payload modification | Decode and modify JWT role/property claims | Token invalidation / Signature failure |
| ST-02 | Session token reuse | Use expired/revoked token | 401 Unauthorized |
| ST-03 | Cross-session token leakage | Use token from different user session | 401/403 if not matching |
| ST-04 | Token privilege downgrade | Modify token to have lower privileges, then escalate | Original privileges enforced server-side |
| ST-05 | Concurrent session testing | Same user, multiple sessions, role change in one | All sessions invalidated or updated |

---

### 5. Information Leakage

**Objective:** Verify error messages and responses don't leak sensitive information.

| Test ID | Test Case | Attack Vector | Expected Result |
|---------|-----------|---------------|-----------------|
| IL-01 | Error message analysis | Trigger 403 errors, analyze response body | Generic error, no internal details |
| IL-02 | Timing attacks | Measure response times for valid vs invalid IDs | No significant timing difference |
| IL-03 | Existence enumeration | Check if property/user exists via error codes | Uniform 403 for all unauthorized |
| IL-04 | Stack trace exposure | Trigger errors to expose stack traces | No stack traces in production |
| IL-05 | Metadata leakage | Check response headers for internal info | Clean headers, no internal URLs/versions |

---

### 6. Audit Trail Validation

**Objective:** Verify all access attempts are properly logged for forensic analysis.

| Test ID | Test Case | Expected Audit Log Entry |
|---------|-----------|-------------------------|
| AT-01 | Successful authorized access | `userId`, `propertyId`, `action`, `timestamp`, `result: success` |
| AT-02 | Failed unauthorized access | `userId`, `propertyId`, `action`, `timestamp`, `result: forbidden`, `reason` |
| AT-03 | Role escalation attempt | `userId`, `attemptedRole`, `currentRole`, `action`, `timestamp`, `result: blocked` |
| AT-04 | Cross-property access attempt | `userId`, `targetPropertyId`, `authorizedProperties[]`, `timestamp`, `result: blocked` |
| AT-05 | Token manipulation attempt | `userId`, `tokenId`, `manipulationType`, `timestamp`, `result: invalid` |

---

## Manual Testing Procedures

### Prerequisites

1. **Test Accounts Required:**
   - Owner account (David)
   - Landlord A account (Laura Portal - Property Set A)
   - Landlord B account (Laura Portal - Property Set B)
   - Tenant A account (Tony Portal - Unit A)
   - Tenant B account (Tony Portal - Unit B)

2. **Test Data Required:**
   - Minimum 2 properties per landlord
   - Minimum 2 tenants per property
   - Sample maintenance requests per tenant
   - Sample forensic documents per landlord

3. **Tools Required:**
   - Postman or Insomnia for API testing
   - Browser DevTools for session inspection
   - JWT decoder (e.g., jwt.io)
   - curl for command-line testing
   - Burp Suite or OWASP ZAP (optional, for advanced testing)

---

### Manual Test Execution Steps

#### RE-01: Tenant → Landlord Escalation

```bash
# 1. Authenticate as Tenant A
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "tenant-a@example.com", "password": "test123"}'

# 2. Extract session token from response cookies

# 3. Attempt to access landlord endpoint
curl -X GET http://localhost:3000/api/landlord/forensic-reports \
  -H "Cookie: next-auth.session-token=<TOKEN>"

# Expected: 403 Forbidden
```

#### CP-03: Property ID Enumeration

```bash
# 1. Authenticate as Landlord A (owns properties 1, 2, 3)

# 2. Enumerate property IDs
for i in {1..10}; do
  curl -X GET "http://localhost:3000/api/properties/$i" \
    -H "Cookie: next-auth.session-token=<TOKEN>" \
    -w "Property $i: %{http_code}\n"
done

# Expected: 200 for properties 1-3, 403 for 4-10
```

#### ST-01: JWT Payload Modification

```bash
# 1. Extract JWT from session token
# 2. Decode JWT at jwt.io
# 3. Modify role claim: "role": "tenant" → "role": "owner"
# 4. Re-sign token (will fail without secret) OR send modified unsigned token

# 5. Send request with modified token
curl -X GET http://localhost:3000/api/owner/exception-report \
  -H "Cookie: next-auth.session-token=<MODIFIED_TOKEN>"

# Expected: 401 Unauthorized (signature verification failure)
```

---

## Automated Test Suite

See: `rbac-security.test.ts` for Jest + Supertest implementation.

---

## Pass/Fail Criteria

**DEPLOYMENT BLOCKERS (Any failure prevents deployment):**

- ❌ Any cross-tenant data leakage (CP-01 through CP-06)
- ❌ Any successful privilege escalation (RE-01 through RE-06)
- ❌ Any API endpoint accessible without proper authorization (AE-01 through AE-07)
- ❌ Any JWT/session manipulation success (ST-01 through ST-05)
- ❌ Information leakage revealing internal structure (IL-01 through IL-05)

**DEPLOYMENT WARNINGS (Should be fixed, but may not block with mitigation):**

- ⚠️ Audit trail gaps (AT-01 through AT-05)
- ⚠️ Minor timing discrepancies
- ⚠️ Non-critical error message improvements

---

## Sign-Off Requirements

Before production deployment, the following must be completed:

- [ ] All automated tests pass (100% pass rate required)
- [ ] All manual test cases executed and documented
- [ ] Zero CRITICAL or HIGH severity vulnerabilities
- [ ] All MEDIUM severity issues have documented mitigations
- [ ] Audit trail validation complete
- [ ] Security checklist reviewed and signed

**Required Signatures:**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| ProdEng Lead | | | |
| CEO (Hermes) | | | |
| Security Auditor | | | |

---

## Vulnerability Reporting

**CRITICAL:** Any vulnerabilities discovered during testing must be reported immediately to Hermes (CEO) via:

- **Telegram:** @estebandq
- **Priority:** Mark as [SECURITY CRITICAL] in subject
- **Content:** Include test case ID, reproduction steps, and severity assessment

**Do not** approve deployment until all CRITICAL and HIGH vulnerabilities are remediated and re-tested.

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-07 | QA Security Agent | Initial draft |
| | | | |

---

**CONFIDENTIAL - PropertyOps AI Internal Use Only**
