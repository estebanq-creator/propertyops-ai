/**
 * Email Delivery - Send approved Document Integrity Reports to landlords
 * Phase 0B: Triggered manually by founder on approval
 */

import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS must be set to send email. Add them to .env.local');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function buildReportHtml(params: {
  tenantName: string;
  documentType: string;
  anomalies: { type: string; severity: string; evidence: string; location: string }[];
  reportId: string;
  createdAt: string;
}): string {
  const { tenantName, documentType, anomalies, reportId, createdAt } = params;
  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const anomalyRows = anomalies.length === 0
    ? '<p style="color:#16a34a">No anomalies detected in this document.</p>'
    : anomalies.map(a => `
      <div style="border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <strong style="font-family:monospace;font-size:13px">${a.type}</strong>
          <span style="font-size:12px;padding:2px 8px;border-radius:4px;background:${
            a.severity === 'high' ? '#fee2e2;color:#991b1b' :
            a.severity === 'medium' ? '#fef3c7;color:#92400e' :
            '#f0fdf4;color:#166534'
          }">${a.severity.toUpperCase()}</span>
        </div>
        <p style="margin:0 0 4px;font-size:14px"><strong>Evidence:</strong> ${a.evidence}</p>
        <p style="margin:0;font-size:13px;color:#6b7280"><strong>Location:</strong> ${a.location}</p>
      </div>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Document Integrity Report</title></head>
<body style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111">
  <div style="border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:24px">
    <h1 style="margin:0;font-size:22px">PropertyOps AI</h1>
    <p style="margin:4px 0 0;color:#6b7280;font-size:14px">Document Integrity Report</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <tr><td style="padding:4px 0;color:#6b7280;font-size:13px;width:140px">Report ID</td><td style="font-family:monospace;font-size:13px">${reportId}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;font-size:13px">Applicant</td><td>${tenantName}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;font-size:13px">Document Type</td><td style="text-transform:capitalize">${documentType.replace(/_/g,' ')}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;font-size:13px">Analysis Date</td><td>${dateStr}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;font-size:13px">Anomalies Found</td><td>${anomalies.length}</td></tr>
  </table>
  <h2 style="font-size:16px;border-bottom:1px solid #e5e7eb;padding-bottom:8px">Anomaly Flags</h2>
  ${anomalyRows}
  <div style="margin-top:32px;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;color:#6b7280">
    <strong>COMPLIANCE NOTICE:</strong> This report documents potential anomalies in submitted documents
    for informational purposes only. It does not constitute a credit decision, tenant screening report,
    or recommendation. All leasing decisions remain solely with the property owner or manager.
    This report does not assess creditworthiness, character, or fitness as a tenant.
    PropertyOps AI is not a Consumer Reporting Agency under FCRA.
  </div>
</body>
</html>`;
}

export async function sendReportEmail(params: {
  toEmail: string;
  toName: string;
  tenantName: string;
  documentType: string;
  anomalies: { type: string; severity: string; evidence: string; location: string }[];
  reportId: string;
  createdAt: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const html = buildReportHtml(params);
    const highCount = params.anomalies.filter(a => a.severity === 'high').length;
    const subject = highCount > 0
      ? `[PropertyOps AI] Document Integrity Report — ${params.tenantName} (${highCount} high-severity flag${highCount > 1 ? 's' : ''})`
      : `[PropertyOps AI] Document Integrity Report — ${params.tenantName}`;

    const info = await transporter.sendMail({
      from,
      to: `${params.toName} <${params.toEmail}>`,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('Email delivery failed:', error);
    return { success: false, error };
  }
}
