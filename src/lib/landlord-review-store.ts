import { sampleReports, type ForensicReport } from '@/lib/landlord-seed';

export interface ReviewAuditEntry {
  id: string;
  timestamp: string;
  action: 'report_approved' | 'report_rejected';
  actor: string;
  reportId: string;
  details: Record<string, unknown>;
}

export type MutableForensicReport = ForensicReport & {
  rejectionReason?: string;
  submitterEmail?: string;
};

interface LandlordReviewStore {
  reports: Map<string, MutableForensicReport>;
  auditLog: ReviewAuditEntry[];
}

declare global {
  var __landlordReviewStore__: LandlordReviewStore | undefined;
}

function cloneReport(report: ForensicReport): MutableForensicReport {
  return {
    ...report,
    anomalies: report.anomalies.map((anomaly) => ({ ...anomaly })),
  };
}

function createStore(): LandlordReviewStore {
  return {
    reports: new Map(sampleReports.map((report) => [report.id, cloneReport(report)])),
    auditLog: [],
  };
}

function getStore(): LandlordReviewStore {
  if (!globalThis.__landlordReviewStore__) {
    globalThis.__landlordReviewStore__ = createStore();
  }
  return globalThis.__landlordReviewStore__;
}

export function listReports(): MutableForensicReport[] {
  return Array.from(getStore().reports.values());
}

export function getReport(reportId: string): MutableForensicReport | undefined {
  return getStore().reports.get(reportId);
}

export function approveReport(reportId: string, reviewerId: string) {
  const store = getStore();
  const report = store.reports.get(reportId);

  if (!report) {
    return null;
  }

  const reviewedAt = new Date().toISOString();
  const updatedReport: MutableForensicReport = {
    ...report,
    status: 'approved',
    reviewedAt,
    reviewedBy: reviewerId,
    rejectionReason: undefined,
  };

  store.reports.set(reportId, updatedReport);

  const auditEntry: ReviewAuditEntry = {
    id: `audit-${Date.now()}`,
    timestamp: reviewedAt,
    action: 'report_approved',
    actor: reviewerId,
    reportId,
    details: {
      previousStatus: report.status,
      newStatus: 'approved',
      landlordId: report.landlordId,
      propertyId: report.propertyId,
      anomalyCount: report.anomalies.length,
    },
  };

  store.auditLog.push(auditEntry);

  return {
    report: updatedReport,
    auditEntry,
  };
}

export function rejectReport(reportId: string, reviewerId: string, reason?: string) {
  const store = getStore();
  const report = store.reports.get(reportId);

  if (!report) {
    return null;
  }

  const reviewedAt = new Date().toISOString();
  const rejectionReason = reason || 'Not specified';
  const updatedReport: MutableForensicReport = {
    ...report,
    status: 'rejected',
    reviewedAt,
    reviewedBy: reviewerId,
    rejectionReason,
  };

  store.reports.set(reportId, updatedReport);

  const auditEntry: ReviewAuditEntry = {
    id: `audit-${Date.now()}`,
    timestamp: reviewedAt,
    action: 'report_rejected',
    actor: reviewerId,
    reportId,
    details: {
      previousStatus: report.status,
      newStatus: 'rejected',
      landlordId: report.landlordId,
      propertyId: report.propertyId,
      anomalyCount: report.anomalies.length,
      reason: rejectionReason,
    },
  };

  store.auditLog.push(auditEntry);

  return {
    report: updatedReport,
    auditEntry,
  };
}

export function getReviewGateMeta(reports = listReports()) {
  const validated = reports.filter(
    (report) => report.status === 'approved' || report.status === 'rejected'
  ).length;
  const approved = reports.filter((report) => report.status === 'approved').length;
  const rejected = reports.filter((report) => report.status === 'rejected').length;

  return {
    totalRequired: 50,
    validated,
    remaining: Math.max(0, 50 - validated),
    bypassEnabled: validated >= 50,
    percentComplete: Math.round((validated / 50) * 100),
    approved,
    rejected,
  };
}

export function getAuditLog() {
  return [...getStore().auditLog];
}

export function addReport(report: Omit<MutableForensicReport, never>): void {
  const store = getStore();
  store.reports.set(report.id, { ...report });
}
