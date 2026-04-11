/**
 * Task Queue and Approval Workflow Types
 * 
 * Supports Phase 2 HITL (Human-in-the-Loop) strategy with:
 * - Drafting Agent workflow (low-stakes, one-click approval)
 * - Forced Read-and-Confirm pattern (safety-critical, explicit review required)
 * - Bulk operations for non-critical tasks
 */

export type TaskStatus = 
  | "pending"
  | "draft"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "failed"

export type TaskPriority = "low" | "medium" | "high" | "critical"

export type TaskType = 
  // Drafting Agent (low-stakes, auto-approvable)
  | "data_sync"
  | "report_generation"
  | "notification_draft"
  | "analytics_update"
  // Standard approval (requires review)
  | "expense_approval"
  | "vendor_payment"
  | "lease_renewal"
  | "maintenance_request"
  // Safety-critical (forced read-and-confirm)
  | "tenant_verification"
  | "emergency_dispatch"
  | "legal_document"
  | "security_alert"
  | "compliance_filing"

export type ApprovalLevel = "drafting" | "standard" | "forced_confirm"

export interface TaskAssignee {
  id: string
  name: string
  email: string
  avatar?: string
  role: "landlord" | "property_manager" | "agent" | "admin"
}

export interface TaskMetadata {
  propertyId?: string
  propertyName?: string
  tenantId?: string
  tenantName?: string
  amount?: number
  currency?: string
  dueDate?: string
  tags?: string[]
  customFields?: Record<string, string | number | boolean>
}

export interface TaskAction {
  id: string
  type: string
  description: string
  payload: Record<string, unknown>
  riskLevel: "low" | "medium" | "high" | "critical"
  estimatedImpact?: string
}

export interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  approvalLevel: ApprovalLevel
  
  // Assignment
  assignee?: TaskAssignee
  createdBy: string
  createdAt: string
  updatedAt: string
  
  // Timing
  dueDate?: string
  completedAt?: string
  
  // Workflow
  actions: TaskAction[]
  metadata: TaskMetadata
  
  // Approval tracking
  approvalHistory: ApprovalEvent[]
  requiresSignature?: boolean
  requiresTwoFactor?: boolean
  
  // Bulk operation eligibility
  canBulkApprove: boolean
  canBulkReject: boolean
}

export interface ApprovalEvent {
  id: string
  taskId: string
  action: "approved" | "rejected" | "commented" | "modified"
  userId: string
  userName: string
  timestamp: string
  comment?: string
  signature?: string // For legally binding approvals
  ipAddress?: string
  userAgent?: string
}

export interface TaskFilter {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  type?: TaskType[]
  assigneeId?: string
  approvalLevel?: ApprovalLevel[]
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface TaskSort {
  field: "priority" | "status" | "createdAt" | "dueDate" | "title"
  direction: "asc" | "desc"
}

export interface BulkOperation {
  taskIds: string[]
  operation: "approve" | "reject" | "reassign" | "change_priority" | "change_due_date"
  newAssigneeId?: string
  newPriority?: TaskPriority
  newDueDate?: string
  comment?: string
}

export interface ApprovalWorkflowConfig {
  // Drafting Agent: auto-approve after N seconds of no user action
  draftingAutoApproveSeconds?: number
  
  // Forced confirm: minimum time user must view before approving
  forcedConfirmMinViewSeconds: number
  
  // Bulk approval: max tasks per batch
  bulkApprovalMaxCount: number
  
  // Require comment on rejection
  requireRejectionComment: boolean
  
  // Require signature for specific task types
  requireSignatureFor: TaskType[]
  
  // Require 2FA for specific task types
  requireTwoFactorFor: TaskType[]
}

export const DEFAULT_WORKFLOW_CONFIG: ApprovalWorkflowConfig = {
  forcedConfirmMinViewSeconds: 5,
  bulkApprovalMaxCount: 50,
  requireRejectionComment: true,
  requireSignatureFor: ["legal_document", "compliance_filing", "tenant_verification"],
  requireTwoFactorFor: ["emergency_dispatch", "security_alert", "legal_document"],
}

// Helper to determine approval level from task type
export function getApprovalLevelForTaskType(type: TaskType): ApprovalLevel {
  const draftingTypes: TaskType[] = [
    "data_sync",
    "report_generation",
    "notification_draft",
    "analytics_update",
  ]
  
  const forcedConfirmTypes: TaskType[] = [
    "tenant_verification",
    "emergency_dispatch",
    "legal_document",
    "security_alert",
    "compliance_filing",
  ]
  
  if (draftingTypes.includes(type)) return "drafting"
  if (forcedConfirmTypes.includes(type)) return "forced_confirm"
  return "standard"
}

// Helper to check if task can be bulk approved
export function canBulkApproveTask(task: Task): boolean {
  // Safety-critical tasks cannot be bulk approved
  if (task.approvalLevel === "forced_confirm") return false
  // Only pending or draft tasks
  if (!["pending", "draft"].includes(task.status)) return false
  // Drafting agent tasks are always bulk-approvable
  if (task.approvalLevel === "drafting") return true
  // Standard tasks can be bulk approved if not high priority
  return task.priority !== "critical"
}
