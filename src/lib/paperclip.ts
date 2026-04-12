// Paperclip API Client Library
// PropertyOpsAI Control Panel - Phase 1

const API_BASE_URL = process.env.PAPERCLIP_API_URL || 'http://127.0.0.1:3100/api';
const API_KEY = process.env.PAPERCLIP_API_KEY;
const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || 'edea9103-a49f-487f-901f-05b2753b965d';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 10000;

/**
 * Paperclip API error types
 */
export class PaperclipApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public retryable?: boolean
  ) {
    super(message);
    this.name = 'PaperclipApiError';
  }
}

/**
 * Agent status from Paperclip API
 */
export interface PaperclipAgent {
  id: string;
  companyId: string;
  name?: string;
  status?: 'online' | 'offline' | 'busy' | 'error';
  lastHeartbeat?: string;
  currentTask?: string;
  adapter?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Issue/Task from Paperclip API
 */
export interface PaperclipIssue {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeAgentId?: string;
  assigneeUserId?: string;
  identifier?: string; // e.g., "PRO-13"
  issueNumber?: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  labels?: string[];
}

/**
 * Fields that can be updated on a Paperclip issue
 */
export interface PaperclipIssueUpdate {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeAgentId?: string;
  assigneeUserId?: string;
  comment?: string;
}

/**
 * Health check response from Paperclip API
 */
export interface PaperclipHealth {
  status: string;
  version: string;
  deploymentMode: string;
  deploymentExposure: string;
  authReady: boolean;
  bootstrapStatus: string;
  bootstrapInviteActive: boolean;
  features?: {
    companyDeletionEnabled?: boolean;
  };
}

/**
 * Make an authenticated request to the Paperclip API with retry logic
 */
export async function paperclipRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new PaperclipApiError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code,
        // Retry on 5xx errors or network issues
        response.status >= 500 || response.status === 429
      );

      // Retry logic for retryable errors
      if (error.retryable && retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        return paperclipRequest<T>(endpoint, options, retryCount + 1);
      }

      throw error;
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof PaperclipApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new PaperclipApiError(
          'Request timeout - Paperclip API did not respond',
          408,
          'TIMEOUT',
          true
        );
      }
      throw new PaperclipApiError(
        `Network error: ${error.message}`,
        undefined,
        'NETWORK_ERROR',
        true
      );
    }

    throw new PaperclipApiError('Unknown error occurred', undefined, 'UNKNOWN');
  }
}

/**
 * Fetch Paperclip API health status
 */
export async function getHealth(): Promise<PaperclipHealth> {
  return paperclipRequest<PaperclipHealth>('/health');
}

/**
 * Fetch all agents for the company
 */
export async function getAgents(): Promise<PaperclipAgent[]> {
  return paperclipRequest<PaperclipAgent[]>(
    `/companies/${COMPANY_ID}/agents`
  );
}

/**
 * Fetch all issues (tasks) for the company
 */
export async function getIssues(
  options?: {
    status?: string;
    priority?: string;
    limit?: number;
  }
): Promise<PaperclipIssue[]> {
  const params = new URLSearchParams();
  if (options?.status) params.append('status', options.status);
  if (options?.priority) params.append('priority', options.priority);
  if (options?.limit) params.append('limit', options.limit.toString());

  const queryString = params.toString();
  const endpoint = `/companies/${COMPANY_ID}/issues${queryString ? `?${queryString}` : ''}`;

  return paperclipRequest<PaperclipIssue[]>(endpoint);
}

export async function getIssue(issueId: string): Promise<PaperclipIssue> {
  return paperclipRequest<PaperclipIssue>(`/issues/${issueId}`);
}

/**
 * Update a Paperclip issue by ID
 */
export async function updateIssue(
  issueId: string,
  update: PaperclipIssueUpdate
): Promise<PaperclipIssue> {
  return paperclipRequest<PaperclipIssue>(`/issues/${issueId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
}

/**
 * Map Paperclip agent status to our internal status enum
 */
export function mapAgentStatus(agent: PaperclipAgent): {
  status: 'online' | 'offline' | 'busy' | 'error';
  lastHeartbeat: string;
  currentTask?: string;
} {
  // Default to online if no explicit status
  let status: 'online' | 'offline' | 'busy' | 'error' = 'online';
  
  // Check if agent has recent heartbeat (within 5 minutes)
  const lastHeartbeat = agent.lastHeartbeat || agent.updatedAt || agent.createdAt || new Date().toISOString();
  const heartbeatAge = Date.now() - new Date(lastHeartbeat).getTime();
  
  if (heartbeatAge > 300000) { // 5 minutes
    status = 'offline';
  } else if (agent.status === 'error') {
    status = 'error';
  } else if (agent.status === 'busy' || agent.adapter === 'busy') {
    status = 'busy';
  }

  return {
    status,
    lastHeartbeat,
    currentTask: agent.currentTask,
  };
}

/**
 * Map Paperclip issue to our internal Task type
 */
export function mapIssueToTask(issue: PaperclipIssue): {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  sourceStatus?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeAgentId?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  description?: string;
} {
  // Map Paperclip status to our task status
  let taskStatus: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' = 'pending';
  
  switch (issue.status.toLowerCase()) {
    case 'done':
    case 'completed':
      taskStatus = 'completed';
      break;
    case 'failed':
      taskStatus = 'failed';
      break;
    case 'cancelled':
      taskStatus = 'rejected';
      break;
    case 'in_progress':
      taskStatus = 'approved';
      break;
    default:
      taskStatus = 'pending';
  }

  // Map priority
  let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  switch (issue.priority?.toLowerCase()) {
    case 'critical':
      priority = 'critical';
      break;
    case 'high':
      priority = 'high';
      break;
    case 'medium':
      priority = 'medium';
      break;
    case 'low':
      priority = 'low';
      break;
  }

  return {
    id: issue.id,
    title: issue.title,
    status: taskStatus,
    sourceStatus: issue.status,
    priority,
    assigneeAgentId: issue.assigneeAgentId,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    approvedAt: issue.completedAt,
    approvedBy: issue.completedAt ? 'System' : undefined,
    description: issue.description || issue.identifier,
  };
}

/**
 * Fields that can be updated on an issue via PATCH /api/issues/{issueId}
 */
export interface PaperclipIssueUpdate {
  status?: string;
  priority?: string;
  assigneeAgentId?: string;
  title?: string;
  description?: string;
  comment?: string;
}

/**
 * Convenience: move an issue to a new status.
 *
 * @param issueId  The issue UUID (not the human identifier like "PRO-14").
 * @param status   Target status, e.g. "backlog", "in_progress", "done".
 * @param comment  Optional comment to attach to the transition.
 */
export async function setIssueStatus(
  issueId: string,
  status: string,
  comment?: string
): Promise<PaperclipIssue> {
  return updateIssue(issueId, { status, ...(comment ? { comment } : {}) });
}

/**
 * Check tunnel connectivity by pinging the API
 */
export async function checkTunnelConnectivity(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    await getHealth();
    const latencyMs = Date.now() - startTime;
    return { connected: true, latencyMs };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
