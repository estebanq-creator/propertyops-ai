# RBAC Security Checklist

| Item | Description | Pass/Fail | Notes |
|------|-------------|-----------|-------|
| **Session Token Validation** | JWT signatures verified, token expiration enforced | | |
| **Role-Based Route Guards** | All protected endpoints explicitly check `session.user.role` | | |
| **Resource Scoping** | Queries filter by `propertyId`, `tenantId` from session context | | |
| **No Hardcoded IDs** | Frontend never references static property / tenant IDs | | |
| **Error Response Sanitization** | Forbidden responses contain only generic message | | |
| **Audit Trail** | Every request logs `userId`, `action`, `result`, `timestamp` | | |
| **Cross-Entity References** | No direct foreign keys between tenant/landlord models exposed to clients | | |
| **Rate Limiting** | APIs throttle repeated failed attempts | | |
| **CSP & Security Headers** | `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, etc. | | |
| **Transport Layer** | All traffic over HTTPS (localhost usage restricted to dev mode) | | |
| **Authorization Header** | APIs accept bearer token only for personal access tokens | | |
| **Parameter Validation** | All parameters validated using schema (Zod) before use | | |
|
Please confirm each item passes in production. If any item is failing, note the severity and mitigation plan.
