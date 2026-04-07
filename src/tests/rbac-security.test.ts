/**
 * RBAC Security Tests
 * PropertyOps AI - Role-Based Access Control Validation
 * 
 * Run: npm test -- rbac-security
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hasRole,
  hasAnyRole,
  canAccessProperty,
  filterAccessibleProperties,
  getPropertyScopeFilter,
  validatePropertyAccess,
  getDashboardRoute,
  canPerformFinancialOps,
  canViewDocumentReports,
  canCreateMaintenanceRequests,
  canViewSystemHealth,
  canViewAuditLogs,
} from '@/lib/rbac';
import { UserRole } from '@/types';

describe('RBAC Security', () => {
  // Test data
  const ownerUser = {
    role: 'owner' as UserRole,
    propertyIds: [],
  };
  
  const landlordUser = {
    role: 'landlord' as UserRole,
    propertyIds: ['prop-1', 'prop-2'],
  };
  
  const tenantUser = {
    role: 'tenant' as UserRole,
    propertyIds: ['prop-1'],
  };
  
  const allProperties = [
    { id: 'prop-1' },
    { id: 'prop-2' },
    { id: 'prop-3' },
  ];

  describe('Role Checks', () => {
    it('should validate owner role correctly', () => {
      expect(hasRole(ownerUser.role, 'owner')).toBe(true);
      expect(hasRole(landlordUser.role, 'owner')).toBe(false);
      expect(hasRole(tenantUser.role, 'owner')).toBe(false);
    });

    it('should validate landlord role correctly', () => {
      expect(hasRole(landlordUser.role, 'landlord')).toBe(true);
      expect(hasRole(ownerUser.role, 'landlord')).toBe(false);
      expect(hasRole(tenantUser.role, 'landlord')).toBe(false);
    });

    it('should validate tenant role correctly', () => {
      expect(hasRole(tenantUser.role, 'tenant')).toBe(true);
      expect(hasRole(ownerUser.role, 'tenant')).toBe(false);
      expect(hasRole(landlordUser.role, 'tenant')).toBe(false);
    });

    it('should handle undefined roles safely', () => {
      expect(hasRole(undefined, 'owner')).toBe(false);
      expect(hasRole(undefined, 'landlord')).toBe(false);
      expect(hasRole(undefined, 'tenant')).toBe(false);
    });
  });

  describe('Property Access Control', () => {
    it('owner should have access to all properties', () => {
      expect(canAccessProperty(ownerUser.role, ownerUser.propertyIds, 'prop-1')).toBe(true);
      expect(canAccessProperty(ownerUser.role, ownerUser.propertyIds, 'prop-999')).toBe(true);
      expect(canAccessProperty(ownerUser.role, ownerUser.propertyIds, 'any-property')).toBe(true);
    });

    it('landlord should only access assigned properties', () => {
      expect(canAccessProperty(landlordUser.role, landlordUser.propertyIds, 'prop-1')).toBe(true);
      expect(canAccessProperty(landlordUser.role, landlordUser.propertyIds, 'prop-2')).toBe(true);
      expect(canAccessProperty(landlordUser.role, landlordUser.propertyIds, 'prop-3')).toBe(false);
    });

    it('tenant should only access assigned property', () => {
      expect(canAccessProperty(tenantUser.role, tenantUser.propertyIds, 'prop-1')).toBe(true);
      expect(canAccessProperty(tenantUser.role, tenantUser.propertyIds, 'prop-2')).toBe(false);
      expect(canAccessProperty(tenantUser.role, tenantUser.propertyIds, 'prop-3')).toBe(false);
    });

    it('should deny access for undefined role', () => {
      expect(canAccessProperty(undefined, [], 'prop-1')).toBe(false);
    });

    it('should deny access for undefined propertyIds', () => {
      expect(canAccessProperty('landlord', undefined, 'prop-1')).toBe(false);
    });
  });

  describe('Property Filtering', () => {
    it('owner should see all properties', () => {
      const filtered = filterAccessibleProperties(
        ownerUser.role,
        ownerUser.propertyIds,
        allProperties
      );
      expect(filtered).toHaveLength(3);
      expect(filtered.map(p => p.id)).toEqual(['prop-1', 'prop-2', 'prop-3']);
    });

    it('landlord should see only assigned properties', () => {
      const filtered = filterAccessibleProperties(
        landlordUser.role,
        landlordUser.propertyIds,
        allProperties
      );
      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p.id)).toEqual(['prop-1', 'prop-2']);
    });

    it('tenant should see only assigned property', () => {
      const filtered = filterAccessibleProperties(
        tenantUser.role,
        tenantUser.propertyIds,
        allProperties
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('prop-1');
    });

    it('should return empty array for undefined role', () => {
      const filtered = filterAccessibleProperties(
        undefined,
        [],
        allProperties
      );
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Database Query Scoping', () => {
    it('owner should have no WHERE clause restriction', () => {
      const filter = getPropertyScopeFilter(ownerUser.role, ownerUser.propertyIds);
      expect(filter).toBe('');
    });

    it('landlord should have IN clause for propertyIds', () => {
      const filter = getPropertyScopeFilter(landlordUser.role, landlordUser.propertyIds);
      expect(filter).toContain('propertyId IN');
      expect(filter).toContain("'prop-1'");
      expect(filter).toContain("'prop-2'");
    });

    it('tenant should have IN clause for single property', () => {
      const filter = getPropertyScopeFilter(tenantUser.role, tenantUser.propertyIds);
      expect(filter).toContain('propertyId IN');
      expect(filter).toContain("'prop-1'");
    });

    it('should return restrictive filter for undefined role', () => {
      const filter = getPropertyScopeFilter(undefined, undefined);
      expect(filter).toBe('1=0'); // Always false
    });
  });

  describe('Access Validation', () => {
    it('should not throw for owner accessing any property', () => {
      expect(() => {
        validatePropertyAccess('owner', [], ['prop-1', 'prop-999'], 'view');
      }).not.toThrow();
    });

    it('should not throw for landlord accessing assigned property', () => {
      expect(() => {
        validatePropertyAccess('landlord', ['prop-1'], ['prop-1'], 'view');
      }).not.toThrow();
    });

    it('should throw for landlord accessing unassigned property', () => {
      expect(() => {
        validatePropertyAccess('landlord', ['prop-1'], ['prop-3'], 'view');
      }).toThrow('Unauthorized');
    });

    it('should throw for undefined role', () => {
      expect(() => {
        validatePropertyAccess(undefined, [], ['prop-1'], 'view');
      }).toThrow('Unauthorized');
    });
  });

  describe('Dashboard Routing', () => {
    it('should route owner to /owner', () => {
      expect(getDashboardRoute('owner')).toBe('/owner');
    });

    it('should route landlord to /landlord', () => {
      expect(getDashboardRoute('landlord')).toBe('/landlord');
    });

    it('should route tenant to /tenant', () => {
      expect(getDashboardRoute('tenant')).toBe('/tenant');
    });

    it('should route undefined role to signin', () => {
      expect(getDashboardRoute(undefined)).toBe('/auth/signin');
    });
  });

  describe('Capability Checks', () => {
    describe('Financial Operations', () => {
      it('should allow only owner', () => {
        expect(canPerformFinancialOps('owner')).toBe(true);
        expect(canPerformFinancialOps('landlord')).toBe(false);
        expect(canPerformFinancialOps('tenant')).toBe(false);
        expect(canPerformFinancialOps(undefined)).toBe(false);
      });
    });

    describe('Document Reports (Laura)', () => {
      it('should allow owner and landlord', () => {
        expect(canViewDocumentReports('owner')).toBe(true);
        expect(canViewDocumentReports('landlord')).toBe(true);
        expect(canViewDocumentReports('tenant')).toBe(false);
        expect(canViewDocumentReports(undefined)).toBe(false);
      });
    });

    describe('Maintenance Requests (Tony)', () => {
      it('should allow owner and tenant', () => {
        expect(canCreateMaintenanceRequests('owner')).toBe(true);
        expect(canCreateMaintenanceRequests('tenant')).toBe(true);
        expect(canCreateMaintenanceRequests('landlord')).toBe(false);
        expect(canCreateMaintenanceRequests(undefined)).toBe(false);
      });
    });

    describe('System Health', () => {
      it('should allow only owner', () => {
        expect(canViewSystemHealth('owner')).toBe(true);
        expect(canViewSystemHealth('landlord')).toBe(false);
        expect(canViewSystemHealth('tenant')).toBe(false);
        expect(canViewSystemHealth(undefined)).toBe(false);
      });
    });

    describe('Audit Logs', () => {
      it('should allow only owner', () => {
        expect(canViewAuditLogs('owner')).toBe(true);
        expect(canViewAuditLogs('landlord')).toBe(false);
        expect(canViewAuditLogs('tenant')).toBe(false);
        expect(canViewAuditLogs(undefined)).toBe(false);
      });
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle empty propertyIds array', () => {
      expect(canAccessProperty('landlord', [], 'prop-1')).toBe(false);
      expect(filterAccessibleProperties('landlord', [], allProperties)).toHaveLength(0);
    });

    it('should handle null/undefined inputs gracefully', () => {
      expect(() => hasRole(null as any, 'owner')).not.toThrow();
      expect(() => canAccessProperty(null as any, null as any, 'prop-1')).not.toThrow();
    });

    it('should prevent cross-tenant access', () => {
      const tenantA = { role: 'tenant' as UserRole, propertyIds: ['prop-1'] };
      const tenantBProperty = 'prop-2';
      
      expect(canAccessProperty(tenantA.role, tenantA.propertyIds, tenantBProperty)).toBe(false);
    });

    it('should prevent cross-landlord access', () => {
      const landlordA = { role: 'landlord' as UserRole, propertyIds: ['prop-1'] };
      const landlordBProperty = 'prop-3';
      
      expect(canAccessProperty(landlordA.role, landlordA.propertyIds, landlordBProperty)).toBe(false);
    });
  });
});
