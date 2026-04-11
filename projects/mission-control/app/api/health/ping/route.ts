import { NextRequest, NextResponse } from "next/server"
import { validatePing } from "@/lib/validations/health"
import { telemetry } from "@/lib/store/telemetry-store"
import { alerting } from "@/lib/services/alerting"

/**
 * POST /api/health/ping
 * 
 * Agent ping endpoint for tracking response times and tunnel latency
 * Called by OpenClaw agents via Tailscale tunnel
 * 
 * Request:
 * {
 *   agentId: string,
 *   timestamp: ISO8601,
 *   tunnelLatency?: number
 * }
 * 
 * Response:
 * {
 *   status: "ok",
 *   serverTime: ISO8601,
 *   latency: number,
 *   tunnelLatency?: number,
 *   agentId: string
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse and validate request
    const body = await request.json()
    const validation = validatePing(body)

    if (!validation.success) {
      console.error("[Health/Ping] Validation error:", validation.error)
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { agentId, timestamp, tunnelLatency } = validation.data

    // Calculate server-side latency
    const serverTime = new Date().toISOString()
    const clientTime = new Date(timestamp).getTime()
    const clientLatency = startTime - clientTime
    const serverLatency = Date.now() - startTime
    const totalLatency = clientLatency + serverLatency

    // Record ping in telemetry store
    telemetry.recordPing(agentId, totalLatency)

    // Get agent's current status
    const agentTelemetry = telemetry.getAgent(agentId)
    
    // Check if this is a recovering agent (was offline, now online)
    if (agentTelemetry && agentTelemetry.consecutiveFailures > 0) {
      console.log(`[Health/Ping] Agent ${agentId} recovered after ${agentTelemetry.consecutiveFailures} failures`)
    }

    // Log tunnel latency if provided
    if (tunnelLatency) {
      console.log(
        `[Health/Ping] Agent ${agentId}: total=${totalLatency}ms, tunnel=${tunnelLatency}ms, server=${serverLatency}ms`
      )
    }

    return NextResponse.json({
      status: "ok",
      serverTime,
      latency: totalLatency,
      tunnelLatency,
      agentId,
    })
  } catch (error) {
    console.error("[Health/Ping] Error:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/health/ping
 * 
 * Simple health check for load balancers and monitoring
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
}
