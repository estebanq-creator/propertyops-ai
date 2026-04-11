import { AgentHeartbeat, AgentStatus, TunnelStatus, ResourceMetrics } from "@/lib/validations/health"

/**
 * In-memory telemetry store for agent health tracking
 * 
 * In production, replace with Redis or database-backed store
 * for multi-instance support and persistence
 */

interface AgentTelemetry {
  heartbeat: AgentHeartbeat
  lastPing: number
  responseTimes: number[]
  consecutiveFailures: number
  firstSeen: number
  lastUpdated: number
}

interface TelemetryStats {
  totalAgents: number
  onlineAgents: number
  offlineAgents: number
  degradedAgents: number
  averageResponseTime: number
  tunnelLatencyAvg: number
}

class TelemetryStore {
  private agents: Map<string, AgentTelemetry> = new Map()
  private readonly maxResponseTimeSamples = 100
  private readonly offlineThresholdMs = 300000 // 5 minutes
  private readonly degradedThresholdMs = 60000 // 1 minute

  /**
   * Record agent heartbeat
   */
  recordHeartbeat(agentId: string, heartbeat: AgentHeartbeat): void {
    const now = Date.now()
    
    const existing = this.agents.get(agentId)
    
    if (existing) {
      // Update existing agent
      existing.heartbeat = heartbeat
      existing.lastUpdated = now
      existing.consecutiveFailures = 0
    } else {
      // New agent
      this.agents.set(agentId, {
        heartbeat,
        lastPing: now,
        responseTimes: [],
        consecutiveFailures: 0,
        firstSeen: now,
        lastUpdated: now,
      })
    }
  }

  /**
   * Record ping response time
   */
  recordPing(agentId: string, responseTimeMs: number): void {
    const agent = this.agents.get(agentId)
    if (!agent) return

    agent.lastPing = Date.now()
    agent.responseTimes.push(responseTimeMs)

    // Keep only last N samples
    if (agent.responseTimes.length > this.maxResponseTimeSamples) {
      agent.responseTimes.shift()
    }
  }

  /**
   * Get agent telemetry
   */
  getAgent(agentId: string): AgentTelemetry | undefined {
    return this.agents.get(agentId)
  }

  /**
   * Get all agents
   */
  getAllAgents(): Map<string, AgentTelemetry> {
    return new Map(this.agents)
  }

  /**
   * Get agent status based on last heartbeat time
   */
  getAgentStatus(agentId: string): AgentStatus {
    const agent = this.agents.get(agentId)
    if (!agent) return "offline"

    const elapsed = Date.now() - agent.lastUpdated
    const heartbeatStatus = agent.heartbeat.status

    // If heartbeat says stopped, respect that
    if (heartbeatStatus === "stopped") return "offline"
    if (heartbeatStatus === "starting") return "starting"

    // If no recent update, mark as offline
    if (elapsed > this.offlineThresholdMs) {
      return "offline"
    }

    // If slightly stale, mark as degraded
    if (elapsed > this.degradedThresholdMs) {
      return "degraded"
    }

    return heartbeatStatus
  }

  /**
   * Get agents by status
   */
  getAgentsByStatus(status: AgentStatus): AgentTelemetry[] {
    const result: AgentTelemetry[] = []
    
    for (const [agentId, telemetry] of this.agents.entries()) {
      if (this.getAgentStatus(agentId) === status) {
        result.push(telemetry)
      }
    }
    
    return result
  }

  /**
   * Get offline agents (no heartbeat for > 5 mins)
   */
  getOfflineAgents(): AgentTelemetry[] {
    return this.getAgentsByStatus("offline")
  }

  /**
   * Get average response time for an agent
   */
  getAverageResponseTime(agentId: string): number | null {
    const agent = this.agents.get(agentId)
    if (!agent || agent.responseTimes.length === 0) return null

    const sum = agent.responseTimes.reduce((a, b) => a + b, 0)
    return sum / agent.responseTimes.length
  }

  /**
   * Get tunnel status for an agent
   */
  getTunnelStatus(agentId: string): TunnelStatus | null {
    const agent = this.agents.get(agentId)
    return agent?.heartbeat.tunnel || null
  }

  /**
   * Get resource metrics for an agent
   */
  getResourceMetrics(agentId: string): ResourceMetrics | null {
    const agent = this.agents.get(agentId)
    return agent?.heartbeat.resources || null
  }

  /**
   * Calculate overall system stats
   */
  getStats(): TelemetryStats {
    const totalAgents = this.agents.size
    let onlineAgents = 0
    let offlineAgents = 0
    let degradedAgents = 0
    let totalResponseTime = 0
    let responseTimeCount = 0
    let totalTunnelLatency = 0
    let tunnelLatencyCount = 0

    for (const [agentId, telemetry] of this.agents.entries()) {
      const status = this.getAgentStatus(agentId)
      
      switch (status) {
        case "online":
          onlineAgents++
          break
        case "offline":
          offlineAgents++
          break
        case "degraded":
        case "starting":
          degradedAgents++
          break
      }

      // Response times
      if (telemetry.responseTimes.length > 0) {
        totalResponseTime += telemetry.responseTimes.reduce((a, b) => a + b, 0)
        responseTimeCount += telemetry.responseTimes.length
      }

      // Tunnel latency
      const tunnelLatency = telemetry.heartbeat.tunnel.latency
      if (tunnelLatency) {
        totalTunnelLatency += tunnelLatency
        tunnelLatencyCount++
      }
    }

    return {
      totalAgents,
      onlineAgents,
      offlineAgents,
      degradedAgents,
      averageResponseTime: responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0,
      tunnelLatencyAvg: tunnelLatencyCount > 0 ? totalTunnelLatency / tunnelLatencyCount : 0,
    }
  }

  /**
   * Check for agents that have been offline too long
   * Returns agents offline for more than threshold
   */
  checkOfflineAgents(thresholdMs: number = this.offlineThresholdMs): AgentTelemetry[] {
    const now = Date.now()
    const offline: AgentTelemetry[] = []

    for (const [agentId, telemetry] of this.agents.entries()) {
      const elapsed = now - telemetry.lastUpdated
      if (elapsed > thresholdMs) {
        offline.push(telemetry)
      }
    }

    return offline
  }

  /**
   * Get agents with critical health issues
   */
  getCriticalHealthAgents(): AgentTelemetry[] {
    const critical: AgentTelemetry[] = []

    for (const [agentId, telemetry] of this.agents.entries()) {
      const resources = telemetry.heartbeat.resources
      
      // Check for critical resource usage
      if (resources.memory.percentage > 95) {
        critical.push(telemetry)
        continue
      }
      if (resources.cpu.usage > 95) {
        critical.push(telemetry)
        continue
      }

      // Check for tunnel issues
      if (!telemetry.heartbeat.tunnel.connected) {
        critical.push(telemetry)
        continue
      }

      // Check for high failure rate
      const totalJobs = telemetry.heartbeat.activeJobs + telemetry.heartbeat.queuedJobs + telemetry.heartbeat.failedJobs
      if (totalJobs > 0) {
        const failureRate = telemetry.heartbeat.failedJobs / totalJobs
        if (failureRate > 0.5) {
          critical.push(telemetry)
        }
      }
    }

    return critical
  }

  /**
   * Remove an agent from the store
   */
  removeAgent(agentId: string): boolean {
    return this.agents.delete(agentId)
  }

  /**
   * Clear all telemetry data
   */
  clear(): void {
    this.agents.clear()
  }

  /**
   * Get store size
   */
  size(): number {
    return this.agents.size
  }

  /**
   * Export telemetry for persistence
   */
  export(): Record<string, AgentTelemetry> {
    return Object.fromEntries(this.agents)
  }

  /**
   * Import telemetry from persistence
   */
  import(data: Record<string, AgentTelemetry>): void {
    this.agents = new Map(Object.entries(data))
  }
}

// Singleton instance
let telemetryStore: TelemetryStore | null = null

export function getTelemetryStore(): TelemetryStore {
  if (!telemetryStore) {
    telemetryStore = new TelemetryStore()
  }
  return telemetryStore
}

// Convenience export for direct use
export const telemetry = getTelemetryStore()
