import { NextResponse } from "next/server"
import { updateReportStatus } from "@/lib/review-queue-store"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const result = await updateReportStatus(id, "approved")

  if (!result) {
    return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 })
  }

  return NextResponse.json(result)
}
