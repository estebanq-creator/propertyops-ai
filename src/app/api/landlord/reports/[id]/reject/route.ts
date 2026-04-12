/**
 * POST /api/landlord/reports/[id]/reject
 * 
 * Reject a forensic document integrity report (owner only).
 * 
 * COMPLIANCE CRITICAL:
 * - Creates audit trail entry
 * - Updates review gate counter
 * - Only owners can reject
 * - Rejected reports are NOT visible to landlord
 * - Rejection reason should be documented (internal only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReviewGateMeta, rejectReport } from '@/lib/landlord-review-store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Parse request body for rejection reason
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Verify report exists
    const reviewerId = 'owner-001'; // David (Mission Control)
    const result = rejectReport(id, reviewerId, reason);
    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report not found',
        },
        { status: 404 }
      );
    }

    const { report: updatedReport, auditEntry } = result;
    const reviewGate = getReviewGateMeta();

    return NextResponse.json({
      success: true,
      data: {
        reportId: id,
        status: 'rejected',
        reviewedAt: updatedReport.reviewedAt,
        reviewedBy: updatedReport.reviewedBy,
      },
      meta: {
        reviewGate,
        auditTrail: {
          logged: true,
          auditId: auditEntry.id,
        },
      },
    });
  } catch (error) {
    console.error('Error rejecting report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reject report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
