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

// In-memory store (replace with database in production)
// Import from same store as reports route
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
    // In production: extract from auth session
    const reviewerId = 'owner-001'; // David (Mission Control)

    // Update report status
    const updatedReport = {
      ...report,
      status: 'approved' as const,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerId,
    };

    reportsStore.set(id, updatedReport);

    // Create audit trail entry
    auditLog.push({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'report_approved',
      actor: reviewerId,
      reportId: id,
      details: {
        previousStatus: report.status,
        newStatus: 'approved',
        landlordId: report.landlordId,
        propertyId: report.propertyId,
        anomalyCount: report.anomalies.length,
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
        status: 'approved',
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
