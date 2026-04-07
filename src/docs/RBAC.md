# Role-Based Access Control (RBAC) System

## Overview

PropertyOps AI implements a multi-tenant SaaS architecture with three distinct user roles, each with specific access permissions and property scoping requirements.

## User Roles

### 1. Owner (`owner`)
**Primary User:** David (Company Founder)

**Capabilities:**
- Full fleet oversight across all properties
- Financial approvals and budget management
- Nightly Exception Report access
- All properties accessible (no property scoping restrictions)
- System administration and configuration

**Access Level:** Global (all properties, all tenants, all landlords)

---

### 2. Landlord (`landlord`)
**Portal:** Laura Portal (Forensic Document Integrity)

**Capabilities:**
- Forensic Document Integrity Reports only
- Access restricted to their specific properties
- View tenant onboarding documents
- Receive anomaly flags for document review

**Restrictions:**
- ❌ No financial data access
- ❌ No access to other landlords' properties
- ❌ No system administration
- ❌ No maintenance operations

**Access Level:** Property-scoped (only properties linked to their `landlordId`)

---

### 3. Tenant (`tenant`)
**Portal:** Tony Portal (Maintenance & Status)

**Capabilities:**
- Maintenance messaging and requests
- Status tracking for their assigned unit
- View maintenance history for their unit

**Restrictions:**
- ❌ No access to other tenants' data
- ❌ No access to landlord data
- ❌ No financial information
- ❌ No document integrity reports
- ❌ No system administration

**Access Level:** Unit-scoped (only their assigned property/unit)

---

## Data Model

### User Schema Extension

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'landlord' | 'tenant';
  propertyIds: string[];        // Properties user can access
  landlordId?: string;          // For tenants: links to their landlord
  createdAt: string;
  updatedAt: string;
}
```

### Property Scoping Model

```typescript
interface Property {
  id: string;
  name: string;
  address: string;
  landlordId: string;           // Owner landlord
  units: Unit[];
}

interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  tenantId?: string;            // Current tenant
}
```

### Relationship Chain

```
Owner (David)
  └─> All Properties (no restriction)

Landlord
  └─> Properties[landlordId === user.id]
       └─> Units[propertyId === property.id]

Tenant
  └─> Unit[tenantId === user.id]
       └─> Property[id === unit.propertyId]
            └─> Landlord[id === property.landlordId]
```

---

## Security Architecture

### Authentication Layer (next-auth v5)

**Session Token Structure:**
```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    propertyIds: string[];
    landlordId?: string;
  };
}
```

**JWT Claims:**
- `sub`: User ID
- `role`: User role
- `propertyIds`: Array of accessible property IDs
- `landlordId`: Landlord reference (for tenants)

---

### Middleware Authorization

**Route Protection:**
- `/owner/*` → Requires `role === 'owner'`
- `/landlord/*` → Requires `role === 'landlord'`
- `/tenant/*` → Requires `role === 'tenant'`

**API Route Protection:**
Every API request validates:
1. User is authenticated
2. User role has access to the route
3. Requested resources are within user's `propertyIds`

---

### Property Scoping Rules

**All Data Queries Must Include:**
```sql
WHERE propertyId IN (user.propertyIds)
```

**No Cross-Property Access:**
- Tenants cannot see other tenants in same building
- Landlords cannot see other landlords' properties
- Only Owner has global view

**Audit Trail Requirements:**
Every action logs:
- `userId`: Who performed the action
- `propertyId`: Which property was affected
- `timestamp`: When it happened
- `action`: What was done

---

## Implementation Files

```
src/
├── lib/
│   ├── auth.ts                 # next-auth configuration with roles
│   ├── auth-helpers.ts         # getSessionWithRole() helper
│   └── rbac.ts                 # Property scoping utilities
├── middleware/
│   └── role-guard.ts           # Route-level authorization
├── app/
│   ├── owner/                  # Owner dashboard (Mission Control)
│   ├── landlord/               # Landlord portal (Laura)
│   ├── tenant/                 # Tenant portal (Tony)
│   └── api/
│       ├── tasks/route.ts      # Property-scoped tasks
│       ├── health/route.ts     # Role-filtered health
│       ├── properties/route.ts # User's accessible properties
│       └── ...                 # All APIs with scoping
└── docs/
    └── RBAC.md                 # This file
```

---

## API Endpoint Behavior

### GET /api/tasks
**Owner:** All tasks across all properties  
**Landlord:** Tasks for their properties only  
**Tenant:** Maintenance tasks for their unit only

### GET /api/health
**Owner:** Full system health, all agents  
**Landlord:** Limited health (no system internals)  
**Tenant:** Basic status only

### GET /api/properties
**Owner:** All properties in system  
**Landlord:** Their properties only  
**Tenant:** Their property only

### GET /api/audit
**Owner:** Full audit trail  
**Landlord:** Audit for their properties  
**Tenant:** Audit for their unit only

---

## Backward Compatibility

**Existing Owner Account:**
- Current user (David) retains `role: 'owner'`
- All existing features continue working
- No migration required for owner account

**New Users:**
- Must be created with explicit role and property assignments
- Default role is `tenant` (most restrictive)

---

## Security Checklist

- [x] Role field added to user schema
- [x] Property scoping in all API queries
- [x] Middleware route protection
- [x] JWT claims include role and propertyIds
- [x] No cross-tenant data access
- [x] Audit trail includes userId + propertyId
- [ ] Penetration testing for privilege escalation
- [ ] Rate limiting per role
- [ ] Session invalidation on role change

---

## Migration Guide

See `MIGRATION.md` for instructions on migrating existing users to the RBAC system.

---

## Compliance Notes

**Fair Housing:**
- Laura portal provides forensic analysis only
- No scoring or screening recommendations
- Anomaly flags require human review

**PAM/PII:**
- Tenant data isolated by property
- Landlord data isolated by landlordId
- Owner access logged in audit trail

---

*Last Updated: 2026-04-07*  
*Version: 1.0.0*
