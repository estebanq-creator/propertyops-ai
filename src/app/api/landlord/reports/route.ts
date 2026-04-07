/**
 * GET /api/landlord/reports
 * 
 * Returns ONLY approved forensic document integrity reports for the authenticated landlord.
 * 
 * COMPLIANCE CRITICAL:
 * - NO scores, grades, or derived metrics
 * - NO pass/fail verdicts
 * - NO credit decisions or recommendations
 * - ONLY anomaly flags with evidence citations
 * - Review gate enforced: only reports with status='approved' are returned
 */

import { NextRequest, NextResponse } from 'next/server';
import { sampleReports } from '@/lib/landlord-seed';

// In-memory store for demo (replace with database in production)
const reportsStore = new Map(sampleReports.map(r => [r.id, r]));

export async function GET(request: NextRequest) {
  try {
    // Extract landlord ID from query params or auth context
    // For demo: use 'landlord-001' as default
    const searchParams = request.nextUrl.searchParams;
    const landlordId = searchParams.get('landlordId') || 'landlord-001';

    // Get all reports for this landlord
    const allReports = Array.from(reportsStore.values()).filter(
      r => r.landlordId === landlordId
    );

    // COMPLIANCE: Only return approved reports to landlords
    const approvedReports = allReports.filter(r => r.status === 'approved');

    // Transform to forensic-only format (strip any internal fields)
    const forensicReports = approvedReports.map(report => ({
      id: report.id,
      propertyId: report.propertyId,
      tenantName: report.tenantName,
      documentType: report.documentType,
      anomalies: report.anomalies.map(anomaly => ({
        type: anomaly.type,
        severity: anomaly.severity,
        evidence: anomaly.evidence,
        location: anomaly.location,
      })),
      createdAt: report.createdAt,
      reviewedAt: report.reviewedAt,
    }));

    return NextResponse.json({
      success: true,
      data: forensicReports,
      meta: {
        total: allReports.length,
        approved: approvedReports.length,
        pending: allReports.filter(r => r.status === 'pending_review').length,
        rejected: allReports.filter(r => r.status === 'rejected').length,
        // Review gate counter
        reviewGate: {
          totalRequired: 50,
          validated: approvedReports.length + allReports.filter(r => r.status === 'rejected').length,
          remaining: 50 - (approvedReports.length + allReports.filter(r => r.status === 'rejected').length),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching landlord reports:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reports',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
