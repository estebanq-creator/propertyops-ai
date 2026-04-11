"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import {
  CronJob,
  CronJobStatus,
  CronSchedule,
  CRON_PRESETS,
  CronJobResult,
} from "@/lib/validations/cron"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn, formatRelativeTime } from "@/lib/utils"
import {
  Calendar,
  Clock,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Settings,
  Trash2,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Timer,
  Zap,
  Lock,
  Eye,
  Copy,
  MoreVertical,
  Search,
  Filter,
  X,
  Plus,
  Download,
  EyeOff,
  Bell,
  BellOff,
  Server,
  FileCode,
  Globe,
  Link,
} from "lucide-react"

interface CronJobManagerProps {
  jobs: CronJob[]
  isLoading?: boolean
  onJobSelect?: (job: CronJob) => void
  onToggleStatus?: (jobId: string, status: CronJobStatus) => void
  onExecute?: (jobId: string) => void
  onViewHistory?: (jobId: string) => void
  className?: string
}

/**
 * CronJobManager - Visual cron job management interface
 * 
 * Phase 2: Read-only view with disabled controls (scaffolded for Phase 3)
 * Phase 3: Full management capabilities
 * 
 * Features:
 * - Visual list view with job status indicators
 * - Next run time display
 * - Execution history summary
 * - Success/failure statistics
 * - Disabled controls for Phase 3 scaffolding
 */
export function CronJobManager({
  jobs,
  isLoading = false,
  onJobSelect,
  onToggleStatus,
  onExecute,
  onViewHistory,
  className,
}: CronJobManagerProps) {
  const [filter, setFilter] = useState<CronJobStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null)
  const [showPhase3Notice, setShowPhase3Notice] = useState(false)

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs]

    // Status filter
    if (filter !== "all") {
      result = result.filter((job) => job.status === filter)
    }

    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      result = result.filter(
        (job) =>
          job.name.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.metadata?.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }

    // Sort by next run time
    result.sort((a, b) => {
      if (!a.nextRun && !b.nextRun) return 0
      if (!a.nextRun) return 1
      if (!b.nextRun) return -1
      return new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime()
    })

    return result
  }, [jobs, filter, searchQuery])

  // Calculate aggregate stats
  const aggregateStats = useMemo(() => {
    const total = jobs.length
    const active = jobs.filter((j) => j.status === "active").length
    const paused = jobs.filter((j) => j.status === "paused").length
    const disabled = jobs.filter((j) => j.status === "disabled").length
    const running = jobs.filter((j) => j.status === "running").length
    const failed = jobs.filter((j) => j.status === "failed").length

    const totalRuns = jobs.reduce((sum, j) => sum + j.stats.totalRuns, 0)
    const successfulRuns = jobs.reduce((sum, j) => sum + j.stats.successfulRuns, 0)
    const failedRuns = jobs.reduce((sum, j) => sum + j.stats.failedRuns, 0)

    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0

    return {
      total,
      active,
      paused,
      disabled,
      running,
      failed,
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate,
    }
  }, [jobs])

  const handlePhase3Action = () => {
    setShowPhase3Notice(true)
  }

  const getStatusIcon = (status: CronJobStatus) => {
    switch (status) {
      case "active":
        return <CheckCircle2 size={16} className="text-green-600" />
      case "paused":
        return <Pause size={16} className="text-yellow-600" />
      case "disabled":
        return <StopCircle size={16} className="text-red-600" />
      case "running":
        return <RefreshCw size={16} className="text-blue-600 animate-spin" />
      case "failed":
        return <AlertTriangle size={16} className="text-orange-600" />
      default:
        return <Info size={16} className="text-muted-foreground" />
    }
  }

  const getStatusColor = (status: CronJobStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "disabled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "running":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "failed":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "command":
        return <FileCode size={16} />
      case "script":
        return <Server size={16} />
      case "webhook":
        return <Globe size={16} />
      case "api":
        return <Link size={16} />
      default:
        return <Settings size={16} />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        {/* Aggregate Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{aggregateStats.total}</p>
                </div>
                <Calendar size={24} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{aggregateStats.active}</p>
                </div>
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {aggregateStats.successRate.toFixed(1)}%
                  </p>
                </div>
                <BarChart3 size={24} className="text-blue-600" />
              </div>
              <Progress
                value={aggregateStats.successRate}
                className="mt-2 h-1"
                indicatorClassName={
                  aggregateStats.successRate > 90
                    ? "bg-green-600"
                    : aggregateStats.successRate > 70
                      ? "bg-yellow-600"
                      : "bg-red-600"
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                  <p className="text-2xl font-bold">{aggregateStats.totalRuns}</p>
                </div>
                <Timer size={24} className="text-purple-600" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {aggregateStats.successfulRuns} successful,{" "}
                {aggregateStats.failedRuns} failed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as CronJobStatus | "all")}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" disabled>
                  <Plus size={16} className="mr-2" />
                  New Job
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Available in Phase 3</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Cron Job List */}
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar size={48} className="mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold">No cron jobs found</h3>
                <p className="text-sm text-muted-foreground">
                  Adjust your filters or create a new job
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => {
              const isExpanded = expandedJob === job.id
              const TargetIcon = getTargetIcon(job.target.type)
              const successRate =
                job.stats.totalRuns > 0
                  ? (job.stats.successfulRuns / job.stats.totalRuns) * 100
                  : null

              return (
                <Card key={job.id} className={cn(isExpanded && "ring-2 ring-primary")}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Status Icon */}
                        <div className="mt-1">{getStatusIcon(job.status)}</div>

                        {/* Job Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{job.name}</CardTitle>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                            {job.metadata?.category && (
                              <Badge variant="outline">{job.metadata.category}</Badge>
                            )}
                          </div>
                          <CardDescription className="mt-1">
                            {job.description}
                          </CardDescription>
                        </div>
                      </div>

                      {/* Action Buttons (Phase 3 scaffolding) */}
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handlePhase3Action}
                              disabled={job.status === "running"}
                            >
                              <Play size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Run Now (Phase 3)</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handlePhase3Action}
                            >
                              {job.status === "paused" ? (
                                <Play size={16} />
                              ) : (
                                <Pause size={16} />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {job.status === "paused" ? "Resume" : "Pause"} (Phase 3)
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handlePhase3Action}
                            >
                              <Settings size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Configure (Phase 3)</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isExpanded ? "Collapse" : "Expand"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Quick Stats Row */}
                  <CardContent className="pb-3">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {/* Schedule */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={14} />
                        <span className="font-mono text-xs">
                          {job.schedule.expression}
                        </span>
                      </div>

                      {/* Next Run */}
                      {job.nextRun && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={14} />
                          <span>
                            Next: {new Date(job.nextRun).toLocaleString()}
                          </span>
                          <span className="text-xs">
                            ({formatRelativeTime(job.nextRun)})
                          </span>
                        </div>
                      )}

                      {/* Last Run */}
                      {job.lastRun && (
                        <div className="flex items-center gap-2">
                          {job.lastRun.success ? (
                            <CheckCircle2 size={14} className="text-green-600" />
                          ) : (
                            <XCircle size={14} className="text-red-600" />
                          )}
                          <span className="text-muted-foreground">
                            Last: {formatRelativeTime(job.lastRun.startedAt)}
                          </span>
                        </div>
                      )}

                      {/* Success Rate */}
                      {successRate !== null && (
                        <div className="flex items-center gap-2">
                          <BarChart3 size={14} className="text-blue-600" />
                          <span
                            className={cn(
                              "font-medium",
                              successRate > 90
                                ? "text-green-600"
                                : successRate > 70
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            )}
                          >
                            {successRate.toFixed(0)}% success
                          </span>
                        </div>
                      )}

                      {/* Consecutive Failures */}
                      {job.stats.consecutiveFailures > 0 && (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertTriangle size={14} />
                          <span className="font-medium">
                            {job.stats.consecutiveFailures} consecutive failures
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t">
                      <CardContent className="pt-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          {/* Schedule Details */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                              <Calendar size={14} />
                              Schedule
                            </h4>
                            <div className="rounded-md border bg-muted/50 p-3 text-sm">
                              <p className="mb-2">
                                <strong>Expression:</strong>{" "}
                                <code className="font-mono text-xs">
                                  {job.schedule.expression}
                                </code>
                              </p>
                              <p className="mb-2">
                                <strong>Description:</strong>{" "}
                                {job.schedule.description}
                              </p>
                              <p>
                                <strong>Timezone:</strong>{" "}
                                {job.schedule.timezone}
                              </p>
                              {job.schedule.nextRuns &&
                                job.schedule.nextRuns.length > 0 && (
                                  <div className="mt-2">
                                    <strong>Next Runs:</strong>
                                    <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                                      {job.schedule.nextRuns.slice(0, 5).map((run, i) => (
                                        <li key={i}>
                                          {new Date(run).toLocaleString()}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Target Details */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                              {TargetIcon}
                              Execution Target
                            </h4>
                            <div className="rounded-md border bg-muted/50 p-3 text-sm">
                              <p className="mb-2">
                                <strong>Type:</strong>{" "}
                                {job.target.type.charAt(0).toUpperCase() +
                                  job.target.type.slice(1)}
                              </p>
                              {job.target.command && (
                                <p className="mb-2">
                                  <strong>Command:</strong>{" "}
                                  <code className="font-mono text-xs break-all">
                                    {job.target.command}
                                  </code>
                                </p>
                              )}
                              {job.target.scriptPath && (
                                <p className="mb-2">
                                  <strong>Script:</strong>{" "}
                                  <code className="font-mono text-xs">
                                    {job.target.scriptPath}
                                  </code>
                                </p>
                              )}
                              {job.target.webhookUrl && (
                                <p className="mb-2">
                                  <strong>Webhook:</strong>{" "}
                                  <code className="font-mono text-xs break-all">
                                    {job.target.webhookUrl}
                                  </code>
                                </p>
                              )}
                              {job.target.workingDirectory && (
                                <p>
                                  <strong>Working Dir:</strong>{" "}
                                  {job.target.workingDirectory}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Execution Statistics */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                              <BarChart3 size={14} />
                              Statistics
                            </h4>
                            <div className="rounded-md border bg-muted/50 p-3">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Total Runs</p>
                                  <p className="font-medium">{job.stats.totalRuns}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Successful</p>
                                  <p className="font-medium text-green-600">
                                    {job.stats.successfulRuns}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Failed</p>
                                  <p className="font-medium text-red-600">
                                    {job.stats.failedRuns}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Avg Duration</p>
                                  <p className="font-medium">
                                    {job.stats.averageDuration
                                      ? `${(job.stats.averageDuration / 1000).toFixed(1)}s`
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                              {job.stats.lastSuccess && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Last success:{" "}
                                  {new Date(job.stats.lastSuccess).toLocaleString()}
                                </p>
                              )}
                              {job.stats.lastFailure && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Last failure:{" "}
                                  {new Date(job.stats.lastFailure).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Configuration */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                              <Settings size={14} />
                              Configuration
                            </h4>
                            <div className="rounded-md border bg-muted/50 p-3 text-sm">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-muted-foreground">Timeout</p>
                                  <p className="font-medium">
                                    {(job.config.timeout / 60).toFixed(0)} min
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Retry</p>
                                  <p className="font-medium">
                                    {job.config.retry?.enabled
                                      ? `${job.config.retry.maxAttempts} attempts`
                                      : "Disabled"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Notifications</p>
                                  <p className="font-medium">
                                    {job.config.notifications?.onFailure ? "On Failure" : "None"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Concurrency</p>
                                  <p className="font-medium">
                                    {job.config.concurrency?.allowParallel
                                      ? "Parallel"
                                      : "Sequential"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Last Execution Details */}
                        {job.lastRun && (
                          <div className="mt-4">
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                              <History size={14} />
                              Last Execution Details
                            </h4>
                            <div
                              className={cn(
                                "rounded-md border p-3",
                                job.lastRun.success
                                  ? "bg-green-50 dark:bg-green-900/20"
                                  : "bg-red-50 dark:bg-red-900/20"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {job.lastRun.success ? (
                                  <CheckCircle2 size={16} className="text-green-600" />
                                ) : (
                                  <XCircle size={16} className="text-red-600" />
                                )}
                                <span className="font-medium">
                                  {job.lastRun.success ? "Success" : "Failed"}
                                </span>
                                {job.lastRun.duration && (
                                  <span className="text-sm text-muted-foreground">
                                    ({(job.lastRun.duration / 1000).toFixed(2)}s)
                                  </span>
                                )}
                              </div>
                              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Started: </span>
                                  {new Date(job.lastRun.startedAt).toLocaleString()}
                                </div>
                                {job.lastRun.completedAt && (
                                  <div>
                                    <span className="text-muted-foreground">Completed: </span>
                                    {new Date(job.lastRun.completedAt).toLocaleString()}
                                  </div>
                                )}
                                {job.lastRun.exitCode !== undefined && (
                                  <div>
                                    <span className="text-muted-foreground">Exit Code: </span>
                                    <span
                                      className={cn(
                                        "font-mono",
                                        job.lastRun.exitCode === 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      )}
                                    >
                                      {job.lastRun.exitCode}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {job.lastRun.output && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium mb-1">Output:</p>
                                  <pre className="overflow-auto rounded bg-background p-2 text-xs">
                                    {job.lastRun.output}
                                  </pre>
                                </div>
                              )}
                              {job.lastRun.error && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-red-600 mb-1">Error:</p>
                                  <pre className="overflow-auto rounded bg-background p-2 text-xs text-red-600">
                                    {job.lastRun.error}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePhase3Action}
                            disabled={job.status === "running"}
                          >
                            <Play size={14} className="mr-2" />
                            Run Now
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePhase3Action}
                          >
                            {job.status === "paused" ? (
                              <>
                                <Play size={14} className="mr-2" />
                                Resume
                              </>
                            ) : (
                              <>
                                <Pause size={14} className="mr-2" />
                                Pause
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePhase3Action}
                          >
                            <Settings size={14} className="mr-2" />
                            Configure
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewHistory?.(job.id)}
                          >
                            <History size={14} className="mr-2" />
                            View History
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePhase3Action}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete
                          </Button>
                        </div>

                        {/* Phase 2 Notice */}
                        <p className="mt-3 text-xs text-muted-foreground italic">
                          ⚠️ Phase 2: Controls are read-only. Full management available in Phase 3.
                        </p>
                      </CardContent>
                    </div>
                  )}
                </Card>
              )
            })
          )}
        </div>

        {/* Phase 3 Notice Dialog */}
        <Dialog open={showPhase3Notice} onOpenChange={setShowPhase3Notice}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock size={20} />
                Phase 3 Feature
              </DialogTitle>
              <DialogDescription>
                This functionality will be available in Phase 3 of Mission Control.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm">
                Phase 2 provides read-only visibility into cron jobs and audit logs.
                Full management capabilities including:
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                <li>Create, edit, and delete cron jobs</li>
                <li>Manual job execution</li>
                <li>Enable/disable jobs</li>
                <li>Configure schedules and targets</li>
                <li>Set up notifications and retries</li>
              </ul>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowPhase3Notice(false)}>
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

// Input component used in the manager
function Input({
  placeholder,
  value,
  onChange,
  className,
}: {
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  )
}
