"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { TaskDataTable } from "@/components/tasks/TaskDataTable"
import { TaskFilters } from "@/components/tasks/TaskFilters"
import { BulkOperationsBar } from "@/components/tasks/BulkOperationsBar"
import { DraftingAgentApprovalModal } from "@/components/approval/DraftingAgentApprovalModal"
import { ForcedConfirmModal } from "@/components/approval/ForcedConfirmModal"
import { Task, TaskFilter, DEFAULT_WORKFLOW_CONFIG } from "@/types/task"
import { useTaskQueue } from "@/hooks/useTaskQueue"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  Inbox,
} from "lucide-react"

// Demo tasks - replace with API call
const demoTasks: Task[] = [
  // Drafting Agent tasks (low-stakes, one-click approval)
  {
    id: "task-001",
    title: "Sync Property Data from MLS",
    description: "Update property listings with latest MLS data for 12 properties",
    type: "data_sync",
    status: "pending",
    priority: "low",
    approvalLevel: "drafting",
    createdBy: "system",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    actions: [
      {
        id: "action-001",
        type: "data_sync",
        description: "Sync 12 property listings from MLS API",
        payload: { propertyIds: ["p1", "p2"], source: "mls" },
        riskLevel: "low",
        estimatedImpact: "Updates public-facing property data",
      },
    ],
    metadata: {
      propertyId: "prop-123",
      propertyName: "Sunset Apartments",
    },
    approvalHistory: [],
    canBulkApprove: true,
    canBulkReject: true,
  },
  {
    id: "task-002",
    title: "Generate Monthly Analytics Report",
    description: "Compile occupancy rates, revenue, and expense metrics for October 2025",
    type: "report_generation",
    status: "pending",
    priority: "medium",
    approvalLevel: "drafting",
    createdBy: "system",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
    actions: [
      {
        id: "action-002",
        type: "report_generation",
        description: "Generate PDF report with analytics dashboard data",
        payload: { period: "2025-10", format: "pdf" },
        riskLevel: "low",
      },
    ],
    metadata: {
      tags: ["analytics", "monthly"],
    },
    approvalHistory: [],
    canBulkApprove: true,
    canBulkReject: true,
  },
  // Standard approval tasks
  {
    id: "task-003",
    title: "Approve Vendor Payment - ABC Plumbing",
    description: "Payment for emergency repair at Oak Street property",
    type: "vendor_payment",
    status: "pending",
    priority: "high",
    approvalLevel: "standard",
    createdBy: "agent-001",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    actions: [
      {
        id: "action-003",
        type: "vendor_payment",
        description: "Process payment of $450 to ABC Plumbing via ACH",
        payload: { vendorId: "v-123", amount: 450, method: "ach" },
        riskLevel: "medium",
        estimatedImpact: "$450 debit from operating account",
      },
    ],
    metadata: {
      propertyId: "prop-456",
      propertyName: "Oak Street Duplex",
      amount: 450,
      currency: "USD",
      dueDate: new Date(Date.now() + 172800000).toISOString(),
    },
    approvalHistory: [],
    canBulkApprove: true,
    canBulkReject: true,
  },
  {
    id: "task-004",
    title: "Lease Renewal - Unit 204",
    description: "Approve lease renewal terms for tenant John Smith",
    type: "lease_renewal",
    status: "pending",
    priority: "medium",
    approvalLevel: "standard",
    createdBy: "agent-002",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 604800000).toISOString(),
    actions: [
      {
        id: "action-004",
        type: "lease_renewal",
        description: "Execute lease renewal with 3% rent increase",
        payload: { tenantId: "t-789", increasePercent: 3, termMonths: 12 },
        riskLevel: "medium",
        estimatedImpact: "Rent increases from $1,200 to $1,236/month",
      },
    ],
    metadata: {
      propertyId: "prop-789",
      propertyName: "Highland Towers",
      tenantId: "t-789",
      tenantName: "John Smith",
      amount: 1236,
      currency: "USD",
    },
    approvalHistory: [],
    canBulkApprove: true,
    canBulkReject: true,
  },
  // Safety-critical tasks (forced confirm)
  {
    id: "task-005",
    title: "Tenant Verification - New Application",
    description: "Verify employment and income for rental application",
    type: "tenant_verification",
    status: "pending",
    priority: "high",
    approvalLevel: "forced_confirm",
    createdBy: "agent-003",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 259200000).toISOString(),
    requiresSignature: true,
    actions: [
      {
        id: "action-005",
        type: "tenant_verification",
        description: "Submit verification request to employer and bank",
        payload: { applicantId: "a-456", verifyEmployment: true, verifyIncome: true },
        riskLevel: "high",
        estimatedImpact: "Sensitive financial data will be accessed",
      },
    ],
    metadata: {
      propertyId: "prop-321",
      propertyName: "Riverside Condos",
      tenantId: "a-456",
      tenantName: "Sarah Johnson",
      tags: ["application", "verification"],
    },
    approvalHistory: [],
    canBulkApprove: false,
    canBulkReject: false,
  },
  {
    id: "task-006",
    title: "Emergency Dispatch - Water Leak",
    description: "Dispatch emergency plumber for unit 3B water leak",
    type: "emergency_dispatch",
    status: "pending",
    priority: "critical",
    approvalLevel: "forced_confirm",
    createdBy: "system",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date().toISOString(),
    requiresSignature: true,
    requiresTwoFactor: true,
    actions: [
      {
        id: "action-006",
        type: "emergency_dispatch",
        description: "Contact 24/7 emergency plumber and authorize up to $500",
        payload: { urgency: "emergency", maxCost: 500, propertyAccess: true },
        riskLevel: "critical",
        estimatedImpact: "Emergency service charge + potential damage repair costs",
      },
    ],
    metadata: {
      propertyId: "prop-654",
      propertyName: "Maple Grove",
      tenantId: "t-321",
      tenantName: "Mike Chen",
      amount: 500,
      currency: "USD",
      tags: ["emergency", "plumbing"],
    },
    approvalHistory: [],
    canBulkApprove: false,
    canBulkReject: false,
  },
  // More tasks for testing
  {
    id: "task-007",
    title: "Draft Notification - Rent Increase",
    description: "Prepare 60-day notice for annual rent adjustment",
    type: "notification_draft",
    status: "pending",
    priority: "low",
    approvalLevel: "drafting",
    createdBy: "agent-001",
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    updatedAt: new Date().toISOString(),
    actions: [
      {
        id: "action-007",
        type: "notification_draft",
        description: "Generate rent increase notices for 8 affected units",
        payload: { templateId: "rent-increase", unitCount: 8 },
        riskLevel: "low",
      },
    ],
    metadata: {
      tags: ["notification", "rent"],
    },
    approvalHistory: [],
    canBulkApprove: true,
    canBulkReject: true,
  },
  {
    id: "task-008",
    title: "Compliance Filing - Annual Safety Inspection",
    description: "Submit annual fire safety inspection report to city",
    type: "compliance_filing",
    status: "pending",
    priority: "high",
    approvalLevel: "forced_confirm",
    createdBy: "agent-002",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: new Date(Date.now() + 345600000).toISOString(),
    requiresSignature: true,
    actions: [
      {
        id: "action-008",
        type: "compliance_filing",
        description: "File annual safety inspection with City Building Department",
        payload: { filingType: "safety-inspection", year: 2025 },
        riskLevel: "high",
        estimatedImpact: "Legal compliance requirement - late fees possible",
      },
    ],
    metadata: {
      propertyId: "prop-999",
      propertyName: "All Properties",
      tags: ["compliance", "legal"],
    },
    approvalHistory: [],
    canBulkApprove: false,
    canBulkReject: false,
  },
]

export default function TaskQueuePage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalType, setModalType] = useState<"drafting" | "forced" | null>(null)

  const {
    filteredTasks,
    filter,
    setFilter,
    selectedTaskIds,
    isTaskSelected,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    isAllSelected,
    approveTask,
    rejectTask,
    bulkApprove,
    bulkReject,
    stats,
  } = useTaskQueue({
    initialTasks: demoTasks,
    workflowConfig: {
      ...DEFAULT_WORKFLOW_CONFIG,
      forcedConfirmMinViewSeconds: 5,
      bulkApprovalMaxCount: 50,
    },
  })

  const handleViewTask = useCallback((task: Task) => {
    setSelectedTask(task)
    // Determine which modal to show based on approval level
    if (task.approvalLevel === "drafting") {
      setModalType("drafting")
    } else if (task.approvalLevel === "forced_confirm") {
      setModalType("forced")
    }
  }, [])

  const handleApproveFromTable = useCallback((task: Task) => {
    setSelectedTask(task)
    if (task.approvalLevel === "drafting") {
      setModalType("drafting")
    } else if (task.approvalLevel === "forced_confirm") {
      setModalType("forced")
    }
  }, [])

  const handleRejectFromTable = useCallback((task: Task) => {
    setSelectedTask(task)
    if (task.approvalLevel === "drafting") {
      setModalType("drafting")
    } else if (task.approvalLevel === "forced_confirm") {
      setModalType("forced")
    }
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedTask(null)
    setModalType(null)
  }, [])

  const handleFilterChange = useCallback((newFilter: TaskFilter) => {
    setFilter(newFilter)
  }, [setFilter])

  const handleClearFilters = useCallback(() => {
    setFilter({})
  }, [setFilter])

  // Count tasks that can be bulk approved in current selection
  const canBulkApproveCount = React.useMemo(() => {
    return filteredTasks.filter(
      (t) => selectedTaskIds.has(t.id) && t.canBulkApprove && t.status === "pending"
    ).length
  }, [filteredTasks, selectedTaskIds])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Task Queue</h1>
              <p className="text-muted-foreground">
                Review and approve agent actions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Inbox size={14} />
                {stats.pending} pending
              </Badge>
              <Badge variant="outline" className="gap-1">
                <AlertTriangle size={14} />
                {stats.awaitingApproval} awaiting
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Tasks"
            value={stats.pending.toString()}
            icon={Clock}
            description="Awaiting your review"
          />
          <StatCard
            title="Drafting Agent"
            value={stats.draftingAgent.toString()}
            icon={Zap}
            description="Low-stakes, quick approval"
            trend="+12% from last week"
          />
          <StatCard
            title="Safety Reviews"
            value={stats.forcedConfirm.toString()}
            icon={Shield}
            description="Requires explicit confirmation"
            variant="danger"
          />
          <StatCard
            title="Can Bulk Approve"
            value={stats.canBulkApprove.toString()}
            icon={CheckCircle2}
            description="Eligible for batch processing"
            variant="success"
          />
        </div>

        {/* Filters */}
        <TaskFilters
          filter={filter}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Task Table */}
        <TaskDataTable
          tasks={demoTasks}
          onViewTask={handleViewTask}
          onApprove={handleApproveFromTable}
          onReject={handleRejectFromTable}
        />

        {/* Bulk Operations Bar */}
        <BulkOperationsBar
          selectedCount={selectedTaskIds.size}
          canBulkApproveCount={canBulkApproveCount}
          onBulkApprove={bulkApprove}
          onBulkReject={bulkReject}
          onClearSelection={clearSelection}
          maxBulkCount={50}
        />

        {/* Drafting Agent Modal */}
        <DraftingAgentApprovalModal
          task={modalType === "drafting" ? selectedTask : null}
          isOpen={modalType === "drafting"}
          onClose={handleCloseModal}
          onApprove={approveTask}
          onReject={rejectTask}
        />

        {/* Forced Confirm Modal */}
        <ForcedConfirmModal
          task={modalType === "forced" ? selectedTask : null}
          isOpen={modalType === "forced"}
          onClose={handleCloseModal}
          onApprove={approveTask}
          onReject={rejectTask}
          minViewSeconds={5}
          requireSignature={selectedTask?.requiresSignature || false}
          requireTwoFactor={selectedTask?.requiresTwoFactor || false}
          onVerifyTwoFactor={async () => {
            // Implement actual 2FA verification
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return true
          }}
        />
      </div>
    </DashboardLayout>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ElementType
  description: string
  trend?: string
  variant?: "default" | "success" | "danger"
}

function StatCard({ title, value, icon: Icon, description, trend, variant = "default" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          size={16}
          className={
            variant === "success"
              ? "text-green-600"
              : variant === "danger"
                ? "text-red-600"
                : "text-muted-foreground"
          }
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            <TrendingUp size={12} className="text-green-600" />
            <span className="text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
