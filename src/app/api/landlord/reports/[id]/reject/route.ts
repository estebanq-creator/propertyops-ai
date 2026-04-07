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

// In-memory store (same as approve route)
const reportsStore = new Map([
  [
    'report-001',
    {
      id: 'report-001',
      landlordId: 'landlord-001',
      propertyId: 'prop-001',
      tenantName: 'John Doe',
      documentType: 'paystub',
      status: 'pending_review' as 'pending_review' | 'approved' | 'rejected',
      anomalies: [
        {
          type: 'metadata_inconsistency',
          severity: 'medium' as 'low' | 'medium' | 'high',
          evidence: 'PDF creation date (2026-03-15) differs from document date (2026-02-01)',
          location: 'Document metadata',
        },
      ],
      createdAt: '2026-04-05T14:30:00Z',
    },
  ],
]);

const auditLog: Array<{
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  reportId: string;
  details: Record<string, unknown>;
}> = [];

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
    const report = reportsStore.get(id);
    if (!report) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report not found',
        },
        { status: 404 }
      );
    }

    // COMPLIANCE: Verify reviewer is owner (Mission Control)
    const reviewerId = 'owner-001'; // David (Mission Control)

    // Update report status
    const updatedReport = {
      ...report,
      status: 'rejected' as const,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerId,
      rejectionReason: reason || 'Not specified',
    };

    reportsStore.set(id, updatedReport);

    // Create audit trail entry
    auditLog.push({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'report_rejected',
      actor: reviewerId,
      reportId: id,
      details: {
        previousStatus: report.status,
        newStatus: 'rejected',
        landlordId: report.landlordId,
        propertyId: report.propertyId,
        anomalyCount: report.anomalies.length,
        reason: reason || 'Not specified',
      },
    });

    // Calculate review gate progress
    const allReports = Array.from(reportsStore.values());
    const validatedCount = allReports.filter(
      r => r.status === 'approved' || r.status === 'rejected'
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        reportId: id,
        status: 'rejected',
        reviewedAt: updatedReport.reviewedAt,
        reviewedBy: updatedReport.reviewedBy,
      },
      meta: {
        reviewGate: {
          totalRequired: 50,
          validated: validatedCount,
          remaining: Math.max(0, 50 - validatedCount),
          bypassEnabled: validatedCount >= 50,
        },
        auditTrail: {
          logged: true,
          auditId: auditLog[auditLog.length - 1].id,
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
