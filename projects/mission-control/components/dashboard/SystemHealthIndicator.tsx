"use client"

import * as React from "react"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn, formatRelativeTime, getHealthScoreColor } from "@/lib/utils"
import { Activity, CheckCircle2, CircleDashed, Clock, Network, ShieldAlert, Wifi, WifiOff } from "lucide-react"

export interface TailscaleStatus {
  connected: boolean
  peerCount: number
  latency?: number // in ms
  lastUpdate?: Date | string
}

export interface SystemHealthMetrics {
  overallScore: number // 0-100
  tailscale: TailscaleStatus
  lastTelemetryUpdate: Date | string
  activeAgents: number
  totalAgents: number
  systemUptime?: number // in hours
}

export interface SystemHealthIndicatorProps {
  metrics: SystemHealthMetrics
  className?: string
  compact?: boolean
}

/**
 * SystemHealthIndicator - Displays overall system health with Tailscale tunnel status
 * 
 * Performance: Uses useMemo for all calculations, suitable for RSC or client component
 * Accessibility: WCAG 2.1 AA compliant with proper ARIA labels, roles, and color contrast
 */
export function SystemHealthIndicator({
  metrics,
  className,
  compact = false,
}: SystemHealthIndicatorProps) {
  // Memoize health score calculation
  const healthData = useMemo(() => {
    const score = metrics.overallScore
    const color = getHealthScoreColor(score)
    const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F"
    const label = score >= 90 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Critical"
    
    return { score, color, grade, label }
  }, [metrics.overallScore])

  // Memoize Tailscale status
  const tailscaleData = useMemo(() => {
    const { connected, peerCount, latency } = metrics.tailscale
    
    return {
      isConnected: connected,
      statusText: connected ? "Connected" : "Disconnected",
      statusColor: connected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
      iconBg: connected ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30",
      peerLabel: `${peerCount} peer${peerCount !== 1 ? "s" : ""}`,
      latencyText: latency ? `${latency}ms` : "N/A",
    }
  }, [metrics.tailscale])

  // Memoize telemetry timestamp
  const telemetryData = useMemo(() => {
    const relativeTime = formatRelativeTime(metrics.lastTelemetryUpdate)
    const isStale = new Date().getTime() - new Date(metrics.lastTelemetryUpdate).getTime() > 5 * 60 * 1000 // 5 minutes
    
    return {
      relativeTime,
      isStale,
      staleWarning: isStale ? "Telemetry data may be outdated" : null,
    }
  }, [metrics.lastTelemetryUpdate])

  // Memoize agent status
  const agentData = useMemo(() => {
    const percentage = (metrics.activeAgents / metrics.totalAgents) * 100
    return {
      percentage,
      label: `${metrics.activeAgents}/${metrics.totalAgents} active`,
    }
  }, [metrics.activeAgents, metrics.totalAgents])

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-lg border bg-background p-4",
          className
        )}
        role="status"
        aria-label="System health summary"
      >
        {/* Health Score */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold",
              healthData.color.replace("text-", "border-"),
              healthData.color.replace("text-", "bg-").replace("600", "100").replace("400", "900/30")
            )}
            aria-label={`Health score: ${healthData.score}%`}
          >
            <span className={healthData.color}>{healthData.grade}</span>
          </div>
          <div>
            <p className={cn("text-sm font-medium", healthData.color)}>
              {healthData.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {healthData.score}% overall
            </p>
          </div>
        </div>

        {/* Tailscale Status */}
        <div className="flex items-center gap-2 border-l pl-4">
          {tailscaleData.isConnected ? (
            <Wifi size={20} className="text-green-600 dark:text-green-400" aria-hidden="true" />
          ) : (
            <WifiOff size={20} className="text-red-600 dark:text-red-400" aria-hidden="true" />
          )}
          <div>
            <p className={cn("text-sm font-medium", tailscaleData.statusColor)}>
              {tailscaleData.statusText}
            </p>
            <p className="text-xs text-muted-foreground">
              {tailscaleData.peerLabel}
            </p>
          </div>
        </div>

        {/* Telemetry */}
        <div className="flex items-center gap-2 border-l pl-4">
          <Clock size={16} className="text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="text-sm text-muted-foreground">Last update</p>
            <time
              dateTime={new Date(metrics.lastTelemetryUpdate).toISOString()}
              className={cn(
                "text-xs font-medium",
                telemetryData.isStale && "text-yellow-600 dark:text-yellow-400"
              )}
            >
              {telemetryData.relativeTime}
            </time>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("transition-all duration-200", className)} role="article" aria-label="System health dashboard">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity size={20} className="text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg font-semibold">System Health</CardTitle>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold",
              healthData.color.replace("text-", "bg-").replace("600", "100").replace("400", "900/30"),
              healthData.color
            )}
            role="status"
            aria-label={`Overall health: ${healthData.label}`}
          >
            {healthData.grade} · {healthData.score}%
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Health Score Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Health Score</span>
            <span className={cn("font-semibold", healthData.color)}>
              {healthData.label}
            </span>
          </div>
          <Progress
            value={metrics.overallScore}
            className={cn(
              "h-3",
              metrics.overallScore >= 90 ? "[&>div]:bg-green-500" :
              metrics.overallScore >= 70 ? "[&>div]:bg-yellow-500" :
              "[&>div]:bg-red-500"
            )}
            aria-label={`Health score: ${metrics.overallScore} percent`}
          />
        </div>

        {/* Tailscale Tunnel Status */}
        <div
          className={cn(
            "rounded-lg border p-4",
            tailscaleData.isConnected ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" :
            "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          )}
          role="region"
          aria-label="Tailscale tunnel status"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  tailscaleData.iconBg
                )}
                aria-hidden="true"
              >
                {tailscaleData.isConnected ? (
                  <Network size={20} className={tailscaleData.statusColor} />
                ) : (
                  <ShieldAlert size={20} className={tailscaleData.statusColor} />
                )}
              </div>
              <div>
                <p className={cn("text-sm font-semibold", tailscaleData.statusColor)}>
                  Tailscale Tunnel
                </p>
                <p className="text-xs text-muted-foreground">
                  {tailscaleData.statusText} · {tailscaleData.peerLabel}
                  {metrics.tailscale.latency && ` · ${tailscaleData.latencyText} latency`}
                </p>
              </div>
            </div>
            {tailscaleData.isConnected ? (
              <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" aria-hidden="true" />
            ) : (
              <CircleDashed size={24} className="text-red-600 dark:text-red-400" aria-hidden="true" />
            )}
          </div>
        </div>

        {/* Telemetry & Agents Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Last Telemetry Update */}
          <div
            className={cn(
              "rounded-lg border p-4",
              telemetryData.isStale && "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
            )}
          >
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Last Telemetry Update</span>
            </div>
            <time
              dateTime={new Date(metrics.lastTelemetryUpdate).toISOString()}
              className={cn(
                "mt-2 block text-lg font-semibold",
                telemetryData.isStale && "text-yellow-600 dark:text-yellow-400"
              )}
            >
              {telemetryData.relativeTime}
            </time>
            {telemetryData.staleWarning && (
              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                {telemetryData.staleWarning}
              </p>
            )}
          </div>

          {/* Active Agents */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Wifi size={16} className="text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Active Agents</span>
            </div>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-lg font-semibold">{agentData.label}</span>
              <span className="text-xs text-muted-foreground">
                {agentData.percentage.toFixed(0)}% availability
              </span>
            </div>
            <Progress
              value={agentData.percentage}
              className="mt-2 h-2"
              aria-label="Agent availability percentage"
            />
          </div>
        </div>

        {/* System Uptime (if available) */}
        {metrics.systemUptime && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">System Uptime</span>
              <span className="font-medium">
                {metrics.systemUptime >= 24
                  ? `${(metrics.systemUptime / 24).toFixed(1)} days`
                  : `${metrics.systemUptime} hours`}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * SystemHealthIndicatorSkeleton - Loading state for better perceived performance
 */
export function SystemHealthIndicatorSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="h-5 w-32 rounded bg-muted" />
          </div>
          <div className="h-8 w-24 rounded-full bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
          <div className="h-3 w-full rounded bg-muted" />
        </div>
        <div className="h-20 w-full rounded-lg border bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-24 rounded-lg border bg-muted" />
          <div className="h-24 rounded-lg border bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}
