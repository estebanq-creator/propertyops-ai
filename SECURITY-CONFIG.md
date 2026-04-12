# PropertyOps AI Control Panel — Security Configuration

**Created:** April 9, 2026  
**Last Updated:** April 9, 2026  
**Owner:** Hermes (Product Lead)

---

## Overview

This document describes the security configuration for the PropertyOps AI Mission Control (Owner Control Panel) IAM layer.

**Stack:** Next.js 15+ (App Router), TypeScript, Tailwind CSS 3.x, shadcn/ui, next-auth v5 (Auth.js)

---

## Authentication Architecture

### Session Strategy

| Setting | Value | Rationale |
|---------|-------|-----------|
| Strategy | JWT | No database required; tokens stored in cookies |
| Lifetime | 24 hours (86400s) | Standard session duration |
| Refresh | Every 15 minutes | Silent background refresh on user activity |
| Storage | HTTP-only cookies | Prevents XSS token theft |
| Security | Secure + SameSite=Strict | CSRF protection, HTTPS-only in production |

### Cookie Configuration

```typescript
cookies: {
  sessionToken: {
    name: `authjs.session-token`,
    options: {
      httpOnly: true,           // Prevents JavaScript access (XSS protection)
      secure: true,             // HTTPS-only in production
      sameSite: 'strict',       // CSRF protection
      path: '/',                // Available app-wide
      maxAge: 86400,            // 24 hours
    },
  },
}
```

### Token Refresh Mechanism

**Silent Refresh Hook:** `src/hooks/useSilentTokenRefresh.ts`

- Runs in client-side React context
- Triggers `update()` every 15 minutes while session is active
- next-auth automatically refreshes JWT if older than `updateAge` (15 min)
- Clears interval on logout
- No user interaction required

**Configuration in `src/lib/auth.ts`:**
```typescript
session: {
  strategy: 'jwt',
  maxAge: 86400,        // 24 hours
  updateAge: 900,       // 15 minutes (triggers refresh on activity)
}
```

---

## Role-Based Access Control (RBAC)

### Roles

| Role | Access Level | Use Case |
|------|--------------|----------|
| `owner` | Full system access | CEO, admin, platform operators |
| `landlord` | Property-scoped access | Pilot landlords (Phase 1) |
| `tenant` | Draft-only interface | Tenants (Phase 2 Tony beta) |

**Note:** Current Phase 1 implementation uses `owner` role for all pilot landlords. Multi-role support is scaffolded but not yet activated.

### Middleware Protection

**File:** `src/middleware/role-guard.ts`

**Protected Routes:**
- `/owner/*` — Owner dashboard (requires `owner` role)
- `/landlord/*` — Landlord portal (requires `landlord` or `owner` role)
- `/tenant/*` — Tenant interface (requires `tenant` or `owner` role)

**Public Routes:**
- `/auth/signin` — Login page
- `/auth/signout` — Logout page
- `/auth/error` — Error page
- `/api/auth/*` — Auth.js API routes

**Middleware Flow:**
1. Check if route is public → allow
2. Check if user is authenticated → redirect to signin if not
3. Check if user has required role → redirect to appropriate dashboard
4. For landlord/tenant routes, verify property access
5. Add user context headers for API routes

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH_SECRET` | 32-char random secret for JWT signing | `openssl rand -base64 32` |
| `AUTH_SESSION_MAX_AGE` | Session lifetime in seconds | `86400` |
| `AUTH_TRUST_HOST` | Trust host header (required for Vercel) | `true` |
| `NEXT_PUBLIC_APP_URL` | App base URL | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` or `production` |

### Optional (Monitoring)

| Variable | Default | Description |
|----------|---------|-------------|
| `AUDIT_LOG_RETENTION_DAYS` | 90 | Audit log retention period |
| `HEALTH_CHECK_INTERVAL_MS` | 30000 | Health check frequency |
| `ERROR_RATE_ALERT_THRESHOLD` | 0.05 | Alert on 5% error rate |
| `AUTH_FAILURE_ALERT_THRESHOLD` | 10 | Alert on 10 auth failures/hour |

---

## Security Checklist

### ✅ Implemented

- [x] JWT session strategy (no database)
- [x] HTTP-only cookies
- [x] Secure flag (production)
- [x] SameSite=Strict
- [x] 24-hour session lifetime
- [x] 15-minute silent refresh
- [x] RBAC middleware scaffolding
- [x] Role-based route protection
- [x] Property access scoping
- [x] API route authorization headers
- [x] Public route allowlist

### ⏳ Deferred (Post-Pilot)

- [ ] Rate limiting on auth endpoints
- [ ] Brute force protection (account lockout)
- [ ] 2FA/MFA support
- [ ] Session revocation API
- [ ] Audit logging for auth events
- [ ] Password policy enforcement
- [ ] OAuth provider integration (Google, Microsoft)

---

## Deployment Configuration

### Vercel Production

1. Set `AUTH_SECRET` in Vercel environment variables
2. Enable `AUTH_TRUST_HOST=true`
3. Set `NODE_ENV=production`
4. Configure custom domain (HTTPS automatic)

### Local Development

1. Copy `.env.local.example` to `.env.local`
2. Generate secret: `openssl rand -base64 32`
3. Run `npm run dev`

---

## Testing

### Manual Test Cases

1. **Session Expiry:** Wait 24 hours → verify redirect to signin
2. **Silent Refresh:** Keep tab open 30+ minutes → verify no logout
3. **Role Protection:** Access `/owner` without auth → verify redirect
4. **Cookie Security:** Inspect cookies → verify HTTP-only flag
5. **CSRF Protection:** Verify SameSite=Strict in browser dev tools

### Automated Tests (TODO)

```bash
npm run test
```

**Planned:**
- Middleware unit tests (role-guard.test.ts)
- Auth callback tests (auth.test.ts)
- Integration tests (Cypress/Playwright)

---

## Compliance Notes

**Fair Housing Act:** Authentication does not discriminate; role assignment is operational, not demographic.

**FTC Safeguards Rule:** JWT + HTTP-only cookies meet technical safeguard requirements for pilot scale.

**SOC 2 (Future):** Audit logging, access reviews, and session management will be required for enterprise compliance.

---

## References

- **Auth.js (next-auth v5):** https://authjs.dev/
- **Next.js Middleware:** https://nextjs.org/docs/app/building-your-application/routing/middleware
- **OWASP Session Management:** https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html

---

**Approved By:** ⬜ David (CEO)  
**Security Review:** ⬜ Pending  
**Phase:** 1 (Pilot-Ready)
