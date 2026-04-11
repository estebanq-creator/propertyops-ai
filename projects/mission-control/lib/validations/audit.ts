import { z } from "zod"

/**
 * Audit Log validation schemas
 * Tamper-evident logging for compliance and business moat
 */

// Audit event types
export const AuditEventTypeSchema = z.enum([
  // AI Agent Events
  "agent_report_generated",
  "agent_draft_created",
  "agent_analysis_complete",
  "agent_data_sync",
  "agent_notification_draft",
  
  // Human Actions
  "human_approval",
  "human_rejection",
  "human_modification",
  "human_override",
  
  // System Events
  "dispatch_event",
  "webhook_sent",
  "alert_triggered",
  "cron_job_executed",
  "cron_job_failed",
  
  // Security
  "login_attempt",
  "permission_change",
  "api_key_created",
  "api_key_revoked",
  
  // Data
  "data_export",
  "data_import",
  "data_deletion_scheduled",
  "data_retention_check",
])

export type AuditEventType = z.infer<typeof AuditEventTypeSchema>

// Audit severity levels
export const AuditSeveritySchema = z.enum([
  "info",
  "warning",
  "error",
  "critical",
])

export type AuditSeverity = z.infer<typeof AuditSeveritySchema>

// Agent reasoning output schema
export const AgentReasoningSchema = z.object({
  model: z.string(),
  modelVersion: z.string(),
  prompt: z.string().optional(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  alternativesConsidered: z.array(z.string()).optional(),
  tokensUsed: z.number().int().positive().optional(),
  latencyMs: z.number().positive().optional(),
})

export type AgentReasoning = z.infer<typeof AgentReasoningSchema>

// Input data schema (flexible for different event types)
export const InputDataSchema = z.record(z.string(), z.unknown())

export type InputData = z.infer<typeof InputDataSchema>

// Outcome schema
export const OutcomeSchema = z.object({
  success: z.boolean(),
  result: z.string().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type Outcome = z.infer<typeof OutcomeSchema>

// Actor schema (who performed the action)
export const ActorSchema = z.object({
  type: z.enum(["human", "agent", "system", "api"]),
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().optional(),
})

export type Actor = z.infer<typeof ActorSchema>

// Resource schema (what was acted upon)
export const ResourceSchema = z.object({
  type: z.string(),
  id: z.string(),
  name: z.string().optional(),
  propertyId: z.string().optional(),
  tenantId: z.string().optional(),
})

export type Resource = z.infer<typeof ResourceSchema>

// Full audit log entry schema
export const AuditLogEntrySchema = z.object({
  // Core fields
  id: z.string().uuid(),
  eventType: AuditEventTypeSchema,
  severity: AuditSeveritySchema,
  timestamp: z.string().datetime(),
  
  // Actor information
  actor: ActorSchema,
  
  // Resource acted upon
  resource: ResourceSchema.optional(),
  
  // Input data that triggered the event
  inputData: InputDataSchema.optional(),
  
  // AI reasoning (for agent events)
  agentReasoning: AgentReasoningSchema.optional(),
  
  // Final outcome
  outcome: OutcomeSchema,
  
  // Tamper-evidence
  hash: z.string(),
  previousHash: z.string().optional(),
  signature: z.string().optional(),
  
  // Retention
  retentionUntil: z.string().datetime(),
  retentionPolicy: z.string().default("36-months"),
  
  // Metadata
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>

// Audit log filter schema
export const AuditLogFilterSchema = z.object({
  // Event type filtering
  eventTypes: z.array(AuditEventTypeSchema).optional(),
  severity: AuditSeveritySchema.optional(),
  
  // Time range
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  
  // Actor filtering
  actorType: z.enum(["human", "agent", "system", "api"]).optional(),
  actorId: z.string().optional(),
  
  // Resource filtering
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  propertyId: z.string().optional(),
  tenantId: z.string().optional(),
  
  // Outcome filtering
  success: z.boolean().optional(),
  
  // Search
  search: z.string().optional(),
  
  // Pagination
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
  
  // Sorting
  sortBy: z.enum(["timestamp", "severity", "eventType"]).default("timestamp"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

export type AuditLogFilter = z.infer<typeof AuditLogFilterSchema>

// Audit log query response schema
export const AuditLogQueryResponseSchema = z.object({
  entries: z.array(AuditLogEntrySchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasMore: z.boolean(),
  }),
  retention: z.object({
    policy: z.string(),
    minimumRetentionMonths: z.number().int().positive(),
    oldestEntry: z.string().datetime().optional(),
    complianceStatus: z.enum(["compliant", "warning", "violation"]),
  }),
})

export type AuditLogQueryResponse = z.infer<typeof AuditLogQueryResponseSchema>

// Validation helpers
export function validateAuditLogEntry(data: unknown) {
  return AuditLogEntrySchema.safeParse(data)
}

export function validateAuditLogFilter(data: unknown) {
  return AuditLogFilterSchema.safeParse(data)
}

// Event type categories for UI grouping
export const EVENT_TYPE_CATEGORIES: Record<string, AuditEventType[]> = {
  "AI Agent": [
    "agent_report_generated",
    "agent_draft_created",
    "agent_analysis_complete",
    "agent_data_sync",
    "agent_notification_draft",
  ],
  "Human Actions": [
    "human_approval",
    "human_rejection",
    "human_modification",
    "human_override",
  ],
  "System Events": [
    "dispatch_event",
    "webhook_sent",
    "alert_triggered",
    "cron_job_executed",
    "cron_job_failed",
  ],
  "Security": [
    "login_attempt",
    "permission_change",
    "api_key_created",
    "api_key_revoked",
  ],
  "Data": [
    "data_export",
    "data_import",
    "data_deletion_scheduled",
    "data_retention_check",
  ],
}

export const EVENT_TYPE_LABELS: Record<AuditEventType, string> = {
  agent_report_generated: "Report Generated",
  agent_draft_created: "Draft Created",
  agent_analysis_complete: "Analysis Complete",
  agent_data_sync: "Data Sync",
  agent_notification_draft: "Notification Draft",
  human_approval: "Human Approval",
  human_rejection: "Human Rejection",
  human_modification: "Human Modification",
  human_override: "Human Override",
  dispatch_event: "Dispatch Event",
  webhook_sent: "Webhook Sent",
  alert_triggered: "Alert Triggered",
  cron_job_executed: "Cron Job Executed",
  cron_job_failed: "Cron Job Failed",
  login_attempt: "Login Attempt",
  permission_change: "Permission Change",
  api_key_created: "API Key Created",
  api_key_revoked: "API Key Revoked",
  data_export: "Data Export",
  data_import: "Data Import",
  data_deletion_scheduled: "Data Deletion Scheduled",
  data_retention_check: "Data Retention Check",
}

export const SEVERITY_LABELS: Record<AuditSeverity, string> = {
  info: "Info",
  warning: "Warning",
  error: "Error",
  critical: "Critical",
}

export const SEVERITY_COLORS: Record<AuditSeverity, string> = {
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  error: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}
