import { promises as fs } from "fs"
import path from "path"

export type ReportStatus = "pending_review" | "approved" | "rejected"

export interface ReportAnomaly {
  type: string
  severity: "low" | "medium" | "high"
  evidence: string
  location: string
}

export interface ReviewReport {
  id: string
  landlordId: string
  propertyId: string
  tenantName: string
  documentType: "lease" | "id" | "paystub" | "bank_statement" | "employment_letter"
  status: ReportStatus
  anomalies: ReportAnomaly[]
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

interface AuditEntry {
  id: string
  timestamp: string
  action: "report_approved" | "report_rejected"
  actor: string
  reportId: string
  details: Record<string, unknown>
}

interface ReviewQueueState {
  reports: ReviewReport[]
  auditLog: AuditEntry[]
}

const seedState: ReviewQueueState = {
  reports: [
    {
      id: "report-001",
      landlordId: "landlord-001",
      propertyId: "prop-001",
      tenantName: "John Doe",
      documentType: "paystub",
      status: "pending_review",
      anomalies: [
        {
          type: "metadata_inconsistency",
          severity: "medium",
          evidence: "PDF creation date differs from stated document date.",
          location: "Document metadata",
        },
        {
          type: "font_variation",
          severity: "low",
          evidence: "Two font families appear in the salary field.",
          location: "Page 1, salary section",
        },
      ],
      createdAt: "2026-04-05T14:30:00Z",
    },
    {
      id: "report-002",
      landlordId: "landlord-001",
      propertyId: "prop-002",
      tenantName: "Jane Smith",
      documentType: "id",
      status: "pending_review",
      anomalies: [
        {
          type: "image_manipulation_detected",
          severity: "high",
          evidence: "Compression patterns vary inside the photo region.",
          location: "Photo area",
        },
      ],
      createdAt: "2026-04-05T15:00:00Z",
    },
    {
      id: "report-003",
      landlordId: "landlord-002",
      propertyId: "prop-003",
      tenantName: "Robert Wilson",
      documentType: "bank_statement",
      status: "pending_review",
      anomalies: [],
      createdAt: "2026-04-06T09:00:00Z",
    },
    {
      id: "report-004",
      landlordId: "landlord-003",
      propertyId: "prop-004",
      tenantName: "Maria Garcia",
      documentType: "employment_letter",
      status: "pending_review",
      anomalies: [
        {
          type: "template_mismatch",
          severity: "medium",
          evidence: "Letterhead differs from known employer template.",
          location: "Header section",
        },
      ],
      createdAt: "2026-04-06T11:30:00Z",
    },
    {
      id: "report-005",
      landlordId: "landlord-004",
      propertyId: "prop-007",
      tenantName: "James Lee",
      documentType: "lease",
      status: "pending_review",
      anomalies: [
        {
          type: "signature_anomaly",
          severity: "high",
          evidence: "Digital signature certificate expired at signing time.",
          location: "Signature block, page 3",
        },
        {
          type: "text_alteration",
          severity: "high",
          evidence: "Rent amount field shows signs of digital alteration.",
          location: "Section 4.2, page 2",
        },
      ],
      createdAt: "2026-04-06T16:00:00Z",
    },
  ],
  auditLog: [],
}

function dataFilePath() {
  return path.join(process.cwd(), "data", "review-queue.json")
}

async function ensureStateFile() {
  const filePath = dataFilePath()
  try {
    await fs.access(filePath)
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(seedState, null, 2))
  }
  return filePath
}

export async function readState(): Promise<ReviewQueueState> {
  const filePath = await ensureStateFile()
  const raw = await fs.readFile(filePath, "utf8")
  return JSON.parse(raw) as ReviewQueueState
}

async function writeState(state: ReviewQueueState) {
  const filePath = await ensureStateFile()
  await fs.writeFile(filePath, JSON.stringify(state, null, 2))
}

export async function getReviewQueue() {
  const state = await readState()
  const pendingReports = state.reports
    .filter((report) => report.status === "pending_review")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const approvedCount = state.reports.filter((report) => report.status === "approved").length
  const rejectedCount = state.reports.filter((report) => report.status === "rejected").length
  const validatedCount = approvedCount + rejectedCount

  return {
    success: true,
    data: pendingReports,
    meta: {
      total: state.reports.length,
      pending: pendingReports.length,
      approved: approvedCount,
      rejected: rejectedCount,
      reviewGate: {
        totalRequired: 50,
        validated: validatedCount,
        remaining: Math.max(0, 50 - validatedCount),
        bypassEnabled: validatedCount >= 50,
        percentComplete: Math.round((validatedCount / 50) * 100),
      },
    },
  }
}

export async function updateReportStatus(reportId: string, status: Exclude<ReportStatus, "pending_review">, reason?: string) {
  const state = await readState()
  const index = state.reports.findIndex((report) => report.id === reportId)

  if (index === -1) {
    return null
  }

  const previous = state.reports[index]
  const updated: ReviewReport = {
    ...previous,
    status,
    reviewedAt: new Date().toISOString(),
    reviewedBy: "owner-001",
    rejectionReason: status === "rejected" ? reason || "Not specified" : undefined,
  }

  state.reports[index] = updated
  state.auditLog.push({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: status === "approved" ? "report_approved" : "report_rejected",
    actor: "owner-001",
    reportId,
    details: {
      previousStatus: previous.status,
      newStatus: status,
      landlordId: previous.landlordId,
      propertyId: previous.propertyId,
      anomalyCount: previous.anomalies.length,
      reason: status === "rejected" ? reason || "Not specified" : undefined,
    },
  })

  await writeState(state)

  const queue = await getReviewQueue()
  return {
    success: true,
    data: {
      reportId,
      status,
      reviewedAt: updated.reviewedAt,
      reviewedBy: updated.reviewedBy,
      rejectionReason: updated.rejectionReason,
    },
    meta: {
      reviewGate: queue.meta.reviewGate,
      auditTrail: {
        logged: true,
        auditId: state.auditLog[state.auditLog.length - 1]?.id,
      },
    },
  }
}
