import { NextResponse } from 'next/server';
import { Task, UserRole } from '@/types';
import { getIssues, mapIssueToTask } from '@/lib/paperclip';
import { auth } from '@/lib/auth';
import { filterAccessibleProperties } from '@/lib/rbac';

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
    const userPropertyIds = (session.user as any).propertyIds as string[] || [];
    
    // Fetch issues from Paperclip API
    const issuesData = await getIssues({ limit: 50 });
    
    // Map issues to our internal Task format
    let tasks: Task[] = issuesData.map((issue) => ({
      ...mapIssueToTask(issue),
      identifier: issue.identifier,
      labels: issue.labels,
      assigneeUserId: issue.assigneeUserId,
      startedAt: issue.startedAt,
      completedAt: issue.completedAt,
      cancelledAt: issue.cancelledAt,
    }));
    
    // Apply property scoping based on user role
    // Note: In Phase 2, tasks don't have propertyIds yet
    // This is a placeholder for future property-scoped task filtering
    if (userRole !== 'owner') {
      // For landlord/tenant, filter tasks by property access
      // TODO: When tasks have propertyIds, filter here:
      // tasks = tasks.filter(task => canAccessProperty(userRole, userPropertyIds, task.propertyId));
      
      // For now, non-owner users see all tasks (will be restricted when property data is available)
      console.log(`RBAC: User with role ${userRole} accessing tasks, propertyIds: ${userPropertyIds.join(', ')}`);
    }
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
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
