import { NextResponse } from "next/server"
import { updateReportStatus } from "@/lib/review-queue-store"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => ({})) as { reason?: string }
  const result = await updateReportStatus(id, "rejected", body.reason)

  if (!result) {
    return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 })
  }

  return NextResponse.json(result)
}
