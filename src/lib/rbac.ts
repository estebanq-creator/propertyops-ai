// RBAC (Role-Based Access Control) Utilities
// PropertyOps AI - Multi-tenant Property Scoping

import { UserRole } from '@/types';

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  return userRole === requiredRole;
}

/**
 * Check if user has one of the allowed roles
 */
export function hasAnyRole(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Check if user can access a specific property
 */
export function canAccessProperty(
  userRole: UserRole | undefined,
  userPropertyIds: string[] | undefined,
  propertyId: string
): boolean {
  if (!userRole || !userPropertyIds) return false;
  
  // Owner has access to all properties
  if (userRole === 'owner') return true;
  
  // Landlord and Tenant must have property in their list
  return userPropertyIds.includes(propertyId);
}

/**
 * Filter properties by user's access rights
 */
export function filterAccessibleProperties(
  userRole: UserRole | undefined,
  userPropertyIds: string[] | undefined,
  allProperties: Array<{ id: string }>
): Array<{ id: string }> {
  if (!userRole || !userPropertyIds) return [];
  
  // Owner sees all properties
  if (userRole === 'owner') return allProperties;
  
  // Landlord and Tenant see only their properties
  return allProperties.filter(p => userPropertyIds.includes(p.id));
}

/**
 * Get property scoping filter for database queries
 * Returns a WHERE clause fragment or empty string for owner
 */
export function getPropertyScopeFilter(
  userRole: UserRole | undefined,
  userPropertyIds: string[] | undefined
): string {
  if (!userRole || !userPropertyIds) return '1=0'; // No access
  
  // Owner has no restriction
  if (userRole === 'owner') return '';
  
  // Landlord and Tenant are scoped to their properties
  const ids = userPropertyIds.map(id => `'${id}'`).join(',');
  return `propertyId IN (${ids})`;
}

/**
 * Validate that a request is within user's property scope
 * Throws error if unauthorized
 */
export function validatePropertyAccess(
  userRole: UserRole | undefined,
  userPropertyIds: string[] | undefined,
  requestedPropertyIds: string[],
  action: string = 'access'
): void {
  if (!userRole || !userPropertyIds) {
    throw new Error(`Unauthorized: User has no property access for ${action}`);
  }
  
  // Owner can access anything
  if (userRole === 'owner') return;
  
  // Check all requested properties are in user's scope
  const unauthorized = requestedPropertyIds.filter(
    id => !userPropertyIds.includes(id)
  );
  
  if (unauthorized.length > 0) {
    throw new Error(
      `Unauthorized: User cannot ${action} properties ${unauthorized.join(', ')}`
    );
  }
}

/**
 * Get dashboard route based on user role
 */
export function getDashboardRoute(role: UserRole | undefined): string {
  switch (role) {
    case 'owner':
      return '/owner';
    case 'landlord':
      return '/landlord';
    case 'tenant':
      return '/tenant';
    default:
      return '/auth/signin';
  }
}

/**
 * Check if user can perform financial operations
 */
export function canPerformFinancialOps(role: UserRole | undefined): boolean {
  return role === 'owner';
}

/**
 * Check if user can view document integrity reports (Laura portal)
 */
export function canViewDocumentReports(role: UserRole | undefined): boolean {
  return role === 'owner' || role === 'landlord';
}

/**
 * Check if user can create maintenance requests (Tony portal)
 */
export function canCreateMaintenanceRequests(role: UserRole | undefined): boolean {
  return role === 'owner' || role === 'tenant';
}

/**
 * Check if user can view system health details
 */
export function canViewSystemHealth(role: UserRole | undefined): boolean {
  return role === 'owner';
}

/**
 * Check if user can view audit logs
 */
export function canViewAuditLogs(role: UserRole | undefined): boolean {
  return role === 'owner';
}

/**
 * Create a scoped query object for database/API calls
 */
export function createScopedQuery(
  userRole: UserRole | undefined,
  userPropertyIds: string[] | undefined
): { scoped: boolean; propertyIds?: string[] } {
  if (!userRole || !userPropertyIds) {
    return { scoped: false };
  }
  
  // Owner queries are not scoped
  if (userRole === 'owner') {
    return { scoped: false };
  }
  
  // Landlord and Tenant queries are scoped
  return {
    scoped: true,
    propertyIds: userPropertyIds,
  };
}
