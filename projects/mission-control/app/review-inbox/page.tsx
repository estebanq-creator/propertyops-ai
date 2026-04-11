import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

const reviewItems = [
  {
    id: "review-001",
    title: "Laura Portal Review Gate",
    category: "Approval Gate",
    priority: "High",
    status: "Ready now",
    summary: "Review and approve or reject the first 50 forensic reports.",
    actionHref: "/review-brief?item=review-001",
    actionLabel: "Open Review Brief",
  },
  {
    id: "review-002",
    title: "PRO-28 Compliance Report",
    category: "Code / Compliance",
    priority: "High",
    status: "Pending human review",
    summary: "Validate the shadow-mode security and compliance deliverables before broader rollout.",
    actionHref: "/review-brief?item=review-002",
    actionLabel: "Open Review Brief",
  },
  {
    id: "review-003",
    title: "PRO-16 Technical Spec",
    category: "Architecture",
    priority: "Medium",
    status: "Needs review",
    summary: "Review the zero-trust architecture, PAM/PII handling, audit trail boundaries, and approval model.",
    actionHref: "/review-brief?item=review-003",
    actionLabel: "Open Review Brief",
  },
  {
    id: "review-004",
    title: "Phase 0 / Phase 1 Completion",
    category: "Architecture",
    priority: "Medium",
    status: "Awaiting sign-off",
    summary: "Confirm implementation matches the intended operating model and close out remaining approval items.",
    actionHref: "/review-brief?item=review-004",
    actionLabel: "Open Review Brief",
  },
  {
    id: "review-005",
    title: "PRO-13 Hermes Review",
    category: "Strategy / Governance",
    priority: "Low",
    status: "Pending close-out",
    summary: "Close the governance review on the competitive briefing work under the newer approval standard.",
    actionHref: "/review-brief?item=review-005",
    actionLabel: "Open Review Brief",
  },
]

const priorityClasses: Record<string, string> = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-blue-50 text-blue-700 border-blue-200",
}

export default function ReviewInboxPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Inbox</h1>
          <p className="mt-2 text-muted-foreground">
            One place for the human review work currently in the pipeline: approval-gate reviews, architecture/spec reviews, and code/compliance review tasks.
          </p>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="High Priority" value="2" note="Start here" />
          <SummaryCard label="Medium Priority" value="2" note="Planned follow-up" />
          <SummaryCard label="Low Priority" value="1" note="Close-out review" />
        </section>

        <section className="space-y-4">
          {reviewItems.map((item) => (
            <article key={item.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="rounded-full border px-2 py-1 text-slate-600">{item.category}</span>
                    <span className={`rounded-full border px-2 py-1 ${priorityClasses[item.priority]}`}>{item.priority}</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">{item.status}</span>
                  </div>
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="text-sm text-slate-600">{item.summary}</p>
                </div>
                <Link
                  href={item.actionHref}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  {item.actionLabel}
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </DashboardLayout>
  )
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{note}</div>
    </div>
  )
}
