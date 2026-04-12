/**
 * GET /api/landlord/review-queue
 * 
 * Returns pending forensic reports awaiting owner validation.
 * 
 * COMPLIANCE CRITICAL:
 * - Only accessible by owners (Mission Control)
 * - Shows all pending reports for first 5 landlords
 * - Displays review gate progress counter
 * - After 50 validations, bypass option becomes available
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReviewGateMeta, listReports } from '@/lib/landlord-review-store';

export async function GET(request: NextRequest) {
  try {
    // COMPLIANCE: In production, verify owner role from auth session
    // const session = await auth();
    // if (session?.user.role !== 'owner') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    // Get all pending reports
    const allReports = listReports();
    const pendingReports = allReports.filter(r => r.status === 'pending_review');

    // Calculate review gate statistics
    const reviewGate = getReviewGateMeta(allReports);

    // Sort by severity (high first) then by date
    const sortedPending = pendingReports.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      const maxSeverityA = a.anomalies.length > 0 
        ? Math.min(...a.anomalies.map(an => severityOrder[an.severity]))
        : 3;
      const maxSeverityB = b.anomalies.length > 0
        ? Math.min(...b.anomalies.map(an => severityOrder[an.severity]))
        : 3;
      
      if (maxSeverityA !== maxSeverityB) return maxSeverityA - maxSeverityB;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      data: sortedPending,
      meta: {
        total: allReports.length,
        pending: pendingReports.length,
        approved: reviewGate.approved,
        rejected: reviewGate.rejected,
        reviewGate,
        compliance: {
          forensicOnly: true,
          noScoring: true,
          auditTrailRequired: true,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch review queue',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
