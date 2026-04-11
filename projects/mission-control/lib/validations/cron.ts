import { z } from "zod"

/**
 * Cron Job validation schemas
 * For visual cron job management in Mission Control
 */

// Cron job status
export const CronJobStatusSchema = z.enum([
  "active",
  "paused",
  "disabled",
  "running",
  "failed",
])

export type CronJobStatus = z.infer<typeof CronJobStatusSchema>

// Cron job execution result
export const CronJobResultSchema = z.object({
  success: z.boolean(),
  output: z.string().optional(),
  error: z.string().optional(),
  exitCode: z.number().int().optional(),
  duration: z.number().positive().optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
})

export type CronJobResult = z.infer<typeof CronJobResultSchema>

// Cron job schedule format
export const CronScheduleSchema = z.object({
  // Human-readable description
  description: z.string(),
  
  // Cron expression (standard 5-field or 6-field with seconds)
  expression: z.string().regex(
    /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]))(\s+(\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])))(\s+(\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])))(\s+(\*|([1-9]|1[012])|\*\/([1-9]|1[012])))(\s+(\*|([0-6])|\*\/([0-6])))?(\s+(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])))?$/
  ),
  
  // ISO 8601 duration for interval-based schedules (alternative to cron expression)
  interval: z.string().optional(), // e.g., "PT1H" for 1 hour, "P1D" for 1 day
  
  // Timezone for schedule execution
  timezone: z.string().default("UTC"),
  
  // Next scheduled run times (pre-calculated)
  nextRuns: z.array(z.string().datetime()).optional(),
})

export type CronSchedule = z.infer<typeof CronScheduleSchema>

// Cron job metadata
export const CronJobMetadataSchema = z.object({
  // Job category for grouping
  category: z.enum([
    "system",
    "agent",
    "reporting",
    "maintenance",
    "integration",
    "custom",
  ]).optional(),
  
  // Tags for filtering
  tags: z.array(z.string()).optional(),
  
  // Owner/creator
  createdBy: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  
  // Version for optimistic locking
  version: z.number().int().positive().optional(),
})

export type CronJobMetadata = z.infer<typeof CronJobMetadataSchema>

// Full cron job schema
export const CronJobSchema = z.object({
  // Core fields
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  
  // Schedule
  schedule: CronScheduleSchema,
  
  // Execution target
  target: z.object({
    type: z.enum(["command", "script", "webhook", "api"]),
    command: z.string().optional(),
    scriptPath: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    apiEndpoint: z.string().url().optional(),
    workingDirectory: z.string().optional(),
    environment: z.record(z.string(), z.string()).optional(),
  }),
  
  // Current status
  status: CronJobStatusSchema,
  
  // Execution history
  lastRun: CronJobResultSchema.optional(),
  nextRun: z.string().datetime().optional(),
  
  // Statistics
  stats: z.object({
    totalRuns: z.number().int().nonnegative(),
    successfulRuns: z.number().int().nonnegative(),
    failedRuns: z.number().int().nonnegative(),
    averageDuration: z.number().positive().optional(),
    lastSuccess: z.string().datetime().optional(),
    lastFailure: z.string().datetime().optional(),
    consecutiveFailures: z.number().int().nonnegative(),
  }).default({
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    consecutiveFailures: 0,
  }),
  
  // Configuration
  config: z.object({
    // Timeout in seconds
    timeout: z.number().int().positive().default(300),
    
    // Retry configuration
    retry: z.object({
      enabled: z.boolean().default(false),
      maxAttempts: z.number().int().positive().default(3),
      delaySeconds: z.number().int().positive().default(60),
      backoffMultiplier: z.number().positive().default(2),
    }).optional(),
    
    // Notifications
    notifications: z.object({
      onSuccess: z.boolean().default(false),
      onFailure: z.boolean().default(true),
      channels: z.array(z.enum(["email", "sms", "webhook", "slack"])).default(["email"]),
    }).optional(),
    
    // Concurrency
    concurrency: z.object({
      allowParallel: z.boolean().default(false),
      maxConcurrent: z.number().int().positive().default(1),
    }).optional(),
    
    // Logging
    logging: z.object({
      level: z.enum(["debug", "info", "warn", "error"]).default("info"),
      retainLogsDays: z.number().int().positive().default(30),
      includeOutput: z.boolean().default(true),
    }).optional(),
  }).default({
    timeout: 300,
  }),
  
  // Metadata
  metadata: CronJobMetadataSchema.optional(),
})

export type CronJob = z.infer<typeof CronJobSchema>

// Cron job creation schema
export const CreateCronJobSchema = CronJobSchema.omit({
  id: true,
  status: true,
  lastRun: true,
  nextRun: true,
  stats: true,
  metadata: true,
}).extend({
  metadata: CronJobMetadataSchema.optional(),
})

export type CreateCronJob = z.infer<typeof CreateCronJobSchema>

// Cron job update schema (all fields optional)
export const UpdateCronJobSchema = CreateCronJobSchema.partial()

export type UpdateCronJob = z.infer<typeof UpdateCronJobSchema>

// Cron job execution request
export const ExecuteCronJobRequestSchema = z.object({
  jobId: z.string().uuid(),
  force: z.boolean().default(false), // Force run even if paused/disabled
  parameters: z.record(z.string(), z.string()).optional(),
})

export type ExecuteCronJobRequest = z.infer<typeof ExecuteCronJobRequestSchema>

// Cron job execution response
export const ExecuteCronJobResponseSchema = z.object({
  success: z.boolean(),
  executionId: z.string().uuid(),
  jobId: z.string().uuid(),
  status: z.enum(["queued", "running", "completed", "failed"]),
  message: z.string(),
})

export type ExecuteCronJobResponse = z.infer<typeof ExecuteCronJobResponseSchema>

// Cron job history query
export const CronJobHistoryQuerySchema = z.object({
  jobId: z.string().uuid(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  status: z.enum(["success", "failure", "all"]).default("all"),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
})

export type CronJobHistoryQuery = z.infer<typeof CronJobHistoryQuerySchema>

// Validation helpers
export function validateCronJob(data: unknown) {
  return CronJobSchema.safeParse(data)
}

export function validateCreateCronJob(data: unknown) {
  return CreateCronJobSchema.safeParse(data)
}

export function validateCronSchedule(expression: string): { valid: boolean; description?: string; error?: string } {
  try {
    const result = CronScheduleSchema.shape.expression.safeParse(expression)
    if (result.success) {
      return { valid: true, description: parseCronExpression(expression) }
    }
    return { valid: false, error: result.error.message }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Invalid cron expression" }
  }
}

// Parse cron expression to human-readable description
function parseCronExpression(expression: string): string {
  const parts = expression.split(/\s+/)
  
  if (parts.length < 5) {
    return "Invalid cron expression"
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  const describeField = (value: string, field: string): string => {
    if (value === "*") {
      switch (field) {
        case "minute": return "every minute"
        case "hour": return "every hour"
        case "dayOfMonth": return "every day"
        case "month": return "every month"
        case "dayOfWeek": return "every day of the week"
      }
    }
    if (value.startsWith("*/")) {
      const interval = value.substring(2)
      switch (field) {
        case "minute": return `every ${interval} minutes`
        case "hour": return `every ${interval} hours`
        case "dayOfMonth": return `every ${interval} days`
        case "month": return `every ${interval} months`
        case "dayOfWeek": return `every ${interval} days of the week`
      }
    }
    return `at ${value}`
  }

  const timeDesc = `${describeField(minute, "minute")} past ${describeField(hour, "hour")}`
  const dateDesc = `${describeField(dayOfMonth, "dayOfMonth")} of ${describeField(month, "month")}, ${describeField(dayOfWeek, "dayOfWeek")}`

  return `${timeDesc}, ${dateDesc}`
}

// Common cron presets
export const CRON_PRESETS: Record<string, { expression: string; description: string }> = {
  "@every-minute": { expression: "* * * * *", description: "Every minute" },
  "@every-5-minutes": { expression: "*/5 * * * *", description: "Every 5 minutes" },
  "@every-15-minutes": { expression: "*/15 * * * *", description: "Every 15 minutes" },
  "@every-30-minutes": { expression: "*/30 * * * *", description: "Every 30 minutes" },
  "@hourly": { expression: "0 * * * *", description: "Every hour" },
  "@daily": { expression: "0 0 * * *", description: "Every day at midnight" },
  "@daily-noon": { expression: "0 12 * * *", description: "Every day at noon" },
  "@weekly": { expression: "0 0 * * 0", description: "Every week on Sunday" },
  "@monthly": { expression: "0 0 1 * *", description: "Every month on the 1st" },
  "@business-hours": { expression: "0 9-17 * * 1-5", description: "Every hour during business hours" },
}
