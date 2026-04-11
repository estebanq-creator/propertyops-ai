"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

type Severity = "low" | "medium" | "high"

type ReviewReport = {
  id: string
  landlordId: string
  propertyId: string
  tenantName: string
  documentType: string
  status: "pending_review" | "approved" | "rejected"
  anomalies: Array<{
    type: string
    severity: Severity
    evidence: string
    location: string
  }>
  createdAt: string
}

type QueueResponse = {
  success: boolean
  data: ReviewReport[]
  meta: {
    pending: number
    approved: number
    rejected: number
    reviewGate: {
      totalRequired: number
      validated: number
      remaining: number
      percentComplete: number
      bypassEnabled: boolean
    }
  }
}

const severityClasses: Record<Severity, string> = {
  low: "border-blue-200 bg-blue-50 text-blue-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-red-200 bg-red-50 text-red-800",
}

export default function ReviewQueuePage() {
  const [queue, setQueue] = React.useState<QueueResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [processingId, setProcessingId] = React.useState<string | null>(null)

  const loadQueue = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/review-queue", { cache: "no-store" })
      const data = (await response.json()) as QueueResponse & { error?: string }
      if (!response.ok || data.success !== true) {
        throw new Error(data.error || "Failed to load review queue")
      }
      setQueue(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load review queue")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadQueue()
  }, [loadQueue])

  async function act(reportId: string, action: "approve" | "reject") {
    const reason =
      action === "reject"
        ? window.prompt("Rejection reason", "Needs closer review") || "Needs closer review"
        : undefined

    try {
      setProcessingId(reportId)
      const response = await fetch(`/api/reports/${reportId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "reject" ? JSON.stringify({ reason }) : undefined,
      })
      const data = (await response.json()) as { success: boolean; error?: string }
      if (!response.ok || data.success !== true) {
        throw new Error(data.error || `Failed to ${action} report`)
      }
      await loadQueue()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} report`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Phase 4 Review Queue</h1>
            <p className="mt-2 text-muted-foreground">
              Local approval queue for forensic reports while the main portal is being stabilized.
            </p>
          </div>
          <button
            onClick={() => void loadQueue()}
            className="rounded-md border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {queue && (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Review Gate Progress</h2>
                <p className="text-sm text-slate-600">
                  {queue.meta.reviewGate.validated} of {queue.meta.reviewGate.totalRequired} reports validated
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Stat label="Pending" value={queue.meta.pending} />
                <Stat label="Approved" value={queue.meta.approved} />
                <Stat label="Rejected" value={queue.meta.rejected} />
                <Stat label="Remaining" value={queue.meta.reviewGate.remaining} />
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${queue.meta.reviewGate.percentComplete}%` }}
              />
            </div>
          </section>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="space-y-4">
          {loading && (
            <div className="rounded-xl border bg-white p-8 text-sm text-slate-500 shadow-sm">Loading review queue...</div>
          )}

          {!loading && queue?.data.length === 0 && (
            <div className="rounded-xl border bg-white p-8 text-sm text-slate-500 shadow-sm">
              No pending reports. Everything in the local queue has been reviewed.
            </div>
          )}

          {queue?.data.map((report) => (
            <article key={report.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{report.tenantName}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {report.documentType.replaceAll("_", " ")} • {report.landlordId} • {report.propertyId}
                  </p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <div>{new Date(report.createdAt).toLocaleString()}</div>
                  <div className="font-mono">{report.id}</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {report.anomalies.length === 0 ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    No anomalies detected. Document integrity looks clean.
                  </div>
                ) : (
                  report.anomalies.map((anomaly, index) => (
                    <div
                      key={`${report.id}-${index}`}
                      className={`rounded-lg border px-4 py-3 text-sm ${severityClasses[anomaly.severity]}`}
                    >
                      <div className="font-semibold capitalize">
                        {anomaly.severity} • {anomaly.type.replaceAll("_", " ")}
                      </div>
                      <div className="mt-1">{anomaly.evidence}</div>
                      <div className="mt-1 text-xs opacity-80">Location: {anomaly.location}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => void act(report.id, "approve")}
                  disabled={processingId === report.id}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processingId === report.id ? "Working..." : "Approve"}
                </button>
                <button
                  onClick={() => void act(report.id, "reject")}
                  disabled={processingId === report.id}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processingId === report.id ? "Working..." : "Reject"}
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </DashboardLayout>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-slate-50 px-3 py-2 text-center">
      <div className="text-lg font-semibold text-slate-900">{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  )
}
