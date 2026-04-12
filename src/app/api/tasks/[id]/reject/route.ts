import { NextResponse } from 'next/server';
import { paperclipRequest, setIssueStatus } from '@/lib/paperclip';

const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || 'edea9103-a49f-487f-901f-05b2753b965d';

/**
 * POST /api/tasks/[id]/reject
 * Reject/cancel a task and update its status in Paperclip
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Cancel the issue using the canonical direct issue route.
    await setIssueStatus(id, 'cancelled', 'Rejected from Mission Control task queue');
    
    // Create an audit log entry
    await paperclipRequest(
      `/companies/${COMPANY_ID}/audit-logs`,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'TASK_REJECTED',
          target: id,
          details: { rejectedAt: new Date().toISOString() },
        }),
      }
    ).catch(() => {
      // Audit log creation is best-effort
      console.warn('Failed to create audit log for task rejection');
    });
    
    return NextResponse.json({
      success: true,
      taskId: id,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to reject task:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to reject task';
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error && error.message.includes('401') ? 401 : 500 }
    );
  }
}
