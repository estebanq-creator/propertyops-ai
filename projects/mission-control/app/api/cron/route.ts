import { NextRequest, NextResponse } from "next/server"
import { validateCronJob, validateCreateCronJob, validateUpdateCronJob } from "@/lib/validations/cron"
import { cronManager } from "@/lib/store/cron-store"

/**
 * GET /api/cron
 * 
 * List all cron jobs with optional filtering
 * 
 * Query Parameters:
 * - status: active|paused|disabled|running|failed
 * - category: system|agent|reporting|maintenance|integration|custom
 * - tag: string (filter by tag)
 * - search: string (search name and description)
 * 
 * Response:
 * {
 *   jobs: CronJob[],
 *   total: number,
 *   stats: { active, paused, disabled, running, failed }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const filters = {
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      tag: searchParams.get("tag") || undefined,
      search: searchParams.get("search") || undefined,
    }

    const jobs = cronManager.list(filters)
    const stats = cronManager.getStats()

    return NextResponse.json({
      jobs,
      total: jobs.length,
      stats,
    })
  } catch (error) {
    console.error("[Cron] Error listing jobs:", error)

    return NextResponse.json(
      {
        error: "Failed to list cron jobs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cron
 * 
 * Create a new cron job
 * 
 * Request: CreateCronJob
 * Response: Created CronJob
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate job
    const validation = validateCreateCronJob(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid cron job configuration",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    // Create job
    const job = cronManager.create(validation.data)

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error("[Cron] Error creating job:", error)

    return NextResponse.json(
      {
        error: "Failed to create cron job",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
