# RBAC Validation Report Template

| Test Case ID | Test Description | Expected Outcome | Actual Outcome | Status (Pass/Fail) | Severity | Notes |
|--------------|------------------|------------------|----------------|--------------------|----------|-------|
| RE-01 | Tenant → Landlord escalation | 403 Forbidden |  |  |  |  |
| RE-02 | Tenant → Owner escalation | 403 Forbidden |  |  |  |  |
| RE-03 | Landlord → Owner escalation | 403 Forbidden |  |  |  |  |
| RE-04 | Role parameter manipulation | 403 Forbidden / Token invalidation |  |  |  |  |
| RE-05 | Direct endpoint access | 403 Forbidden |  |  |  |  |
| RE-06 | Admin endpoint probing | 403 Forbidden |  |  |  |  |
| CP-01 | Landlord A → Landlord B properties | 403 Forbidden |  |  |  |  |
| CP-02 | Tenant A → Tenant B unit | 403 Forbidden |  |  |  |  |
| CP-03 | Property ID enumeration | 403 for non-owned |  |  |  |  |
| CP-04 | UUID guessing | 403 for non-owned |  |  |  |  |
| CP-05 | Cross-tenant document access | 403 Forbidden |  |  |  |  |
| CP-06 | Tenant cross-unit messaging | 403 Forbidden |  |  |  |  |
| AE-01 | HTTP method escalation | 403 Forbidden |  |  |  |  |
| AE-02 | Parameter tampering | 403 Forbidden |  |  |  |  |
| AE-03 | Query parameter injection | Ignored / 403 |  |  |  |  |
| AE-04 | Path traversal | 400/403 |  |  |  |  |
| AE-05 | Bulk endpoint abuse | Filtered to authorized only |  |  |  |  |
| AE-06 | GraphQL/REST mixing | 403 Forbidden |  |  |  |  |
| AE-07 | Content-Type manipulation | (no bypass) |  |  |  |  |
| ST-01 | JWT payload modification | Token invalidation |  |  |  |  |
| ST-02 | Session token reuse | 401 Unauthorized |  |  |  |  |
| ST-03 | Cross-session token leakage | 401/403 |  |  |  |  |
| ST-04 | Token privilege downgrade | Original privileges enforced |  |  |  |  |
| ST-05 | Concurrent session testing | Sessions updated/invalidate |  |  |  |  |
| IL-01 | Error message analysis | Generic error on 403 |  |  |  |  |
| IL-02 | Timing attacks | No timing difference |  |  |  |  |
| IL-03 | Existence enumeration | Uniform 403 |  |  |  |  |
| IL-04 | Stack trace exposure | No stack trace |  |  |  |  |
| IL-05 | Metadata leakage | No internal info |  |  |  |  |
| AT-01 | Successful authorized access | Audit log entries present |  |  |  |  |
| AT-02 | Failed unauthorized access | Audit log entries present |  |  |  |  |
| AT-03 | Role escalation attempt | Audit log entries present |  |  |  |  |
| AT-04 | Cross-property access attempt | Audit log entries present |  |  |  |  |
| AT-05 | Token manipulation attempt | Audit log entries present |  |  |  |  |

**Summary**

- **Total Test Cases:** 45
- **Passed:** 0
- **Failed:** 0
- **Deprecated/Skipped:** 0

**Critical Findings**

- 

**Remediation Plan**

- 

**Notes**

- 
