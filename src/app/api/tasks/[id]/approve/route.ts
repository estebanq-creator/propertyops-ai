import { NextResponse } from 'next/server';
import { paperclipRequest } from '@/lib/paperclip';

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
    
    // Update the issue status to 'in_progress' to indicate approval
    await paperclipRequest(
      `/companies/${COMPANY_ID}/issues/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'in_progress',
        }),
      }
    );
    
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
