import { NextRequest, NextResponse } from "next/server"
import { validateHeartbeat } from "@/lib/validations/health"
import { telemetry } from "@/lib/store/telemetry-store"
import { alerting } from "@/lib/services/alerting"

/**
 * POST /api/agents/heartbeat
 * 
 * Agent heartbeat endpoint for full status reporting
 * Called by OpenClaw agents via Tailscale tunnel every 30 seconds
 * 
 * Request:
 * {
 *   agentId: string,
 *   agentName: string,
 *   version: string,
 *   status: "online" | "offline" | "degraded" | "starting" | "stopped",
 *   uptime: number,
 *   startTime: ISO8601,
 *   lastActivity: ISO8601,
 *   resources: { cpu, memory, disk?, network? },
 *   tunnel: { connected, localIp?, tailscaleIp?, latency?, ... },
 *   activeJobs: number,
 *   queuedJobs: number,
 *   failedJobs: number,
 *   metadata?: object
 * }
 * 
 * Response:
 * {
 *   status: "ok",
 *   agentId: string,
 *   acknowledged: boolean,
 *   serverTime: ISO8601
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse and validate request
    const body = await request.json()
    const validation = validateHeartbeat(body)

    if (!validation.success) {
      console.error("[Agents/Heartbeat] Validation error:", validation.error)
      return NextResponse.json(
        {
          error: "Invalid heartbeat payload",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const heartbeat = validation.data
    const { agentId, agentName, status, tunnel, resources } = heartbeat

    // Record heartbeat in telemetry store
    telemetry.recordHeartbeat(agentId, heartbeat)

    // Check for status changes
    const previousTelemetry = telemetry.getAgent(agentId)
    const isRecovering = previousTelemetry?.consecutiveFailures && previousTelemetry.consecutiveFailures > 0

    if (isRecovering && status === "online") {
      console.log(`[Agents/Heartbeat] Agent ${agentName} (${agentId}) recovered and is back online`)
      
      // Send recovery notification
      await alerting.sendAlert({
        severity: "medium",
        category: "agent",
        title: `Agent recovered: ${agentName}`,
        message: `Agent ${agentName} (${agentId}) has recovered and is back online after ${previousTelemetry!.consecutiveFailures} failed checks.`,
        agentId,
        agentName,
        metadata: {
          uptime: heartbeat.uptime,
          previousFailures: previousTelemetry!.consecutiveFailures,
        },
        timestamp: new Date().toISOString(),
        requiresAck: false,
      })
    }

    // Check for tunnel disconnection
    if (!tunnel.connected && previousTelemetry?.heartbeat.tunnel.connected) {
      console.warn(`[Agents/Heartbeat] Agent ${agentName} (${agentId}) tunnel disconnected`)
      
      await alerting.sendAlert({
        severity: "high",
        category: "tunnel",
        title: `Tunnel disconnected: ${agentName}`,
        message: `Agent ${agentName} (${agentId}) has lost Tailscale tunnel connectivity.`,
        agentId,
        agentName,
        metadata: {
          lastKnownIp: previousTelemetry.heartbeat.tunnel.tailscaleIp,
          latency: previousTelemetry.heartbeat.tunnel.latency,
        },
        timestamp: new Date().toISOString(),
        requiresAck: true,
      })
    }

    // Check for critical resource usage
    if (resources.memory.percentage > 90) {
      const wasRecentlyAlerted = alerting.wasRecentlySent(
        "agent",
        `High memory: ${agentName}`
      )
      
      if (!wasRecentlyAlerted) {
        await alerting.sendAlert({
          severity: resources.memory.percentage > 95 ? "critical" : "high",
          category: "agent",
          title: `High memory usage: ${agentName}`,
          message: `Agent ${agentName} (${agentId}) memory usage is at ${resources.memory.percentage.toFixed(1)}%.`,
          agentId,
          agentName,
          metadata: {
            memoryUsed: resources.memory.used,
            memoryTotal: resources.memory.total,
            memoryPercentage: resources.memory.percentage,
          },
          timestamp: new Date().toISOString(),
          requiresAck: resources.memory.percentage > 95,
        })
      }
    }

    if (resources.cpu.usage > 90) {
      const wasRecentlyAlerted = alerting.wasRecentlySent(
        "agent",
        `High CPU: ${agentName}`
      )
      
      if (!wasRecentlyAlerted) {
        await alerting.sendAlert({
          severity: resources.cpu.usage > 95 ? "critical" : "high",
          category: "agent",
          title: `High CPU usage: ${agentName}`,
          message: `Agent ${agentName} (${agentId}) CPU usage is at ${resources.cpu.usage.toFixed(1)}%.`,
          agentId,
          agentName,
          metadata: {
            cpuUsage: resources.cpu.usage,
            cpuCores: resources.cpu.cores,
          },
          timestamp: new Date().toISOString(),
          requiresAck: resources.cpu.usage > 95,
        })
      }
    }

    // Check for high job failure rate
    const totalJobs = heartbeat.activeJobs + heartbeat.queuedJobs + heartbeat.failedJobs
    if (totalJobs > 0) {
      const failureRate = heartbeat.failedJobs / totalJobs
      
      if (failureRate > 0.3) {
        const wasRecentlyAlerted = alerting.wasRecentlySent(
          "agent",
          `High failure rate: ${agentName}`
        )
        
        if (!wasRecentlyAlerted) {
          await alerting.sendAlert({
            severity: failureRate > 0.5 ? "critical" : "high",
            category: "agent",
            title: `High job failure rate: ${agentName}`,
            message: `Agent ${agentName} (${agentId}) has a ${(failureRate * 100).toFixed(1)}% job failure rate (${heartbeat.failedJobs}/${totalJobs} jobs).`,
            agentId,
            agentName,
            metadata: {
              activeJobs: heartbeat.activeJobs,
              queuedJobs: heartbeat.queuedJobs,
              failedJobs: heartbeat.failedJobs,
              failureRate: failureRate.toFixed(4),
            },
            timestamp: new Date().toISOString(),
            requiresAck: failureRate > 0.5,
          })
        }
      }
    }

    const responseTime = Date.now() - startTime

    console.log(
      `[Agents/Heartbeat] ${agentName} (${agentId}): status=${status}, ` +
      `cpu=${resources.cpu.usage.toFixed(1)}%, mem=${resources.memory.percentage.toFixed(1)}%, ` +
      `tunnel=${tunnel.connected ? "connected" : "disconnected"}, ` +
      `jobs=${heartbeat.activeJobs}active/${heartbeat.queuedJobs}queued/${heartbeat.failedJobs}failed, ` +
      `response=${responseTime}ms`
    )

    return NextResponse.json({
      status: "ok",
      agentId,
      acknowledged: true,
      serverTime: new Date().toISOString(),
      responseTime,
    })
  } catch (error) {
    console.error("[Agents/Heartbeat] Error:", error)

    return NextResponse.json(
      {
        error: "Failed to process heartbeat",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
