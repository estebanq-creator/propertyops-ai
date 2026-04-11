import { z } from "zod"

/**
 * Health check validation schemas
 * Strict runtime validation for all telemetry endpoints
 */

// Agent status enum
export const AgentStatusSchema = z.enum([
  "online",
  "offline",
  "degraded",
  "starting",
  "stopped",
])

export type AgentStatus = z.infer<typeof AgentStatusSchema>

// Resource metrics schema
export const ResourceMetricsSchema = z.object({
  cpu: z.object({
    usage: z.number().min(0).max(100),
    cores: z.number().int().positive(),
    temperature: z.number().optional(),
  }),
  memory: z.object({
    used: z.number().positive(),
    total: z.number().positive(),
    percentage: z.number().min(0).max(100),
  }),
  disk: z.object({
    used: z.number().positive(),
    total: z.number().positive(),
    percentage: z.number().min(0).max(100),
  }).optional(),
  network: z.object({
    bytesSent: z.number().nonnegative(),
    bytesReceived: z.number().nonnegative(),
    activeConnections: z.number().int().nonnegative(),
  }).optional(),
})

export type ResourceMetrics = z.infer<typeof ResourceMetricsSchema>

// Tailscale tunnel status schema
export const TunnelStatusSchema = z.object({
  connected: z.boolean(),
  localIp: z.string().ip().optional(),
  tailscaleIp: z.string().ip().optional(),
  exitNodeId: z.string().optional(),
  latency: z.number().positive().optional(),
  lastHandshake: z.string().datetime().optional(),
  relayUsed: z.boolean().optional(),
})

export type TunnelStatus = z.infer<typeof TunnelStatusSchema>

// Agent heartbeat payload schema
export const AgentHeartbeatSchema = z.object({
  agentId: z.string().min(1).max(64),
  agentName: z.string().min(1).max(128),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  status: AgentStatusSchema,
  uptime: z.number().positive(),
  startTime: z.string().datetime(),
  lastActivity: z.string().datetime(),
  resources: ResourceMetricsSchema,
  tunnel: TunnelStatusSchema,
  activeJobs: z.number().int().nonnegative(),
  queuedJobs: z.number().int().nonnegative(),
  failedJobs: z.number().int().nonnegative(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type AgentHeartbeat = z.infer<typeof AgentHeartbeatSchema>

// Ping request/response schema
export const PingRequestSchema = z.object({
  agentId: z.string().min(1).max(64),
  timestamp: z.string().datetime(),
  tunnelLatency: z.number().positive().optional(),
})

export type PingRequest = z.infer<typeof PingRequestSchema>

export const PingResponseSchema = z.object({
  status: z.literal("ok"),
  serverTime: z.string().datetime(),
  latency: z.number().positive(),
  tunnelLatency: z.number().positive().optional(),
  agentId: z.string(),
})

export type PingResponse = z.infer<typeof PingResponseSchema>

// Health ready response schema
export const HealthReadyResponseSchema = z.object({
  status: z.literal("ready"),
  version: z.string(),
  uptime: z.number().positive(),
  agents: z.object({
    total: z.number().int().nonnegative(),
    online: z.number().int().nonnegative(),
    offline: z.number().int().nonnegative(),
    degraded: z.number().int().nonnegative(),
  }),
  tunnel: z.object({
    connected: z.boolean(),
    activeAgents: z.number().int().nonnegative(),
  }),
  lastTelemetryUpdate: z.string().datetime().optional(),
})

export type HealthReadyResponse = z.infer<typeof HealthReadyResponseSchema>

// Alert payload schema
export const AlertSeveritySchema = z.enum(["low", "medium", "high", "critical"])

export type AlertSeverity = z.infer<typeof AlertSeveritySchema>

export const AlertPayloadSchema = z.object({
  id: z.string().uuid().optional(),
  severity: AlertSeveritySchema,
  category: z.enum([
    "tunnel",
    "agent",
    "system",
    "security",
    "performance",
  ]),
  title: z.string().min(1).max(256),
  message: z.string().min(1).max(2048),
  agentId: z.string().min(1).max(64).optional(),
  agentName: z.string().max(128).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime(),
  requiresAck: z.boolean().default(true),
  ttlSeconds: z.number().int().positive().optional(),
})

export type AlertPayload = z.infer<typeof AlertPayloadSchema>

// Validation helpers
export function validateHeartbeat(data: unknown) {
  return AgentHeartbeatSchema.safeParse(data)
}

export function validatePing(data: unknown) {
  return PingRequestSchema.safeParse(data)
}

export function validateAlert(data: unknown) {
  return AlertPayloadSchema.safeParse(data)
}
