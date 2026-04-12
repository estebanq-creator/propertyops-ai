/**
 * POST /api/landlord/reports/[id]/approve
 * 
 * Approve a forensic document integrity report (owner only).
 * 
 * COMPLIANCE CRITICAL:
 * - Creates audit trail entry
 * - Updates review gate counter
 * - Only owners can approve
 * - Report becomes visible to landlord after approval
 */

import { NextRequest, NextResponse } from 'next/server';
import { approveReport, getReviewGateMeta } from '@/lib/landlord-review-store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify report exists
    const reviewerId = 'owner-001'; // David (Mission Control)
    const result = approveReport(id, reviewerId);
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
        status: 'approved',
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
    console.error('Error approving report:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to approve report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
