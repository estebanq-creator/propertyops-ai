import { NextResponse } from 'next/server';
import { getIssue, paperclipRequest, setIssueStatus } from '@/lib/paperclip';

const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || 'edea9103-a49f-487f-901f-05b2753b965d';

/**
 * POST /api/tasks/[id]/approve
 * Approve a task and update its status in Paperclip
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const issue = await getIssue(id);
    const issueStatus = issue.status.toLowerCase();

    if (issueStatus === 'in_progress') {
      return NextResponse.json({
        success: true,
        taskId: id,
        status: 'approved',
        approvedAt: issue.startedAt || new Date().toISOString(),
      });
    }

    if ((issueStatus === 'backlog' || issueStatus === 'todo') && !issue.assigneeAgentId && !issue.assigneeUserId) {
      return NextResponse.json(
        { error: 'Task must be assigned before approval' },
        { status: 409 }
      );
    }
    
    // Move the issue into active work using the canonical direct issue route.
    await setIssueStatus(id, 'in_progress', 'Approved from Mission Control task queue');
    
    // Create an audit log entry
    await paperclipRequest(
      `/companies/${COMPANY_ID}/audit-logs`,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'TASK_APPROVED',
          target: id,
          details: { approvedAt: new Date().toISOString() },
        }),
      }
    ).catch(() => {
      // Audit log creation is best-effort
      console.warn('Failed to create audit log for task approval');
    });
    
    return NextResponse.json({
      success: true,
      taskId: id,
      status: 'approved',
      approvedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to approve task:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to approve task';
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error && error.message.includes('401') ? 401 : 500 }
    );
  }
}
