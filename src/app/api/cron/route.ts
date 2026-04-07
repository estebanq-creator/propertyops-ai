import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';

/**
 * GET /api/cron
 * Fetch cron job status - restricted to owner role only
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
    
    // Cron management is owner-only
    if (userRole !== 'owner') {
      return NextResponse.json(
        { error: 'Access denied: owner role required' },
        { status: 403 }
      );
    }
    
    // TODO: Fetch cron jobs from Paperclip API when available
    // For now, return empty array
    return NextResponse.json([]);
  } catch (error) {
    console.error('Failed to fetch cron jobs:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cron jobs';
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
