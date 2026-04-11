import { NextResponse } from "next/server"
import { getReviewQueue } from "@/lib/review-queue-store"

export async function GET() {
  try {
    return NextResponse.json(await getReviewQueue())
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load review queue",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
