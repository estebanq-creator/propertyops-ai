# RBAC Migration Guide

## Overview

This guide explains how to migrate existing users to the new Role-Based Access Control (RBAC) system in PropertyOps AI Phase 3.

---

## Current State (Phase 2)

- Single user (David) with implicit `owner` role
- No property scoping
- All data accessible to authenticated user
- No multi-tenant support

---

## Target State (Phase 3)

- Three user roles: `owner`, `landlord`, `tenant`
- Property-scoped data access
- Multi-tenant SaaS architecture
- Zero cross-tenant data access

---

## Migration Steps

### Step 1: Database Schema Update

Add RBAC fields to your user storage (Paperclip API or external auth provider):

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'landlord' | 'tenant';  // NEW
  propertyIds: string[];                   // NEW
  landlordId?: string;                     // NEW (for tenants)
  createdAt: string;
  updatedAt: string;
}
```

**For existing user (David):**
```json
{
  "id": "1",
  "email": "david@propertyops.ai",
  "name": "David",
  "role": "owner",
  "propertyIds": [],
  "landlordId": null
}
```

Note: Owner has empty `propertyIds` because owner has access to ALL properties (no scoping needed).

---

### Step 2: Update Authentication Configuration

The `src/lib/auth.ts` file has been updated to include RBAC fields in JWT tokens and sessions.

**Verify the following:**
- [ ] JWT callback includes `role`, `propertyIds`, `landlordId`
- [ ] Session callback maps these fields to `session.user`
- [ ] `AUTH_SECRET` environment variable is set

---

### Step 3: Deploy Middleware

The new middleware (`src/middleware.ts` and `src/middleware/role-guard.ts`) provides:
- Route-level role protection
- Automatic redirects based on role
- API route authorization

**No action required** — middleware is automatically picked up by Next.js.

---

### Step 4: Create Landlord Users

For each landlord in your system:

1. **Create user account:**
   ```json
   {
     "email": "landlord@example.com",
     "password": "secure-password",
     "name": "Landlord Name",
     "role": "landlord",
     "propertyIds": ["property-1", "property-2"],
     "landlordId": "landlord-1"  // Same as user.id
   }
   ```

2. **Assign properties:**
   - Update property records to link to `landlordId`
   - Ensure `property.landlordId === user.id`

3. **Test access:**
   - Landlord should only see their properties
   - Landlord cannot access `/owner` routes
   - Landlord can access `/landlord` dashboard

---

### Step 5: Create Tenant Users

For each tenant:

1. **Create user account:**
   ```json
   {
     "email": "tenant@example.com",
     "password": "secure-password",
     "name": "Tenant Name",
     "role": "tenant",
     "propertyIds": ["property-1"],  // Their building
     "landlordId": "landlord-1"      // Their landlord
   }
   ```

2. **Assign unit:**
   - Link tenant to specific unit in property
   - Update unit record: `unit.tenantId === user.id`

3. **Test access:**
   - Tenant should only see their unit/property
   - Tenant cannot access other tenants' data
   - Tenant can access `/tenant` dashboard

---

### Step 6: Update API Routes

All API routes have been updated with RBAC checks:

- `/api/tasks` — Property-scoped task filtering
- `/api/health` — Limited health info for non-owners
- `/api/properties` — Returns user's accessible properties
- `/api/audit` — Owner-only access
- `/api/cron` — Owner-only access
- `/api/notifications` — User-scoped notifications

**No action required** — routes are already updated.

---

### Step 7: Test Role-Based Access

#### Owner Testing
- [ ] Can access `/owner` dashboard
- [ ] Can access all API endpoints
- [ ] Can see all properties
- [ ] Can view audit logs and cron jobs

#### Landlord Testing
- [ ] Can access `/landlord` dashboard
- [ ] Can only see assigned properties
- [ ] Cannot access `/owner` routes
- [ ] Cannot view audit logs or cron jobs
- [ ] Can view document integrity reports

#### Tenant Testing
- [ ] Can access `/tenant` dashboard
- [ ] Can only see their unit/property
- [ ] Cannot access `/owner` or `/landlord` routes
- [ ] Cannot view financial data or document reports
- [ ] Can submit maintenance requests

---

### Step 8: Security Validation

**Critical Security Checks:**

1. **Cross-tenant access:**
   ```bash
   # Login as Tenant A, try to access Tenant B's data
   # Expected: 403 Forbidden or filtered results
   ```

2. **Cross-landlord access:**
   ```bash
   # Login as Landlord A, try to access Landlord B's properties
   # Expected: Empty results or 403 Forbidden
   ```

3. **Privilege escalation:**
   ```bash
   # Try to access /owner routes as landlord/tenant
   # Expected: Redirect to appropriate dashboard
   ```

4. **API route protection:**
   ```bash
   # Call API endpoints with different role tokens
   # Expected: Proper filtering/authorization
   ```

---

## Rollback Plan

If issues arise:

1. **Revert middleware:**
   ```bash
   git checkout HEAD -- src/middleware.ts src/middleware/role-guard.ts
   ```

2. **Revert auth configuration:**
   ```bash
   git checkout HEAD -- src/lib/auth.ts
   ```

3. **Revert API routes:**
   ```bash
   git checkout HEAD -- src/app/api/*/route.ts
   ```

4. **Restart development server**

---

## Post-Migration Tasks

- [ ] Update user documentation with role-specific guides
- [ ] Create onboarding flow for new landlords/tenants
- [ ] Implement admin interface for user management
- [ ] Add audit logging for role changes
- [ ] Set up monitoring for unauthorized access attempts
- [ ] Schedule penetration testing for RBAC bypass attempts

---

## Support

For questions or issues:
- Review `src/docs/RBAC.md` for architecture details
- Check `src/lib/rbac.ts` for utility functions
- Contact PropertyOps AI engineering team

---

*Last Updated: 2026-04-07*  
*Version: 1.0.0*
