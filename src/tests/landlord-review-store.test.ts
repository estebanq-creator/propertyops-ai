import { beforeEach, describe, expect, it } from 'vitest';

declare global {
  var __landlordReviewStore__:
    | {
        reports: Map<string, unknown>;
        auditLog: Array<unknown>;
      }
    | undefined;
}

describe('landlord review store', () => {
  beforeEach(() => {
    global.__landlordReviewStore__ = undefined;
  });

  it('keeps review queue and landlord-visible reports in sync after approval', async () => {
    const store = await import('@/lib/landlord-review-store');

    const beforeApproval = store.listReports();
    expect(beforeApproval.find((report) => report.id === 'report-001')?.status).toBe('pending_review');

    const approved = store.approveReport('report-001', 'owner-001');
    expect(approved?.report.status).toBe('approved');

    const afterApproval = store.listReports();
    expect(afterApproval.find((report) => report.id === 'report-001')?.status).toBe('approved');

    const landlordReports = afterApproval.filter(
      (report) => report.landlordId === 'landlord-001' && report.status === 'approved'
    );
    expect(landlordReports.some((report) => report.id === 'report-001')).toBe(true);

    const reviewGate = store.getReviewGateMeta(afterApproval);
    expect(reviewGate.validated).toBe(1);
    expect(reviewGate.approved).toBe(1);
    expect(reviewGate.rejected).toBe(0);
  });

  it('records rejection reason and audit metadata', async () => {
    const store = await import('@/lib/landlord-review-store');

    const rejected = store.rejectReport('report-002', 'owner-001', 'Manipulation confirmed');
    expect(rejected?.report.status).toBe('rejected');
    expect(rejected?.report.rejectionReason).toBe('Manipulation confirmed');

    const auditLog = store.getAuditLog();
    expect(auditLog).toHaveLength(1);
    expect(auditLog[0]?.action).toBe('report_rejected');
    expect(auditLog[0]?.reportId).toBe('report-002');
    expect(auditLog[0]?.details.reason).toBe('Manipulation confirmed');
  });
});
