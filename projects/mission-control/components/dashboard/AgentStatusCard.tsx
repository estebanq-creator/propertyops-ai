"use client"

import * as React from "react"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn, formatRelativeTime, getStatusColor } from "@/lib/utils"
import { Activity, Clock, Cpu, HardDrive, Server } from "lucide-react"

export interface AgentMetrics {
  cpuUsage: number // 0-100
  memoryUsage: number // 0-100
  queueDepth: number
  lastHeartbeat: Date | string
  status: "active" | "idle" | "offline" | "error"
}

export interface AgentStatusCardProps {
  agentName: string
  agentId: string
  metrics: AgentMetrics
  description?: string
  className?: string
}

/**
 * AgentStatusCard - Displays real-time agent status with accessibility features
 * 
 * Performance: Uses useMemo for expensive calculations
 * Accessibility: WCAG 2.1 AA compliant with proper ARIA labels and color contrast
 */
export function AgentStatusCard({
  agentName,
  agentId,
  metrics,
  description,
  className,
}: AgentStatusCardProps) {
  // Memoize expensive calculations
  const statusData = useMemo(() => {
    const statusColor = getStatusColor(metrics.status)
    const relativeTime = formatRelativeTime(metrics.lastHeartbeat)
    
    return {
      statusColor,
      relativeTime,
      isHealthy: metrics.status === "active" || metrics.status === "idle",
    }
  }, [metrics.status, metrics.lastHeartbeat])

  const resourceData = useMemo(() => {
    const cpuColor = metrics.cpuUsage > 80 ? "bg-red-500" : metrics.cpuUsage > 50 ? "bg-yellow-500" : "bg-green-500"
    const memoryColor = metrics.memoryUsage > 80 ? "bg-red-500" : metrics.memoryUsage > 50 ? "bg-yellow-500" : "bg-green-500"
    
    return {
      cpuColor,
      memoryColor,
      cpuLabel: `${metrics.cpuUsage.toFixed(1)}%`,
      memoryLabel: `${metrics.memoryUsage.toFixed(1)}%`,
    }
  }, [metrics.cpuUsage, metrics.memoryUsage])

  const queueData = useMemo(() => {
    const queueLevel = metrics.queueDepth > 100 ? "high" : metrics.queueDepth > 50 ? "medium" : "low"
    const queueColor = queueLevel === "high" ? "text-red-600" : queueLevel === "medium" ? "text-yellow-600" : "text-green-600"
    
    return {
      queueLevel,
      queueColor,
    }
  }, [metrics.queueDepth])

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        !statusData.isHealthy && "border-red-200 dark:border-red-800",
        className
      )}
      role="article"
      aria-labelledby={`agent-title-${agentId}`}
      aria-describedby={`agent-desc-${agentId}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                statusData.statusColor
              )}
              aria-hidden="true"
            >
              <Server size={20} />
            </div>
            <div>
              <CardTitle
                id={`agent-title-${agentId}`}
                className="text-lg font-semibold"
              >
                {agentName}
              </CardTitle>
              {description && (
                <CardDescription
                  id={`agent-desc-${agentId}`}
                  className="text-sm"
                >
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
              statusData.statusColor
            )}
            role="status"
            aria-label={`Agent status: ${metrics.status}`}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                metrics.status === "active" ? "bg-green-600 dark:bg-green-400 animate-pulse" :
                metrics.status === "idle" ? "bg-yellow-600 dark:bg-yellow-400" :
                metrics.status === "offline" ? "bg-gray-400" :
                "bg-red-600 dark:bg-red-400"
              )}
              aria-hidden="true"
            />
            {metrics.status.charAt(0).toUpperCase() + metrics.status.slice(1)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Heartbeat */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={16} aria-hidden="true" />
          <span>Last heartbeat: </span>
          <time
            dateTime={new Date(metrics.lastHeartbeat).toISOString()}
            className="font-medium text-foreground"
          >
            {statusData.relativeTime}
          </time>
        </div>

        {/* Resource Usage */}
        <div className="space-y-3" role="group" aria-label="Resource usage">
          {/* CPU */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Cpu size={14} aria-hidden="true" />
                <span className="text-muted-foreground">CPU</span>
              </div>
              <span className="font-medium" aria-label={`CPU usage: ${resourceData.cpuLabel}`}>
                {resourceData.cpuLabel}
              </span>
            </div>
            <Progress
              value={metrics.cpuUsage}
              className={cn("h-2", resourceData.cpuColor)}
              aria-label="CPU usage percentage"
            />
          </div>

          {/* Memory */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <HardDrive size={14} aria-hidden="true" />
                <span className="text-muted-foreground">Memory</span>
              </div>
              <span className="font-medium" aria-label={`Memory usage: ${resourceData.memoryLabel}`}>
                {resourceData.memoryLabel}
              </span>
            </div>
            <Progress
              value={metrics.memoryUsage}
              className={cn("h-2", resourceData.memoryColor)}
              aria-label="Memory usage percentage"
            />
          </div>
        </div>

        {/* Queue Depth */}
        <div
          className={cn(
            "flex items-center justify-between rounded-md border p-3",
            queueData.queueLevel === "high" && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
            queueData.queueLevel === "medium" && "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
          )}
        >
          <div className="flex items-center gap-2">
            <Activity size={16} className={queueData.queueColor} aria-hidden="true" />
            <span className="text-sm text-muted-foreground">Queue Depth</span>
          </div>
          <span
            className={cn("text-sm font-semibold", queueData.queueColor)}
            aria-label={`Queue depth: ${metrics.queueDepth} items`}
          >
            {metrics.queueDepth} items
          </span>
        </div>

        {/* Agent ID */}
        <div className="pt-2 text-xs text-muted-foreground">
          <span className="font-mono">ID: {agentId}</span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * AgentStatusCardSkeleton - Loading state for better perceived performance
 */
export function AgentStatusCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          </div>
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
            <div className="h-2 w-full rounded bg-muted" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
            <div className="h-2 w-full rounded bg-muted" />
          </div>
        </div>
        <div className="h-12 w-full rounded-md border bg-muted" />
      </CardContent>
    </Card>
  )
}
