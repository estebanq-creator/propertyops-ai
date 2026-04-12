// PropertyOpsAI Control Panel - Type Definitions

export interface Agent {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  lastHeartbeat: string;
  currentTask?: string;
  adapter?: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  sourceStatus?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeAgentId?: string | null;
  assigneeUserId?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  description?: string;
  identifier?: string; // e.g., "PRO-13"
  labels?: string[];
}

export type TenantMessageStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface TenantMessage {
  id: string;
  identifier?: string;
  issueNumber?: number;
  tenantId: string;
  tenantName?: string;
  propertyId?: string;
  propertyLabel?: string;
  unitId?: string;
  unitLabel?: string;
  subject: string;
  body: string;
  status: TenantMessageStatus;
  isHabitability: boolean;
  habitabilityMatches: string[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'paused' | 'failed';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  target?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  agents: Agent[];
  tunnelStatus: 'connected' | 'disconnected' | 'reconnecting';
  lastCheck: string;
  uptime: number;
  errorRate: number;
  paperclipVersion?: string;
  paperclipStatus?: string;
}

export type UserRole = 'owner' | 'landlord' | 'tenant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  propertyIds: string[];        // Properties user can access
  landlordId?: string;          // For tenants: links to their landlord
  createdAt?: string;
  updatedAt?: string;
}
