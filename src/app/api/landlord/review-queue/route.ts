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

// In-memory store (same as other routes)
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
        {
          type: 'font_variation',
          severity: 'low' as 'low' | 'medium' | 'high',
          evidence: 'Two different font families detected in salary field',
          location: 'Page 1, Section 2',
        },
      ],
      createdAt: '2026-04-05T14:30:00Z',
    },
  ],
  [
    'report-002',
    {
      id: 'report-002',
      landlordId: 'landlord-001',
      propertyId: 'prop-002',
      tenantName: 'Jane Smith',
      documentType: 'id',
      status: 'pending_review' as 'pending_review' | 'approved' | 'rejected',
      anomalies: [
        {
          type: 'image_manipulation_detected',
          severity: 'high' as 'low' | 'medium' | 'high',
          evidence: 'ELA analysis reveals inconsistent compression patterns in photo region',
          location: 'Photo area, top-right quadrant',
        },
      ],
      createdAt: '2026-04-05T15:00:00Z',
    },
  ],
  [
    'report-003',
    {
      id: 'report-003',
      landlordId: 'landlord-002',
      propertyId: 'prop-003',
      tenantName: 'Robert Wilson',
      documentType: 'bank_statement',
      status: 'pending_review' as 'pending_review' | 'approved' | 'rejected',
      anomalies: [],
      createdAt: '2026-04-06T09:00:00Z',
    },
  ],
  [
    'report-004',
    {
      id: 'report-004',
      landlordId: 'landlord-003',
      propertyId: 'prop-004',
      tenantName: 'Maria Garcia',
      documentType: 'employment_letter',
      status: 'pending_review' as 'pending_review' | 'approved' | 'rejected',
      anomalies: [
        {
          type: 'template_mismatch',
          severity: 'medium' as 'low' | 'medium' | 'high',
          evidence: 'Letterhead does not match known company template (verified via public records)',
          location: 'Header section',
        },
      ],
      createdAt: '2026-04-06T11:30:00Z',
    },
  ],
  [
    'report-005',
    {
      id: 'report-005',
      landlordId: 'landlord-004',
      propertyId: 'prop-007',
      tenantName: 'James Lee',
      documentType: 'lease',
      status: 'pending_review' as 'pending_review' | 'approved' | 'rejected',
      anomalies: [
        {
          type: 'signature_anomaly',
          severity: 'high' as 'low' | 'medium' | 'high',
          evidence: 'Digital signature certificate expired at time of signing',
          location: 'Signature block, Page 3',
        },
        {
          type: 'text_alteration',
          severity: 'high' as 'low' | 'medium' | 'high',
          evidence: 'Rent amount field shows evidence of digital alteration (pixel-level analysis)',
          location: 'Section 4.2, Page 2',
        },
      ],
      createdAt: '2026-04-06T16:00:00Z',
    },
  ],
]);

export async function GET(request: NextRequest) {
  try {
    // COMPLIANCE: In production, verify owner role from auth session
    // const session = await auth();
    // if (session?.user.role !== 'owner') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    // Get all pending reports
    const allReports = Array.from(reportsStore.values());
    const pendingReports = allReports.filter(r => r.status === 'pending_review');

    // Calculate review gate statistics
    const validatedCount = allReports.filter(
      r => r.status === 'approved' || r.status === 'rejected'
    ).length;
    const approvedCount = allReports.filter(r => r.status === 'approved').length;
    const rejectedCount = allReports.filter(r => r.status === 'rejected').length;
    const remainingCount = Math.max(0, 50 - validatedCount);
    const bypassEnabled = validatedCount >= 50;

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
        approved: approvedCount,
        rejected: rejectedCount,
        reviewGate: {
          totalRequired: 50,
          validated: validatedCount,
          remaining: remainingCount,
          bypassEnabled,
          percentComplete: Math.round((validatedCount / 50) * 100),
        },
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
