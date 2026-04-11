import { NextRequest, NextResponse } from "next/server"
import { telemetry } from "@/lib/store/telemetry-store"
import { alerting } from "@/lib/services/alerting"
import { AgentStatus } from "@/lib/validations/health"

/**
 * GET /api/health/ready
 * 
 * Comprehensive readiness endpoint for load balancers and monitoring systems
 * Returns overall system health, agent status summary, and tunnel connectivity
 * 
 * Response:
 * {
 *   status: "ready" | "degraded" | "unavailable",
 *   version: string,
 *   uptime: number,
 *   agents: {
 *     total: number,
 *     online: number,
 *     offline: number,
 *     degraded: number
 *   },
 *   tunnel: {
 *     connected: boolean,
 *     activeAgents: number
 *   },
 *   lastTelemetryUpdate?: ISO8601
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get telemetry stats
    const stats = telemetry.getStats()
    const allAgents = telemetry.getAllAgents()

    // Determine overall status
    let status: "ready" | "degraded" | "unavailable" = "ready"
    const issues: string[] = []

    // Check for offline agents
    if (stats.offlineAgents > 0) {
      const offlineThreshold = 300000 // 5 minutes
      const criticallyOffline = telemetry.checkOfflineAgents(offlineThreshold)
      
      if (criticallyOffline.length > 0) {
        issues.push(`${criticallyOffline.length} agent(s) offline for > 5 minutes`)
        
        // Send alert if we have critical offline agents
        const agentNames = criticallyOffline
          .map((a) => a.heartbeat.agentName)
          .join(", ")
        
        // Rate limit: only alert once per 5 minutes per agent
        for (const agent of criticallyOffline) {
          const agentId = agent.heartbeat.agentId
          const wasRecentlyAlerted = alerting.wasRecentlySent(
            "tunnel",
            `Agent offline: ${agent.heartbeat.agentName}`
          )
          
          if (!wasRecentlyAlerted) {
            await alerting.sendAlert({
              severity: "high",
              category: "tunnel",
              title: `Agent offline: ${agent.heartbeat.agentName}`,
              message: `Agent ${agent.heartbeat.agentName} (${agentId}) has been offline for more than 5 minutes. Last seen: ${new Date(agent.lastUpdated).toLocaleString()}`,
              agentId,
              agentName: agent.heartbeat.agentName,
              metadata: {
                uptime: agent.heartbeat.uptime,
                lastActivity: agent.heartbeat.lastActivity,
                failedJobs: agent.heartbeat.failedJobs,
              },
              timestamp: new Date().toISOString(),
              requiresAck: true,
            })
          }
        }
        
        // Mark as degraded if > 50% agents offline
        if (stats.totalAgents > 0 && stats.offlineAgents / stats.totalAgents > 0.5) {
          status = "degraded"
        }
      }
    }

    // Check for critical health issues
    const criticalAgents = telemetry.getCriticalHealthAgents()
    if (criticalAgents.length > 0) {
      issues.push(`${criticalAgents.length} agent(s) with critical health issues`)
      
      for (const agent of criticalAgents) {
        const agentId = agent.heartbeat.agentId
        const resources = agent.heartbeat.resources
        
        // Determine the critical issue
        let criticalIssue: string[] = []
        if (resources.memory.percentage > 95) {
          criticalIssue.push(`memory at ${resources.memory.percentage.toFixed(1)}%`)
        }
        if (resources.cpu.usage > 95) {
          criticalIssue.push(`CPU at ${resources.cpu.usage.toFixed(1)}%`)
        }
        if (!agent.heartbeat.tunnel.connected) {
          criticalIssue.push("tunnel disconnected")
        }
        
        const wasRecentlyAlerted = alerting.wasRecentlySent(
          "agent",
          `Critical health: ${agent.heartbeat.agentName}`
        )
        
        if (!wasRecentlyAlerted) {
          await alerting.sendAlert({
            severity: "critical",
            category: "agent",
            title: `Critical health: ${agent.heartbeat.agentName}`,
            message: `Agent ${agent.heartbeat.agentName} has critical issues: ${criticalIssue.join(", ")}`,
            agentId,
            agentName: agent.heartbeat.agentName,
            metadata: {
              cpu: resources.cpu.usage,
              memory: resources.memory.percentage,
              tunnelConnected: agent.heartbeat.tunnel.connected,
              activeJobs: agent.heartbeat.activeJobs,
              failedJobs: agent.heartbeat.failedJobs,
            },
            timestamp: new Date().toISOString(),
            requiresAck: true,
          })
        }
      }
      
      status = "degraded"
    }

    // Check tunnel connectivity (aggregate across all agents)
    let tunnelConnected = false
    let activeTunnelAgents = 0
    
    for (const [agentId, agentTelemetry] of allAgents.entries()) {
      if (agentTelemetry.heartbeat.tunnel.connected) {
        tunnelConnected = true
        activeTunnelAgents++
      }
    }

    // If no agents have tunnel connectivity and we have agents, mark as unavailable
    if (stats.totalAgents > 0 && !tunnelConnected) {
      status = "unavailable"
      issues.push("No active tunnel connections")
    }

    // Calculate uptime (time since first agent was seen)
    let uptime = 0
    let firstSeen: number | null = null
    
    for (const [, agentTelemetry] of allAgents.entries()) {
      if (!firstSeen || agentTelemetry.firstSeen < firstSeen) {
        firstSeen = agentTelemetry.firstSeen
      }
    }
    
    if (firstSeen) {
      uptime = Date.now() - firstSeen
    }

    // Find last telemetry update time
    let lastTelemetryUpdate: string | undefined
    let lastUpdateTime = 0
    
    for (const [, agentTelemetry] of allAgents.entries()) {
      if (agentTelemetry.lastUpdated > lastUpdateTime) {
        lastUpdateTime = agentTelemetry.lastUpdated
      }
    }
    
    if (lastUpdateTime > 0) {
      lastTelemetryUpdate = new Date(lastUpdateTime).toISOString()
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status,
      version: process.env.npm_package_version || "1.0.0",
      uptime,
      agents: {
        total: stats.totalAgents,
        online: stats.onlineAgents,
        offline: stats.offlineAgents,
        degraded: stats.degradedAgents,
      },
      tunnel: {
        connected: tunnelConnected,
        activeAgents: activeTunnelAgents,
      },
      lastTelemetryUpdate,
      responseTime,
      issues: issues.length > 0 ? issues : undefined,
    })
  } catch (error) {
    console.error("[Health/Ready] Error:", error)

    return NextResponse.json(
      {
        status: "unavailable",
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
