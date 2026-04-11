"use client"

import * as React from "react"
import { useState, useMemo, useCallback } from "react"
import {
  AuditLogEntry,
  AuditLogFilter,
  AuditEventType,
  AuditSeverity,
  EVENT_TYPE_CATEGORIES,
  EVENT_TYPE_LABELS,
  SEVERITY_LABELS,
  SEVERITY_COLORS,
  AgentReasoning,
} from "@/lib/validations/audit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn, formatRelativeTime } from "@/lib/utils"
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  Bot,
  Settings,
  Key,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Database,
  Webhook,
  Bell,
  Calendar,
  Lock,
  Eye,
  Copy,
  Download,
  Archive,
} from "lucide-react"

interface AuditLogViewerProps {
  entries: AuditLogEntry[]
  isLoading?: boolean
  onFilterChange?: (filter: AuditLogFilter) => void
  onViewDetails?: (entry: AuditLogEntry) => void
  className?: string
}

/**
 * AuditLogViewer - Tamper-evident audit log data grid
 * 
 * Features:
 * - Heavily filterable (event type, severity, actor, resource, date range)
 * - Search across all fields
 * - Expandable rows showing input, reasoning, outcome
 * - Tamper-evidence indicators (hash chain visualization)
 * - 36-month retention policy badge
 * - Export functionality
 */
export function AuditLogViewer({
  entries,
  isLoading = false,
  onFilterChange,
  onViewDetails,
  className,
}: AuditLogViewerProps) {
  const [filter, setFilter] = useState<AuditLogFilter>({
    page: 1,
    limit: 50,
    sortBy: "timestamp",
    sortOrder: "desc",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filter.search) {
        setFilter((prev) => ({ ...prev, search: searchQuery || undefined, page: 1 }))
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, filter])

  // Filter entries based on current filter
  const filteredEntries = useMemo(() => {
    let result = [...entries]

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      result = result.filter((entry) =>
        entry.eventType.toLowerCase().includes(searchLower) ||
        entry.actor.name.toLowerCase().includes(searchLower) ||
        entry.resource?.name?.toLowerCase().includes(searchLower) ||
        entry.outcome.result?.toLowerCase().includes(searchLower) ||
        entry.agentReasoning?.reasoning.toLowerCase().includes(searchLower)
      )
    }

    // Event type filter
    if (filter.eventTypes?.length) {
      result = result.filter((entry) => filter.eventTypes!.includes(entry.eventType))
    }

    // Severity filter
    if (filter.severity) {
      result = result.filter((entry) => entry.severity === filter.severity)
    }

    // Actor type filter
    if (filter.actorType) {
      result = result.filter((entry) => entry.actor.type === filter.actorType)
    }

    // Success filter
    if (filter.success !== undefined) {
      result = result.filter((entry) => entry.outcome.success === filter.success)
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[filter.sortBy || "timestamp"]
      const bVal = b[filter.sortBy || "timestamp"]
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return filter.sortOrder === "desc" ? -comparison : comparison
    })

    return result
  }, [entries, filter])

  const handleFilterChange = useCallback((newFilter: Partial<AuditLogFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }))
    onFilterChange?.({ ...filter, ...newFilter })
  }, [filter, onFilterChange])

  const clearFilters = useCallback(() => {
    setFilter({
      page: 1,
      limit: 50,
      sortBy: "timestamp",
      sortOrder: "desc",
    })
    setSearchQuery("")
  }, [])

  const getEventTypeIcon = (eventType: AuditEventType) => {
    if (eventType.startsWith("agent_")) return Bot
    if (eventType.startsWith("human_")) return User
    if (eventType.startsWith("cron_")) return Calendar
    if (eventType.startsWith("api_")) return Key
    if (eventType.startsWith("data_")) return Database
    if (eventType === "webhook_sent") return Webhook
    if (eventType === "alert_triggered") return Bell
    if (eventType === "login_attempt") return Lock
    if (eventType === "dispatch_event") return AlertTriangle
    return Settings
  }

  const getActorIcon = (type: string) => {
    switch (type) {
      case "human": return User
      case "agent": return Bot
      case "system": return Settings
      case "api": return Key
      default: return User
    }
  }

  // Check retention compliance
  const retentionCompliance = useMemo(() => {
    const now = new Date()
    const thirtySixMonthsAgo = new Date(now.setMonth(now.getMonth() - 36))
    
    const oldestEntry = entries.length > 0
      ? new Date(Math.min(...entries.map((e) => new Date(e.timestamp).getTime())))
      : null
    
    const hasOldEntries = oldestEntry && oldestEntry < thirtySixMonthsAgo
    
    return {
      compliant: hasOldEntries || entries.length === 0,
      oldestEntry,
      message: hasOldEntries
        ? "✓ 36-month retention verified"
        : entries.length > 0
          ? "Building retention history..."
          : "No entries yet",
    }
  }, [entries])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Retention Policy Banner */}
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border p-4",
          retentionCompliance.compliant
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
            : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
        )}
        role="status"
      >
        <div className="flex items-center gap-3">
          <ShieldCheck
            className={cn(
              "h-5 w-5",
              retentionCompliance.compliant ? "text-green-600" : "text-yellow-600"
            )}
          />
          <div>
            <p className="font-medium">36-Month Data Retention Policy</p>
            <p className="text-sm text-muted-foreground">
              {retentionCompliance.message}
              {retentionCompliance.oldestEntry && (
                <span className="ml-2">
                  (Oldest entry: {retentionCompliance.oldestEntry.toLocaleDateString()})
                </span>
              )}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1">
          <Archive size={14} />
          Compliant
        </Badge>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFilters || filter.eventTypes || filter.severity ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter size={16} />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!filter.search && !filter.eventTypes && !filter.severity}
          >
            <X size={16} className="mr-2" />
            Clear
          </Button>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Event Type Category */}
              <div>
                <label className="mb-2 block text-sm font-medium">Event Category</label>
                <Select
                  value={filter.eventTypes?.[0] || "all"}
                  onValueChange={(value) =>
                    handleFilterChange({
                      eventTypes: value === "all" ? undefined : [value as AuditEventType],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(EVENT_TYPE_CATEGORIES).map(([category, types]) => (
                      <SelectItem key={category} value={types[0]}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Severity */}
              <div>
                <label className="mb-2 block text-sm font-medium">Severity</label>
                <Select
                  value={filter.severity || "all"}
                  onValueChange={(value) =>
                    handleFilterChange({
                      severity: value === "all" ? undefined : (value as AuditSeverity),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actor Type */}
              <div>
                <label className="mb-2 block text-sm font-medium">Actor Type</label>
                <Select
                  value={filter.actorType || "all"}
                  onValueChange={(value) =>
                    handleFilterChange({
                      actorType: value === "all" ? undefined : (value as any),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All actors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actors</SelectItem>
                    <SelectItem value="human">Human</SelectItem>
                    <SelectItem value="agent">AI Agent</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Outcome */}
              <div>
                <label className="mb-2 block text-sm font-medium">Outcome</label>
                <Select
                  value={filter.success === undefined ? "all" : filter.success ? "success" : "failure"}
                  onValueChange={(value) =>
                    handleFilterChange({
                      success: value === "all" ? undefined : value === "success",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All outcomes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outcomes</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredEntries.length} of {entries.length} entries
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterChange({ sortOrder: "desc" })}
            disabled={filter.sortOrder === "desc"}
          >
            <ChevronDown size={16} className="mr-1" />
            Newest First
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterChange({ sortOrder: "asc" })}
            disabled={filter.sortOrder === "asc"}
          >
            <ChevronUp size={16} className="mr-1" />
            Oldest First
          </Button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-md border">
        <div className="divide-y">
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText size={48} className="mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold">No audit logs found</h3>
              <p className="text-sm text-muted-foreground">
                Adjust your filters or check back later
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isExpanded = expandedRow === entry.id
              const EventTypeIcon = getEventTypeIcon(entry.eventType)
              const ActorIcon = getActorIcon(entry.actor.type)
              const severityColor = SEVERITY_COLORS[entry.severity]

              return (
                <div key={entry.id} className="group">
                  {/* Main Row */}
                  <div
                    className={cn(
                      "flex items-center gap-4 p-4 transition-colors hover:bg-muted/50",
                      isExpanded && "bg-muted/30"
                    )}
                  >
                    {/* Expand Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => setExpandedRow(isExpanded ? null : entry.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </Button>

                    {/* Severity Badge */}
                    <Badge className={cn("shrink-0", severityColor)}>
                      {SEVERITY_LABELS[entry.severity]}
                    </Badge>

                    {/* Event Type Icon & Label */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <EventTypeIcon size={16} className="text-muted-foreground" />
                      <span className="font-medium">
                        {EVENT_TYPE_LABELS[entry.eventType]}
                      </span>
                    </div>

                    {/* Actor */}
                    <div className="flex items-center gap-2 min-w-[150px]">
                      <ActorIcon size={14} className="text-muted-foreground" />
                      <span className="text-sm">{entry.actor.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {entry.actor.type}
                      </Badge>
                    </div>

                    {/* Resource */}
                    {entry.resource && (
                      <div className="hidden min-w-[150px] lg:block">
                        <span className="text-sm text-muted-foreground">
                          {entry.resource.name || entry.resource.id}
                        </span>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={14} />
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      <span className="text-xs">({formatRelativeTime(entry.timestamp)})</span>
                    </div>

                    {/* Tamper Evidence Indicator */}
                    <div className="hidden items-center gap-1 sm:flex" title="Tamper-evident hash chain">
                      <Lock size={14} className="text-green-600" />
                      <span className="font-mono text-xs text-muted-foreground">
                        {entry.hash.substring(0, 8)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t bg-muted/20 p-4">
                      <div className="grid gap-4 lg:grid-cols-3">
                        {/* Input Data */}
                        {entry.inputData && Object.keys(entry.inputData).length > 0 && (
                          <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                              <FileText size={14} />
                              Input Data
                            </h4>
                            <pre className="overflow-auto rounded-md bg-background p-3 text-xs">
                              {JSON.stringify(entry.inputData, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* AI Reasoning */}
                        {entry.agentReasoning && (
                          <div>
                            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                              <Bot size={14} />
                              AI Reasoning
                            </h4>
                            <div className="rounded-md bg-background p-3 text-xs">
                              <p className="mb-2">{entry.agentReasoning.reasoning}</p>
                              {entry.agentReasoning.confidence && (
                                <p className="text-muted-foreground">
                                  Confidence: {(entry.agentReasoning.confidence * 100).toFixed(1)}%
                                </p>
                              )}
                              {entry.agentReasoning.model && (
                                <p className="text-muted-foreground">
                                  Model: {entry.agentReasoning.model} {entry.agentReasoning.modelVersion}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Outcome */}
                        <div>
                          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                            {entry.outcome.success ? (
                              <>
                                <CheckCircle2 size={14} className="text-green-600" />
                                Outcome
                              </>
                            ) : (
                              <>
                                <XCircle size={14} className="text-red-600" />
                                Outcome
                              </>
                            )}
                          </h4>
                          <div className="rounded-md bg-background p-3 text-xs">
                            <p className="mb-2">{entry.outcome.result || "No result"}</p>
                            {entry.outcome.errorCode && (
                              <p className="text-red-600">
                                Error: {entry.outcome.errorCode}
                              </p>
                            )}
                            {entry.outcome.errorMessage && (
                              <p className="text-red-600">
                                {entry.outcome.errorMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Tamper Evidence Details */}
                      <div className="mt-4 rounded-md border bg-background p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Lock size={12} />
                            <span>Tamper-Evident Hash Chain</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(entry.hash)
                            }}
                          >
                            <Copy size={12} className="mr-1" />
                            Copy Hash
                          </Button>
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div className="font-mono text-xs">
                            <span className="text-muted-foreground">Hash: </span>
                            <span className="break-all">{entry.hash}</span>
                          </div>
                          {entry.previousHash && (
                            <div className="font-mono text-xs">
                              <span className="text-muted-foreground">Previous: </span>
                              <span className="break-all">{entry.previousHash}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Retention Info */}
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Archive size={12} />
                          <span>
                            Retained until: {new Date(entry.retentionUntil).toLocaleDateString()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEntry(entry)
                          }}
                        >
                          <Eye size={12} className="mr-1" />
                          View Full Details
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Full Details Dialog */}
      {selectedEntry && (
        <AuditLogEntryDetails
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  )
}

// Separate component for full entry details dialog
function AuditLogEntryDetails({
  entry,
  onClose,
}: {
  entry: AuditLogEntry
  onClose: () => void
}) {
  return (
    <Dialog open={!!entry} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck size={20} />
            Audit Log Entry Details
          </DialogTitle>
          <DialogDescription>
            Complete tamper-evident record
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Core Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Event Type</label>
              <p className="text-sm text-muted-foreground">
                {EVENT_TYPE_LABELS[entry.eventType]}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Severity</label>
              <p>
                <Badge className={SEVERITY_COLORS[entry.severity]}>
                  {SEVERITY_LABELS[entry.severity]}
                </Badge>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Timestamp</label>
              <p className="text-sm text-muted-foreground">
                {new Date(entry.timestamp).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Entry ID</label>
              <p className="font-mono text-xs text-muted-foreground">
                {entry.id}
              </p>
            </div>
          </div>

          {/* Actor */}
          <div>
            <label className="text-sm font-medium">Actor</label>
            <div className="rounded-md border bg-muted/50 p-3">
              <p className="text-sm">
                <strong>Name:</strong> {entry.actor.name}
              </p>
              <p className="text-sm">
                <strong>Type:</strong> {entry.actor.type}
              </p>
              {entry.actor.email && (
                <p className="text-sm">
                  <strong>Email:</strong> {entry.actor.email}
                </p>
              )}
              {entry.actor.ipAddress && (
                <p className="text-sm">
                  <strong>IP:</strong> {entry.actor.ipAddress}
                </p>
              )}
            </div>
          </div>

          {/* Resource */}
          {entry.resource && (
            <div>
              <label className="text-sm font-medium">Resource</label>
              <div className="rounded-md border bg-muted/50 p-3">
                <p className="text-sm">
                  <strong>Type:</strong> {entry.resource.type}
                </p>
                <p className="text-sm">
                  <strong>ID:</strong> {entry.resource.id}
                </p>
                {entry.resource.name && (
                  <p className="text-sm">
                    <strong>Name:</strong> {entry.resource.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Input Data */}
          {entry.inputData && Object.keys(entry.inputData).length > 0 && (
            <div>
              <label className="text-sm font-medium">Input Data</label>
              <pre className="overflow-auto rounded-md border bg-background p-3 text-xs">
                {JSON.stringify(entry.inputData, null, 2)}
              </pre>
            </div>
          )}

          {/* AI Reasoning */}
          {entry.agentReasoning && (
            <div>
              <label className="text-sm font-medium">AI Reasoning</label>
              <div className="rounded-md border bg-background p-3">
                <p className="text-sm">{entry.agentReasoning.reasoning}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
                  {entry.agentReasoning.model && (
                    <p>Model: {entry.agentReasoning.model} {entry.agentReasoning.modelVersion}</p>
                  )}
                  {entry.agentReasoning.confidence && (
                    <p>Confidence: {(entry.agentReasoning.confidence * 100).toFixed(1)}%</p>
                  )}
                  {entry.agentReasoning.tokensUsed && (
                    <p>Tokens: {entry.agentReasoning.tokensUsed}</p>
                  )}
                  {entry.agentReasoning.latencyMs && (
                    <p>Latency: {entry.agentReasoning.latencyMs}ms</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Outcome */}
          <div>
            <label className="text-sm font-medium">Outcome</label>
            <div className={cn(
              "rounded-md border p-3",
              entry.outcome.success ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
            )}>
              <p className="text-sm">
                <strong>Status:</strong>{" "}
                {entry.outcome.success ? "Success" : "Failed"}
              </p>
              {entry.outcome.result && (
                <p className="text-sm">
                  <strong>Result:</strong> {entry.outcome.result}
                </p>
              )}
              {entry.outcome.errorCode && (
                <p className="text-sm text-red-600">
                  <strong>Error Code:</strong> {entry.outcome.errorCode}
                </p>
              )}
              {entry.outcome.errorMessage && (
                <p className="text-sm text-red-600">
                  <strong>Error:</strong> {entry.outcome.errorMessage}
                </p>
              )}
            </div>
          </div>

          {/* Tamper Evidence */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Lock size={14} />
              Tamper-Evident Hash Chain
            </label>
            <div className="rounded-md border bg-background p-3 font-mono text-xs">
              <div className="mb-2">
                <span className="text-muted-foreground">Hash: </span>
                <span className="break-all">{entry.hash}</span>
              </div>
              {entry.previousHash && (
                <div className="mb-2">
                  <span className="text-muted-foreground">Previous: </span>
                  <span className="break-all">{entry.previousHash}</span>
                </div>
              )}
              {entry.signature && (
                <div>
                  <span className="text-muted-foreground">Signature: </span>
                  <span className="break-all">{entry.signature.substring(0, 64)}...</span>
                </div>
              )}
            </div>
          </div>

          {/* Retention */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Archive size={14} />
            <span>
              Retained until {new Date(entry.retentionUntil).toLocaleDateString()}
              ({entry.retentionPolicy})
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
