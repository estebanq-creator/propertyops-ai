import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';

/**
 * GET /api/notifications
 * Fetch notifications - all authenticated users can see their notifications
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
    
    const userId = (session.user as any).id as string;
    const userRole = (session.user as any).role as UserRole;
    const userPropertyIds = (session.user as any).propertyIds as string[] || [];
    
    // TODO: Fetch notifications from Paperclip API when available
    // Notifications should be scoped by userId and propertyIds
    // For now, return empty array
    return NextResponse.json({
      notifications: [],
      count: 0,
      userId,
      role: userRole,
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
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
