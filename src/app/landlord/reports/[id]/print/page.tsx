/**
 * /landlord/reports/[id]/print — Print-ready Document Integrity Report
 * Use browser Print → Save as PDF to generate the deliverable PDF.
 */

import { getReport } from '@/lib/landlord-review-store';
import { notFound } from 'next/navigation';

const SEVERITY_LABELS: Record<string, string> = {
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

const SEVERITY_STYLES: Record<string, string> = {
  high: 'background:#fee2e2;color:#991b1b',
  medium: 'background:#fef3c7;color:#92400e',
  low: 'background:#f0fdf4;color:#166534',
};

export default async function PrintReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = getReport(id);

  if (!report || report.status !== 'approved') {
    notFound();
  }

  const dateStr = new Date(report.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Document Integrity Report — {report.tenantName}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, -apple-system, sans-serif; color: #111; background: #fff; padding: 40px; font-size: 14px; line-height: 1.5; }
          .header { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 22px; font-weight: 700; }
          .subtitle { font-size: 13px; color: #6b7280; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          td { padding: 4px 0; font-size: 13px; }
          td:first-child { color: #6b7280; width: 160px; }
          h2 { font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 16px; }
          .anomaly { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 10px; page-break-inside: avoid; }
          .anomaly-header { display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; }
          .anomaly-type { font-family: monospace; font-size: 13px; font-weight: 600; }
          .badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
          .field-label { font-weight: 600; }
          .clean { color: #16a34a; font-style: italic; }
          .disclaimer { margin-top: 32px; padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 11px; color: #6b7280; }
          @media print {
            body { padding: 20px; }
            button { display: none; }
          }
        `}</style>
      </head>
      <body>
        <button
          onClick={() => window.print()}
          style={{ position: 'fixed', top: 16, right: 16, padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
        >
          Save as PDF
        </button>

        <div className="header">
          <div className="brand">PropertyOps AI</div>
          <div className="subtitle">Document Integrity Report</div>
        </div>

        <table>
          <tbody>
            <tr><td>Report ID</td><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{report.id}</td></tr>
            <tr><td>Applicant</td><td>{report.tenantName}</td></tr>
            <tr><td>Document Type</td><td style={{ textTransform: 'capitalize' }}>{report.documentType.replace(/_/g, ' ')}</td></tr>
            <tr><td>Analysis Date</td><td>{dateStr}</td></tr>
            <tr><td>Reviewed By</td><td>PropertyOps AI Founder Review</td></tr>
            <tr><td>Anomalies Found</td><td>{report.anomalies.length}</td></tr>
          </tbody>
        </table>

        <h2>Anomaly Flags</h2>

        {report.anomalies.length === 0 ? (
          <p className="clean">No anomalies detected in this document.</p>
        ) : (
          report.anomalies.map((a, i) => (
            <div key={i} className="anomaly">
              <div className="anomaly-header">
                <span className="anomaly-type">{a.type}</span>
                <span className="badge" style={{ [SEVERITY_STYLES[a.severity] as any]: true, ...Object.fromEntries(SEVERITY_STYLES[a.severity].split(';').map((s: string) => s.split(':'))) }}>
                  {SEVERITY_LABELS[a.severity]}
                </span>
              </div>
              <p><span className="field-label">Evidence: </span>{a.evidence}</p>
              <p style={{ color: '#6b7280', marginTop: 4, fontSize: 12 }}><span className="field-label">Location: </span>{a.location}</p>
            </div>
          ))
        )}

        <div className="disclaimer">
          <strong>COMPLIANCE NOTICE:</strong> This report documents potential anomalies in submitted documents for
          informational purposes only. It does not constitute a credit decision, tenant screening report, or leasing
          recommendation. All leasing decisions remain solely with the property owner or manager. This report does not
          assess creditworthiness, character, or fitness as a tenant. PropertyOps AI is not a Consumer Reporting Agency
          under FCRA.
        </div>
      </body>
    </html>
  );
}
