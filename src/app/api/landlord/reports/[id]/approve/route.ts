/**
 * POST /api/landlord/reports/[id]/approve
 *
 * Approve a forensic document integrity report (owner only).
 * On approval: report becomes visible to landlord AND email is sent if submitterEmail is set.
 */

import { NextRequest, NextResponse } from 'next/server';
import { approveReport, getReviewGateMeta } from '@/lib/landlord-review-store';
import { sendReportEmail } from '@/lib/email-delivery';
import { getAllLandlordsWithProperties } from '@/lib/landlord-seed';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reviewerId = 'owner-001';
    const result = approveReport(id, reviewerId);
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    const { report: updatedReport, auditEntry } = result;
    const reviewGate = getReviewGateMeta();

    // Email delivery — only if submitterEmail is recorded
    let emailDelivery: { attempted: boolean; success?: boolean; messageId?: string; error?: string; reason?: string };
    const emailRecipient = updatedReport.submitterEmail;

    if (emailRecipient) {
      const allLandlords = getAllLandlordsWithProperties();
      const landlord = allLandlords.find(l => l.id === updatedReport.landlordId);
      const emailResult = await sendReportEmail({
        toEmail: emailRecipient,
        toName: landlord?.name || 'Landlord',
        tenantName: updatedReport.tenantName,
        documentType: updatedReport.documentType,
        anomalies: updatedReport.anomalies,
        reportId: id,
        createdAt: updatedReport.createdAt,
      });
      emailDelivery = { attempted: true, ...emailResult };
    } else {
      emailDelivery = { attempted: false, reason: 'No delivery email on record for this submission' };
    }

    return NextResponse.json({
      success: true,
      data: {
        reportId: id,
        status: 'approved',
        reviewedAt: updatedReport.reviewedAt,
        reviewedBy: updatedReport.reviewedBy,
        emailDelivery,
      },
      meta: {
        reviewGate,
        auditTrail: { logged: true, auditId: auditEntry.id },
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
