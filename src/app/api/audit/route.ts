import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';
import { canViewAuditLogs } from '@/lib/rbac';

/**
 * GET /api/audit
 * Fetch audit logs - restricted to owner role only
 */
export async function GET() {
  try {
    // Get authenticated user
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userRole = (session.user as any).role as UserRole;
    
    // Audit logs are owner-only
    if (!canViewAuditLogs(userRole)) {
      return NextResponse.json(
        { error: 'Access denied: owner role required' },
        { status: 403 }
      );
    }
    
    // TODO: Fetch audit logs from Paperclip API when available
    // For now, return empty array
    return NextResponse.json([]);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch audit logs';
    const isAuthError = errorMessage.includes('401') || errorMessage.includes('403');
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('timeout');
    
    return NextResponse.json(
      { 
        error: errorMessage,
        errorType: isAuthError ? 'AUTH' : isNetworkError ? 'NETWORK' : 'UNKNOWN',
      },
      { status: isAuthError ? 401 : isNetworkError ? 503 : 500 }
    );
  }
}
