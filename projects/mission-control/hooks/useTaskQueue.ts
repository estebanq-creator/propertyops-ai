"use client"

import * as React from "react"
import {
  Task,
  TaskFilter,
  TaskSort,
  TaskStatus,
  BulkOperation,
  ApprovalEvent,
  ApprovalWorkflowConfig,
  DEFAULT_WORKFLOW_CONFIG,
} from "@/types/task"

interface UseTaskQueueOptions {
  initialTasks?: Task[]
  workflowConfig?: ApprovalWorkflowConfig
  onTaskUpdate?: (task: Task) => void
  onBulkOperation?: (operation: BulkOperation, results: Task[]) => void
}

interface UseTaskQueueReturn {
  // Tasks
  tasks: Task[]
  filteredTasks: Task[]
  isLoading: boolean
  error: Error | null
  
  // Filtering & Sorting
  filter: TaskFilter
  setFilter: React.Dispatch<React.SetStateAction<TaskFilter>>
  sort: TaskSort
  setSort: React.Dispatch<React.SetStateAction<TaskSort>>
  
  // Selection
  selectedTaskIds: Set<string>
  toggleTaskSelection: (taskId: string) => void
  selectAllTasks: () => void
  clearSelection: () => void
  isTaskSelected: (taskId: string) => boolean
  isAllSelected: boolean
  
  // Operations
  approveTask: (taskId: string, comment?: string, signature?: string) => Promise<void>
  rejectTask: (taskId: string, comment: string) => Promise<void>
  bulkApprove: (comment?: string) => Promise<void>
  bulkReject: (comment: string) => Promise<void>
  updateTaskStatus: (taskId: string, status: TaskStatus) => void
  
  // Stats
  stats: TaskQueueStats
}

export interface TaskQueueStats {
  total: number
  pending: number
  awaitingApproval: number
  draftingAgent: number
  forcedConfirm: number
  canBulkApprove: number
  overdue: number
}

/**
 * useTaskQueue - State management for task queue and approval workflow
 * 
 * Features:
 * - Filtering and sorting
 * - Multi-select for bulk operations
 * - Approval/rejection workflows
 * - Drafting agent auto-approval tracking
 * - Forced confirm timer enforcement
 */
export function useTaskQueue(options: UseTaskQueueOptions = {}): UseTaskQueueReturn {
  const {
    initialTasks = [],
    workflowConfig = DEFAULT_WORKFLOW_CONFIG,
    onTaskUpdate,
    onBulkOperation,
  } = options

  const [tasks, setTasks] = React.useState<Task[]>(initialTasks)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  // Filtering
  const [filter, setFilter] = React.useState<TaskFilter>({})
  
  // Sorting
  const [sort, setSort] = React.useState<TaskSort>({
    field: "createdAt",
    direction: "desc",
  })

  // Selection
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<string>>(new Set())

  // Forced confirm tracking (taskId -> viewStartTime)
  const [viewStartTimes, setViewStartTimes] = React.useState<Map<string, number>>(new Map())

  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    let result = [...tasks]

    // Apply filters
    if (filter.status?.length) {
      result = result.filter((t) => filter.status!.includes(t.status))
    }
    if (filter.priority?.length) {
      result = result.filter((t) => filter.priority!.includes(t.priority))
    }
    if (filter.type?.length) {
      result = result.filter((t) => filter.type!.includes(t.type))
    }
    if (filter.assigneeId) {
      result = result.filter((t) => t.assignee?.id === filter.assigneeId)
    }
    if (filter.approvalLevel?.length) {
      result = result.filter((t) => filter.approvalLevel!.includes(t.approvalLevel))
    }
    if (filter.dateFrom) {
      const fromDate = new Date(filter.dateFrom)
      result = result.filter((t) => new Date(t.createdAt) >= fromDate)
    }
    if (filter.dateTo) {
      const toDate = new Date(filter.dateTo)
      result = result.filter((t) => new Date(t.createdAt) <= toDate)
    }
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.metadata.propertyName?.toLowerCase().includes(searchLower) ||
          t.metadata.tenantName?.toLowerCase().includes(searchLower)
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1
      
      switch (sort.field) {
        case "priority": {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return (priorityOrder[a.priority] - priorityOrder[b.priority]) * direction
        }
        case "status": {
          const statusOrder: Record<TaskStatus, number> = {
            pending: 1,
            draft: 2,
            awaiting_approval: 3,
            approved: 4,
            rejected: 5,
            in_progress: 6,
            completed: 7,
            cancelled: 8,
            failed: 9,
          }
          return (statusOrder[a.status] - statusOrder[b.status]) * direction
        }
        case "createdAt":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction
        case "dueDate": {
          const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
          const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
          return (aDue - bDue) * direction
        }
        case "title":
          return a.title.localeCompare(b.title) * direction
        default:
          return 0
      }
    })

    return result
  }, [tasks, filter, sort])

  // Calculate stats
  const stats = React.useMemo<TaskQueueStats>(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      awaitingApproval: tasks.filter((t) => t.status === "awaiting_approval").length,
      draftingAgent: tasks.filter((t) => t.approvalLevel === "drafting").length,
      forcedConfirm: tasks.filter((t) => t.approvalLevel === "forced_confirm").length,
      canBulkApprove: tasks.filter((t) => t.canBulkApprove && t.status === "pending").length,
      overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed").length,
    }
  }, [tasks])

  // Selection handlers
  const toggleTaskSelection = React.useCallback((taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }, [])

  const selectAllTasks = React.useCallback(() => {
    const selectableIds = filteredTasks
      .filter((t) => t.canBulkApprove && t.status === "pending")
      .map((t) => t.id)
    setSelectedTaskIds(new Set(selectableIds))
  }, [filteredTasks])

  const clearSelection = React.useCallback(() => {
    setSelectedTaskIds(new Set())
  }, [])

  const isTaskSelected = React.useCallback(
    (taskId: string) => selectedTaskIds.has(taskId),
    [selectedTaskIds]
  )

  const isAllSelected = React.useMemo(() => {
    const selectableCount = filteredTasks.filter(
      (t) => t.canBulkApprove && t.status === "pending"
    ).length
    return selectableCount > 0 && selectedTaskIds.size === selectableCount
  }, [filteredTasks, selectedTaskIds])

  // Track when user starts viewing a forced-confirm task
  const trackViewStart = React.useCallback((taskId: string) => {
    setViewStartTimes((prev) => new Map(prev).set(taskId, Date.now()))
  }, [])

  // Check if forced confirm minimum view time has elapsed
  const canApproveForcedConfirm = React.useCallback(
    (taskId: string): boolean => {
      const viewStart = viewStartTimes.get(taskId)
      if (!viewStart) return false
      
      const elapsed = (Date.now() - viewStart) / 1000
      return elapsed >= workflowConfig.forcedConfirmMinViewSeconds
    },
    [viewStartTimes, workflowConfig.forcedConfirmMinViewSeconds]
  )

  // Approve task
  const approveTask = React.useCallback(
    async (taskId: string, comment?: string, signature?: string) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) throw new Error(`Task ${taskId} not found`)

      // Validate forced confirm
      if (task.approvalLevel === "forced_confirm") {
        if (!canApproveForcedConfirm(taskId)) {
          throw new Error(
            `Please review for at least ${workflowConfig.forcedConfirmMinViewSeconds} seconds before approving`
          )
        }
      }

      // Validate signature requirement
      if (task.requiresSignature && !signature) {
        throw new Error("Signature required for this approval")
      }

      const approvalEvent: ApprovalEvent = {
        id: `approval-${Date.now()}`,
        taskId,
        action: "approved",
        userId: "current-user", // Replace with actual user ID
        userName: "Current User",
        timestamp: new Date().toISOString(),
        comment,
        signature,
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "approved",
                updatedAt: new Date().toISOString(),
                approvalHistory: [...t.approvalHistory, approvalEvent],
              }
            : t
        )
      )

      onTaskUpdate?.(task)
    },
    [tasks, canApproveForcedConfirm, workflowConfig.forcedConfirmMinViewSeconds, onTaskUpdate]
  )

  // Reject task
  const rejectTask = React.useCallback(
    async (taskId: string, comment: string) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) throw new Error(`Task ${taskId} not found`)

      if (workflowConfig.requireRejectionComment && !comment.trim()) {
        throw new Error("Comment required for rejection")
      }

      const approvalEvent: ApprovalEvent = {
        id: `rejection-${Date.now()}`,
        taskId,
        action: "rejected",
        userId: "current-user",
        userName: "Current User",
        timestamp: new Date().toISOString(),
        comment,
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: "rejected",
                updatedAt: new Date().toISOString(),
                approvalHistory: [...t.approvalHistory, approvalEvent],
              }
            : t
        )
      )

      onTaskUpdate?.(task)
    },
    [tasks, workflowConfig.requireRejectionComment, onTaskUpdate]
  )

  // Bulk approve
  const bulkApprove = React.useCallback(
    async (comment?: string) => {
      const tasksToApprove = tasks.filter(
        (t) => selectedTaskIds.has(t.id) && t.canBulkApprove && t.status === "pending"
      )

      if (tasksToApprove.length > workflowConfig.bulkApprovalMaxCount) {
        throw new Error(
          `Cannot approve more than ${workflowConfig.bulkApprovalMaxCount} tasks at once`
        )
      }

      if (tasksToApprove.length === 0) {
        throw new Error("No tasks selected for approval")
      }

      // Validate no forced-confirm tasks
      const forcedConfirmTasks = tasksToApprove.filter(
        (t) => t.approvalLevel === "forced_confirm"
      )
      if (forcedConfirmTasks.length > 0) {
        throw new Error(
          `Cannot bulk approve safety-critical tasks: ${forcedConfirmTasks.map((t) => t.title).join(", ")}`
        )
      }

      const approvalEvent: ApprovalEvent = {
        id: `bulk-approval-${Date.now()}`,
        taskId: "bulk",
        action: "approved",
        userId: "current-user",
        userName: "Current User",
        timestamp: new Date().toISOString(),
        comment,
      }

      setTasks((prev) =>
        prev.map((t) =>
          selectedTaskIds.has(t.id) && t.canBulkApprove
            ? {
                ...t,
                status: "approved",
                updatedAt: new Date().toISOString(),
                approvalHistory: [...t.approvalHistory, approvalEvent],
              }
            : t
        )
      )

      onBulkOperation?.(
        {
          taskIds: Array.from(selectedTaskIds),
          operation: "approve",
          comment,
        },
        tasksToApprove
      )

      clearSelection()
    },
    [tasks, selectedTaskIds, workflowConfig.bulkApprovalMaxCount, onBulkOperation, clearSelection]
  )

  // Bulk reject
  const bulkReject = React.useCallback(
    async (comment: string) => {
      const tasksToReject = tasks.filter(
        (t) => selectedTaskIds.has(t.id) && t.status === "pending"
      )

      if (tasksToReject.length === 0) {
        throw new Error("No tasks selected for rejection")
      }

      if (workflowConfig.requireRejectionComment && !comment.trim()) {
        throw new Error("Comment required for rejection")
      }

      const rejectionEvent: ApprovalEvent = {
        id: `bulk-rejection-${Date.now()}`,
        taskId: "bulk",
        action: "rejected",
        userId: "current-user",
        userName: "Current User",
        timestamp: new Date().toISOString(),
        comment,
      }

      setTasks((prev) =>
        prev.map((t) =>
          selectedTaskIds.has(t.id)
            ? {
                ...t,
                status: "rejected",
                updatedAt: new Date().toISOString(),
                approvalHistory: [...t.approvalHistory, rejectionEvent],
              }
            : t
        )
      )

      onBulkOperation?.(
        {
          taskIds: Array.from(selectedTaskIds),
          operation: "reject",
          comment,
        },
        tasksToReject
      )

      clearSelection()
    },
    [tasks, selectedTaskIds, workflowConfig.requireRejectionComment, onBulkOperation, clearSelection]
  )

  // Update task status
  const updateTaskStatus = React.useCallback(
    (taskId: string, status: TaskStatus) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status, updatedAt: new Date().toISOString() }
            : t
        )
      )
    },
    []
  )

  return {
    tasks,
    filteredTasks,
    isLoading,
    error,
    filter,
    setFilter,
    sort,
    setSort,
    selectedTaskIds,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    isTaskSelected,
    isAllSelected,
    approveTask,
    rejectTask,
    bulkApprove,
    bulkReject,
    updateTaskStatus,
    stats,
    trackViewStart,
    canApproveForcedConfirm,
  }
}
