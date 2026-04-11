"use client"

import * as React from "react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskFilter, TaskStatus, TaskPriority, TaskType, ApprovalLevel } from "@/types/task"
import { cn } from "@/lib/utils"
import {
  Search,
  Filter,
  X,
  Calendar,
  Flag,
  User,
  FileText,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react"

interface TaskFiltersProps {
  filter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
  onClearFilters: () => void
}

/**
 * TaskFilters - Advanced filtering for task queue
 * 
 * Features:
 * - Search by title, description, property, tenant
 * - Filter by status, priority, type, approval level
 * - Date range filtering
 * - Active filter chips with quick remove
 * - Collapsible filter panel
 */
export function TaskFilters({
  filter,
  onFilterChange,
  onClearFilters,
}: TaskFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [searchInput, setSearchInput] = React.useState(filter.search || "")

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filter.search) {
        onFilterChange({ ...filter, search: searchInput || undefined })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, filter, onFilterChange])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filter.status?.length) count += filter.status.length
    if (filter.priority?.length) count += filter.priority.length
    if (filter.type?.length) count += filter.type.length
    if (filter.approvalLevel?.length) count += filter.approvalLevel.length
    if (filter.assigneeId) count += 1
    if (filter.dateFrom || filter.dateTo) count += 1
    if (filter.search) count += 1
    return count
  }, [filter])

  const toggleFilter = <T extends string>(
    key: keyof TaskFilter,
    value: T,
    currentArray: T[] | undefined
  ) => {
    const newArray = currentArray?.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...(currentArray || []), value]
    
    onFilterChange({
      ...filter,
      [key]: newArray.length > 0 ? newArray : undefined,
    })
  }

  const clearFilter = (key: keyof TaskFilter) => {
    onFilterChange({ ...filter, [key]: undefined })
  }

  const statusOptions: { value: TaskStatus; label: string; icon: React.ReactNode }[] = [
    { value: "pending", label: "Pending", icon: <Clock size={12} /> },
    { value: "awaiting_approval", label: "Awaiting Approval", icon: <AlertTriangle size={12} /> },
    { value: "approved", label: "Approved", icon: <CheckCircle2 size={12} /> },
    { value: "rejected", label: "Rejected", icon: <X size={12} /> },
    { value: "in_progress", label: "In Progress", icon: <Clock size={12} /> },
    { value: "completed", label: "Completed", icon: <CheckCircle2 size={12} /> },
  ]

  const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ]

  const approvalLevelOptions: { value: ApprovalLevel; label: string; icon: React.ReactNode }[] = [
    { value: "drafting", label: "Drafting Agent", icon: <Zap size={12} /> },
    { value: "standard", label: "Standard", icon: <FileText size={12} /> },
    { value: "forced_confirm", label: "Safety Review", icon: <Shield size={12} /> },
  ]

  const taskTypeGroups = {
    "Drafting Agent": ["data_sync", "report_generation", "notification_draft", "analytics_update"] as TaskType[],
    "Standard Approval": ["expense_approval", "vendor_payment", "lease_renewal", "maintenance_request"] as TaskType[],
    "Safety Critical": ["tenant_verification", "emergency_dispatch", "legal_document", "security_alert", "compliance_filing"] as TaskType[],
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search tasks, properties, tenants..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Search tasks"
          />
        </div>
        <Button
          variant={activeFilterCount > 0 ? "default" : "outline"}
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
          aria-expanded={isExpanded}
          aria-controls="advanced-filters"
        >
          <Filter size={16} />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={onClearFilters} size="sm">
            <X size={16} className="mr-2" />
            Clear all
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div
          id="advanced-filters"
          className="space-y-4 rounded-lg border bg-card p-4"
        >
          {/* Status Filter */}
          <div>
            <h4 className="mb-2 text-sm font-medium">Status</h4>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const isActive = filter.status?.includes(option.value)
                return (
                  <Badge
                    key={option.value}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isActive ? "bg-primary hover:bg-primary/90" : "hover:bg-accent"
                    )}
                    onClick={() => toggleFilter("status", option.value, filter.status)}
                    role="checkbox"
                    aria-checked={isActive}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        toggleFilter("status", option.value, filter.status)
                      }
                    }}
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                    {isActive && <X size={12} className="ml-1" />}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <h4 className="mb-2 text-sm font-medium flex items-center gap-2">
              <Flag size={14} />
              Priority
            </h4>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((option) => {
                const isActive = filter.priority?.includes(option.value)
                return (
                  <Badge
                    key={option.value}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isActive
                        ? option.value === "critical"
                          ? "bg-red-600 hover:bg-red-700"
                          : option.value === "high"
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "bg-primary hover:bg-primary/90"
                        : "hover:bg-accent"
                    )}
                    onClick={() => toggleFilter("priority", option.value, filter.priority)}
                    role="checkbox"
                    aria-checked={isActive}
                    tabIndex={0}
                  >
                    {option.label}
                    {isActive && <X size={12} className="ml-1" />}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Approval Level Filter */}
          <div>
            <h4 className="mb-2 text-sm font-medium">Approval Level</h4>
            <div className="flex flex-wrap gap-2">
              {approvalLevelOptions.map((option) => {
                const isActive = filter.approvalLevel?.includes(option.value)
                return (
                  <Badge
                    key={option.value}
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isActive
                        ? option.value === "forced_confirm"
                          ? "bg-red-600 hover:bg-red-700"
                          : option.value === "drafting"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-primary hover:bg-primary/90"
                        : "hover:bg-accent"
                    )}
                    onClick={() => toggleFilter("approvalLevel", option.value, filter.approvalLevel)}
                    role="checkbox"
                    aria-checked={isActive}
                    tabIndex={0}
                  >
                    <span className="mr-1">{option.icon}</span>
                    {option.label}
                    {isActive && <X size={12} className="ml-1" />}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Task Type Filter */}
          <div>
            <h4 className="mb-2 text-sm font-medium flex items-center gap-2">
              <FileText size={14} />
              Task Type
            </h4>
            <div className="space-y-3">
              {Object.entries(taskTypeGroups).map(([groupName, types]) => (
                <div key={groupName}>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    {groupName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {types.map((type) => {
                      const isActive = filter.type?.includes(type)
                      return (
                        <Badge
                          key={type}
                          variant={isActive ? "default" : "outline"}
                          className="cursor-pointer transition-colors hover:bg-accent"
                          onClick={() => toggleFilter("type", type, filter.type)}
                          role="checkbox"
                          aria-checked={isActive}
                          tabIndex={0}
                        >
                          {type.replace(/_/g, " ")}
                          {isActive && <X size={12} className="ml-1" />}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <h4 className="mb-2 text-sm font-medium flex items-center gap-2">
              <Calendar size={14} />
              Date Range
            </h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="date-from" className="text-sm text-muted-foreground">
                  From:
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={filter.dateFrom || ""}
                  onChange={(e) =>
                    onFilterChange({ ...filter, dateFrom: e.target.value || undefined })
                  }
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="date-to" className="text-sm text-muted-foreground">
                  To:
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={filter.dateTo || ""}
                  onChange={(e) =>
                    onFilterChange({ ...filter, dateTo: e.target.value || undefined })
                  }
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filter.status?.map((status) => (
            <Badge
              key={`status-${status}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              Status: {status.replace("_", " ")}
              <button
                onClick={() => clearFilter("status")}
                className="ml-1 hover:text-foreground"
                aria-label={`Remove status filter: ${status}`}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          {filter.priority?.map((priority) => (
            <Badge
              key={`priority-${priority}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              Priority: {priority}
              <button
                onClick={() => clearFilter("priority")}
                className="ml-1 hover:text-foreground"
                aria-label={`Remove priority filter: ${priority}`}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          {filter.approvalLevel?.map((level) => (
            <Badge
              key={`level-${level}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              Level: {level.replace("_", " ")}
              <button
                onClick={() => clearFilter("approvalLevel")}
                className="ml-1 hover:text-foreground"
                aria-label={`Remove approval level filter: ${level}`}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          {filter.search && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Search: &quot;{filter.search}&quot;
              <button
                onClick={() => {
                  setSearchInput("")
                  clearFilter("search")
                }}
                className="ml-1 hover:text-foreground"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
