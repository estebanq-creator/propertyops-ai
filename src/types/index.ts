// PropertyOpsAI Control Panel - Type Definitions

export interface Agent {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  lastHeartbeat: string;
  currentTask?: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeAgentId?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  description?: string;
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
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'viewer';
}
