"use client"

import * as React from "react"
import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Task, TaskPriority, TaskStatus, TaskType, ApprovalLevel } from "@/types/task"
import { useTaskQueue } from "@/hooks/useTaskQueue"
import { cn, formatRelativeTime } from "@/lib/utils"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Shield,
  Zap,
  User,
  Tag,
  Calendar,
} from "lucide-react"

interface TaskDataTableProps {
  tasks: Task[]
  onViewTask: (task: Task) => void
  onApprove: (task: Task) => void
  onReject: (task: Task) => void
  className?: string
}

/**
 * TaskDataTable - Sortable, filterable task table with bulk selection
 * 
 * Features:
 * - Sortable columns (priority, status, created, due)
 * - Row selection for bulk operations
 * - Color-coded status and priority indicators
 * - Approval level badges (drafting, standard, forced_confirm)
 * - Responsive design with horizontal scroll
 */
export function TaskDataTable({
  tasks,
  onViewTask,
  onApprove,
  onReject,
  className,
}: TaskDataTableProps) {
  const {
    filteredTasks,
    sort,
    setSort,
    selectedTaskIds,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    isTaskSelected,
    isAllSelected,
  } = useTaskQueue({ initialTasks: tasks })

  // Handle column sort
  const handleSort = (field: TaskSort["field"]) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }))
  }

  // Sort icon helper
  const getSortIcon = (field: TaskSort["field"]) => {
    if (sort.field !== field) return <ArrowUpDown size={16} className="ml-2 opacity-50" />
    return sort.direction === "asc"
      ? <ArrowUp size={16} className="ml-2" />
      : <ArrowDown size={16} className="ml-2" />
  }

  // Priority badge variant
  const getPriorityVariant = (priority: TaskPriority) => {
    switch (priority) {
      case "critical": return "destructive"
      case "high": return "warning"
      case "medium": return "default"
      case "low": return "secondary"
    }
  }

  // Status badge variant
  const getStatusVariant = (status: TaskStatus) => {
    switch (status) {
      case "completed":
      case "approved":
        return "success"
      case "pending":
      case "draft":
      case "in_progress":
        return "info"
      case "rejected":
      case "failed":
      case "cancelled":
        return "destructive"
      case "awaiting_approval":
        return "warning"
      default:
        return "secondary"
    }
  }

  // Approval level badge
  const getApprovalLevelBadge = (level: ApprovalLevel) => {
    switch (level) {
      case "drafting":
        return (
          <Badge variant="secondary" className="gap-1">
            <Zap size={12} />
            Drafting
          </Badge>
        )
      case "forced_confirm":
        return (
          <Badge variant="destructive" className="gap-1">
            <Shield size={12} />
            Safety Review
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <FileText size={12} />
            Standard
          </Badge>
        )
    }
  }

  if (filteredTasks.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        <FileText size={48} className="mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold">No tasks found</h3>
        <p className="text-sm text-muted-foreground">
          Adjust your filters or check back later
        </p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={isAllSelected ? clearSelection : selectAllTasks}
                aria-label="Select all tasks"
              />
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("title")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Task
                {getSortIcon("title")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("priority")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Priority
                {getSortIcon("priority")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("status")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Status
                {getSortIcon("status")}
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">Approval Level</TableHead>
            <TableHead className="hidden lg:table-cell">
              <Button
                variant="ghost"
                onClick={() => handleSort("createdAt")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Created
                {getSortIcon("createdAt")}
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              <Button
                variant="ghost"
                onClick={() => handleSort("dueDate")}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Due
                {getSortIcon("dueDate")}
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell">Assignee</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map((task) => {
            const isSelected = isTaskSelected(task.id)
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"

            return (
              <TableRow
                key={task.id}
                data-state={isSelected ? "selected" : undefined}
                className={cn(
                  "cursor-pointer transition-colors",
                  isSelected && "bg-muted/50",
                  isOverdue && "border-l-4 border-l-red-500"
                )}
                onClick={() => onViewTask(task)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleTaskSelection(task.id)}
                    disabled={!task.canBulkApprove && task.status === "pending"}
                    aria-label={`Select ${task.title}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {task.description}
                    </div>
                    {task.metadata.propertyName && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag size={12} />
                        {task.metadata.propertyName}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(task.priority)}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(task.status)}>
                    {task.status === "pending" && <Clock size={12} className="mr-1" />}
                    {task.status === "approved" && <CheckCircle2 size={12} className="mr-1" />}
                    {task.status === "rejected" && <XCircle size={12} className="mr-1" />}
                    {task.status === "awaiting_approval" && <AlertTriangle size={12} className="mr-1" />}
                    {task.status.replace("_", " ").charAt(0).toUpperCase() + task.status.replace("_", " ").slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {getApprovalLevelBadge(task.approvalLevel)}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="text-sm">
                    <div>{new Date(task.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatRelativeTime(task.createdAt)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {task.dueDate ? (
                    <div className={cn(
                      "text-sm",
                      isOverdue && "font-semibold text-red-600 dark:text-red-400"
                    )}>
                      <div>{new Date(task.dueDate).toLocaleDateString()}</div>
                      {isOverdue && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          Overdue
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No due date</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      {task.assignee.avatar ? (
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                          <User size={14} />
                        </div>
                      )}
                      <span className="text-sm">{task.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    {task.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onApprove(task)}
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          aria-label="Approve task"
                        >
                          <CheckCircle2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReject(task)}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label="Reject task"
                        >
                          <XCircle size={16} />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewTask(task)}
                      className="h-8 w-8"
                      aria-label="View task details"
                    >
                      <FileText size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
