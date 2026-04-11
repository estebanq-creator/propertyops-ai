"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AgentStatusCard, AgentStatusCardSkeleton } from "@/components/dashboard/AgentStatusCard"
import { SystemHealthIndicator, SystemHealthIndicatorSkeleton } from "@/components/dashboard/SystemHealthIndicator"

// Demo data - replace with real API calls
const demoAgents = [
  {
    agentId: "agent-001",
    agentName: "Bookkeeping Agent",
    description: "Handles daily reconciliation and P&L generation",
    metrics: {
      cpuUsage: 45.2,
      memoryUsage: 62.8,
      queueDepth: 23,
      lastHeartbeat: new Date().toISOString(),
      status: "active" as const,
    },
  },
  {
    agentId: "agent-002",
    agentName: "Deployment Agent",
    description: "Manages Vercel deployments and CI/CD",
    metrics: {
      cpuUsage: 12.5,
      memoryUsage: 34.2,
      queueDepth: 5,
      lastHeartbeat: new Date(Date.now() - 120000).toISOString(), // 2 min ago
      status: "idle" as const,
    },
  },
  {
    agentId: "agent-003",
    agentName: "Monitoring Agent",
    description: "System health and telemetry collection",
    metrics: {
      cpuUsage: 78.9,
      memoryUsage: 81.3,
      queueDepth: 156,
      lastHeartbeat: new Date(Date.now() - 300000).toISOString(), // 5 min ago
      status: "error" as const,
    },
  },
  {
    agentId: "agent-004",
    agentName: "Backup Agent",
    description: "Automated backups and data synchronization",
    metrics: {
      cpuUsage: 0,
      memoryUsage: 0,
      queueDepth: 0,
      lastHeartbeat: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      status: "offline" as const,
    },
  },
]

const demoSystemMetrics = {
  overallScore: 87,
  tailscale: {
    connected: true,
    peerCount: 4,
    latency: 23,
    lastUpdate: new Date().toISOString(),
  },
  lastTelemetryUpdate: new Date().toISOString(),
  activeAgents: 3,
  totalAgents: 4,
  systemUptime: 168, // 168 hours = 7 days
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [agents, setAgents] = React.useState<typeof demoAgents>([])
  const [systemMetrics, setSystemMetrics] = React.useState<typeof demoSystemMetrics | null>(null)

  // Simulate data fetching
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAgents(demoAgents)
      setSystemMetrics(demoSystemMetrics)
      setIsLoading(false)
    }, 800) // Simulate network delay

    return () => clearTimeout(timer)
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and management for PropertyOps AI agents
          </p>
        </div>

        {/* System Health - Full Width */}
        {isLoading ? (
          <SystemHealthIndicatorSkeleton />
        ) : systemMetrics ? (
          <SystemHealthIndicator metrics={systemMetrics} />
        ) : null}

        {/* Agents Grid */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Agents</h2>
            <span className="text-sm text-muted-foreground">
              {agents.filter(a => a.metrics.status === "active" || a.metrics.status === "idle").length} of {agents.length} operational
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <AgentStatusCardSkeleton key={i} />
                ))
              : agents.map((agent) => (
                  <AgentStatusCard
                    key={agent.agentId}
                    agentId={agent.agentId}
                    agentName={agent.agentName}
                    description={agent.description}
                    metrics={agent.metrics}
                  />
                ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Agents"
            value={agents.length.toString()}
            description="Configured in system"
          />
          <StatCard
            title="Active Now"
            value={agents.filter(a => a.metrics.status === "active").length.toString()}
            description="Currently processing"
          />
          <StatCard
            title="Queue Depth"
            value={agents.reduce((sum, a) => sum + a.metrics.queueDepth, 0).toString()}
            description="Total pending tasks"
          />
          <StatCard
            title="Avg CPU Usage"
            value={`${(agents.reduce((sum, a) => sum + a.metrics.cpuUsage, 0) / agents.length).toFixed(1)}%`}
            description="Across all agents"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
