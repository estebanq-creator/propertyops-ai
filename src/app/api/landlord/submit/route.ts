/**
 * POST /api/landlord/submit
 * Document intake endpoint for Phase 0B Laura pipeline.
 * Accepts document text, triggers analysis, adds to review queue.
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/lib/laura-analysis';
import { addReport } from '@/lib/landlord-review-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, propertyId, tenantName, documentType, documentText, submitterEmail } = body;

    if (!landlordId || !tenantName || !documentType || !documentText) {
      return NextResponse.json(
        { success: false, error: 'landlordId, tenantName, documentType, and documentText are required' },
        { status: 400 }
      );
    }

    const validDocTypes = ['paystub', 'bank_statement', 'employment_letter', 'id', 'lease'];
    if (!validDocTypes.includes(documentType)) {
      return NextResponse.json(
        { success: false, error: `documentType must be one of: ${validDocTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Run Laura analysis
    const anomalies = await analyzeDocument(documentType, documentText, tenantName);

    // Create report in store
    const reportId = `report-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const report = {
      id: reportId,
      landlordId: landlordId as string,
      propertyId: (propertyId as string) || landlordId,
      tenantName: tenantName as string,
      documentType: documentType as 'paystub' | 'bank_statement' | 'employment_letter' | 'id' | 'lease',
      status: 'pending_review' as const,
      anomalies,
      createdAt: now,
      submitterEmail: (submitterEmail as string) || undefined,
    };

    addReport(report);

    return NextResponse.json({
      success: true,
      data: {
        reportId,
        status: 'pending_review',
        anomalyCount: anomalies.length,
        message: 'Document submitted for founder review. You will receive the report by email once reviewed.',
      },
    });
  } catch (err) {
    console.error('Submit error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Submission failed', message },
      { status: 500 }
    );
  }
}
