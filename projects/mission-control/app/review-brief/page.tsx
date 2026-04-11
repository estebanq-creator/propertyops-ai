import Link from "next/link"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

const reviewBriefs = {
  "review-001": {
    title: "Laura Portal Review Gate",
    category: "Approval Gate",
    priority: "High",
    status: "Ready now",
    overview: "Use this review to accept or reject the first batch of forensic reports without relying on the unstable PropertyOps login flow.",
    whyItMatters: [
      "This is the clearest active human approval gate in the system.",
      "Approving these reports is the step that moves work from automated analysis into accepted output.",
    ],
    checklist: [
      "Open the local review queue and inspect each pending report.",
      "Approve clean reports and reject anything with obvious false positives or unsupported claims.",
      "Watch the counters after each decision so you can confirm the gate is progressing.",
    ],
    primaryHref: "/review-queue",
    primaryLabel: "Open Review Queue",
    secondaryHref: "/",
    secondaryLabel: "Open Mission Control",
  },
  "review-002": {
    title: "PRO-28 Compliance Report",
    category: "Code / Compliance",
    priority: "High",
    status: "Pending human review",
    overview: "Review whether the shadow-mode security work is acceptable for broader rollout and whether the compliance story is strong enough to rely on operationally.",
    whyItMatters: [
      "This is the main compliance checkpoint before the system is trusted more widely.",
      "It is the right place to catch missing auditability, retention, or data-handling gaps before they become process debt.",
    ],
    checklist: [
      "Confirm shadow-mode behavior is non-destructive and clearly separated from production actions.",
      "Check that sensitive data handling and audit logging are spelled out well enough for later review.",
      "Capture any controls that still need explicit sign-off before rollout.",
    ],
    primaryHref: "/review-inbox",
    primaryLabel: "Back to Inbox",
    secondaryHref: "/",
    secondaryLabel: "Open Mission Control",
  },
  "review-003": {
    title: "PRO-16 Technical Spec",
    category: "Architecture",
    priority: "Medium",
    status: "Needs review",
    overview: "Review the architecture proposal with a security lens, focusing on trust boundaries, privileged access, and how approvals are recorded.",
    whyItMatters: [
      "This review sets the shape of future implementation work.",
      "It is easier to correct approval boundaries and data flow now than after deeper build-out.",
    ],
    checklist: [
      "Verify the zero-trust assumptions are explicit rather than implied.",
      "Check how PAM, PII access, and audit trails cross service boundaries.",
      "Call out any places where operator approval is ambiguous or underspecified.",
    ],
    primaryHref: "/review-inbox",
    primaryLabel: "Back to Inbox",
    secondaryHref: "/",
    secondaryLabel: "Open Mission Control",
  },
  "review-004": {
    title: "Phase 0 / Phase 1 Completion",
    category: "Architecture",
    priority: "Medium",
    status: "Awaiting sign-off",
    overview: "Use this review to compare what was implemented against the intended operating model and close the remaining sign-off loop.",
    whyItMatters: [
      "This is the best checkpoint for spotting drift between design intent and what actually shipped.",
      "A clean sign-off here reduces confusion before Phase 4 acceptance expands further.",
    ],
    checklist: [
      "Compare the current local Mission Control and review queue flow against the original rollout goals.",
      "Note any mismatches in approval UX, persistence, or operator visibility.",
      "Decide whether the current implementation is acceptable as an interim path or still needs blocking fixes.",
    ],
    primaryHref: "/",
    primaryLabel: "Open Mission Control",
    secondaryHref: "/review-queue",
    secondaryLabel: "Open Review Queue",
  },
  "review-005": {
    title: "PRO-13 Hermes Review",
    category: "Strategy / Governance",
    priority: "Low",
    status: "Pending close-out",
    overview: "Close the governance review on the competitive briefing work and make sure it satisfies the newer approval standard.",
    whyItMatters: [
      "This is a lower-risk review, but it should still be explicitly closed so it does not linger as hidden governance debt.",
      "A short close-out review helps keep the queue honest and current.",
    ],
    checklist: [
      "Confirm the competitive briefing outputs are complete and not waiting on hidden dependencies.",
      "Check whether the newer approval standard requires any additional notes or sign-off language.",
      "Close the item if no further action is needed.",
    ],
    primaryHref: "/review-inbox",
    primaryLabel: "Back to Inbox",
    secondaryHref: "/",
    secondaryLabel: "Open Mission Control",
  },
} as const

type ReviewKey = keyof typeof reviewBriefs

export default function ReviewBriefPage({ searchParams }: { searchParams?: { item?: string } }) {
  const item = searchParams?.item as ReviewKey | undefined
  const brief = item ? reviewBriefs[item] : null

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-3">
          <Link href="/review-inbox" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Back to Review Inbox
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{brief ? brief.title : "Review Brief"}</h1>
          <p className="text-base text-slate-600">
            {brief
              ? brief.overview
              : "Choose an item from the Review Inbox to see a concrete checklist and the best next action for that review."}
          </p>
        </div>

        {brief ? (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full border px-2 py-1 text-slate-600">{brief.category}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">{brief.priority} priority</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">{brief.status}</span>
            </div>

            <section className="grid gap-4 md:grid-cols-2">
              <InfoCard title="Why This Matters" items={brief.whyItMatters} />
              <InfoCard title="Review Checklist" items={brief.checklist} />
            </section>

            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Recommended Next Step</h2>
              <p className="mt-2 text-sm text-slate-600">
                Use the primary action below to jump straight into the best available surface for this review. The secondary action is there if you want to orient first.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={brief.primaryHref}
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  {brief.primaryLabel}
                </Link>
                <Link
                  href={brief.secondaryHref}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {brief.secondaryLabel}
                </Link>
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-600">No review item was selected. Open the inbox and choose a task to get the guided review brief.</p>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}

function InfoCard({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-3 space-y-3 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
