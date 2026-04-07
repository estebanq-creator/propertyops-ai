// Authentication Helpers with RBAC Support
// PropertyOps AI - next-auth v5 Integration

import { auth } from '@/lib/auth';
import { UserRole, User } from '@/types';

/**
 * Extended session user with RBAC fields
 */
export interface SessionUser extends User {
  role: UserRole;
  propertyIds: string[];
  landlordId?: string;
}

/**
 * Get current session with role information
 * Returns null if not authenticated
 */
export async function getSessionWithRole(): Promise<{
  user: SessionUser | null;
  isAuthenticated: boolean;
} | null> {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return {
        user: null,
        isAuthenticated: false,
      };
    }
    
    return {
      user: {
        id: session.user.id || '',
        email: session.user.email || '',
        name: session.user.name || '',
        role: (session.user.role as UserRole) || 'tenant',
        propertyIds: (session.user.propertyIds as string[]) || [],
        landlordId: session.user.landlordId as string | undefined,
      },
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

/**
 * Get current session with role, throws if not authenticated
 */
export async function requireAuth(): Promise<{
  user: SessionUser;
}> {
  const session = await getSessionWithRole();
  
  if (!session || !session.isAuthenticated || !session.user) {
    throw new Error('Authentication required');
  }
  
  return { user: session.user };
}

/**
 * Require specific role for access
 * Throws error if user doesn't have required role
 */
export async function requireRole(requiredRole: UserRole): Promise<{
  user: SessionUser;
}> {
  const { user } = await requireAuth();
  
  if (user.role !== requiredRole) {
    throw new Error(
      `Access denied: ${requiredRole} role required (current: ${user.role})`
    );
  }
  
  return { user };
}

/**
 * Require one of multiple roles
 */
export async function requireAnyRole(allowedRoles: UserRole[]): Promise<{
  user: SessionUser;
}> {
  const { user } = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error(
      `Access denied: one of ${allowedRoles.join(', ')} roles required (current: ${user.role})`
    );
  }
  
  return { user };
}

/**
 * Check if user can access a property (convenience wrapper)
 */
export async function requirePropertyAccess(propertyId: string): Promise<{
  user: SessionUser;
}> {
  const { user } = await requireAuth();
  
  // Owner has access to everything
  if (user.role === 'owner') {
    return { user };
  }
  
  // Check property access
  if (!user.propertyIds.includes(propertyId)) {
    throw new Error(
      `Access denied: User cannot access property ${propertyId}`
    );
  }
  
  return { user };
}

/**
 * Validate session has required fields for RBAC
 */
export function validateSessionUser(user: any): user is SessionUser {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string' &&
    Array.isArray(user.propertyIds)
  );
}
