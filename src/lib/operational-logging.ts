/**
 * Operational Logging - Maintenance Memory Agent Integration
 * PRO-28: Shadow Mode Security Implementation
 * 
 * Logs EVERY Laura and Tony portal interaction
 * Capture: userId, action, timestamp, outcome, metadata
 * Append-only immutable audit trail
 * Dataset builder for Phase 3 auto-approval training
 * 
 * Integrates with:
 * - PRO-22 (Laura Portal)
 * - PRO-27 (Tony Portal)
 */

import { UserRole } from '@/types';

/**
 * Log entry structure for immutable audit trail
 */
export interface OperationLog {
  // Core identifiers
  logId: string;
  timestamp: string;
  
  // Actor information
  userId: string;
  userRole: UserRole;
  sessionId?: string;
  
  // Action details
  action: OperationAction;
  resourceType: ResourceType;
  resourceId?: string;
  
  // Outcome
  outcome: 'success' | 'failure' | 'pending' | 'blocked';
  statusCode?: number;
  errorMessage?: string;
  
  // Context and metadata
  metadata: OperationMetadata;
  
  // Compliance flags
  piiRedacted: boolean;
  redactionAuditId?: string;
  
  // Immutable marker
  immutable: true;
}

/**
 * Supported operation actions
 */
export type OperationAction =
  // Laura Portal actions
  | 'REPORT_CREATED'
  | 'REPORT_VIEWED'
  | 'REPORT_APPROVED'
  | 'REPORT_REJECTED'
  | 'REVIEW_QUEUE_ACCESSED'
  | 'FORENSIC_ANALYSIS_REQUESTED'
  
  // Tony Portal actions
  | 'MESSAGE_DRAFTED'
  | 'MESSAGE_SUBMITTED'
  | 'MESSAGE_APPROVED'
  | 'MESSAGE_REJECTED'
  | 'APPROVAL_QUEUE_ACCESSED'
  | 'HABITABILITY_FLAGGED'
  
  // System actions
  | 'USER_AUTHENTICATED'
  | 'USER_LOGOUT'
  | 'PII_REDACTION_APPLIED'
  | 'COMPLIANCE_CHECK_PASSED'
  | 'COMPLIANCE_CHECK_FAILED'
  | 'SECURITY_VIOLATION_DETECTED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'API_ERROR';

/**
 * Resource types in the system
 */
export type ResourceType =
  | 'forensic_report'
  | 'tenant_message'
  | 'user_account'
  | 'property'
  | 'review_queue'
  | 'approval_queue'
  | 'audit_log'
  | 'system';

/**
 * Metadata structure for operations
 */
export interface OperationMetadata {
  // Request context
  path?: string;
  method?: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Business context
  propertyId?: string;
  tenantId?: string;
  landlordId?: string;
  
  // Decision context
  approvalReason?: string;
  rejectionReason?: string;
  habitabilityFlag?: boolean;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  
  // Performance metrics
  processingTimeMs?: number;
  llmAgentUsed?: string;
  tokenCount?: number;
  
  // Redaction context
  piiTypesDetected?: string[];
  redactionCount?: number;
  
  // Additional context (flexible)
  [key: string]: any;
}

/**
 * Query filters for retrieving logs
 */
export interface LogQueryFilters {
  userId?: string;
  action?: OperationAction;
  resourceType?: ResourceType;
  resourceId?: string;
  outcome?: 'success' | 'failure' | 'pending' | 'blocked';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * In-memory log store (development only)
 * Production should use append-only database or log aggregation service
 */
class OperationalLogStore {
  private logs: OperationLog[] = [];
  private readonly maxLogs = 100000; // Prevent unbounded growth in dev
  
  /**
   * Append a new log entry (immutable)
   */
  append(log: OperationLog): void {
    // Enforce immutability
    if (!log.immutable) {
      throw new Error('All logs must be marked as immutable');
    }
    
    // Validate required fields
    this.validateLog(log);
    
    // Add to store
    this.logs.push(log);
    
    // Trim if exceeds max (oldest first)
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(this.logs.length - this.maxLogs);
    }
  }
  
  /**
   * Query logs with filters
   */
  query(filters: LogQueryFilters): OperationLog[] {
    let result = [...this.logs];
    
    // Apply filters
    if (filters.userId) {
      result = result.filter((log) => log.userId === filters.userId);
    }
    
    if (filters.action) {
      result = result.filter((log) => log.action === filters.action);
    }
    
    if (filters.resourceType) {
      result = result.filter((log) => log.resourceType === filters.resourceType);
    }
    
    if (filters.resourceId) {
      result = result.filter((log) => log.resourceId === filters.resourceId);
    }
    
    if (filters.outcome) {
      result = result.filter((log) => log.outcome === filters.outcome);
    }
    
    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      result = result.filter((log) => new Date(log.timestamp).getTime() >= start);
    }
    
    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      result = result.filter((log) => new Date(log.timestamp).getTime() <= end);
    }
    
    // Sort by timestamp descending (newest first)
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || 100;
    result = result.slice(offset, offset + limit);
    
    return result;
  }
  
  /**
   * Get logs for Nightly Exception Report
   */
  getExceptionLogs(since?: string): OperationLog[] {
    const filters: LogQueryFilters = {
      outcome: 'failure',
      limit: 1000,
    };
    
    if (since) {
      filters.startDate = since;
    }
    
    // Also include security violations and compliance failures
    const exceptions = this.query(filters);
    
    const securityViolations = this.query({
      action: 'SECURITY_VIOLATION_DETECTED',
      startDate: since,
      limit: 1000,
    });
    
    const complianceFailures = this.query({
      action: 'COMPLIANCE_CHECK_FAILED',
      startDate: since,
      limit: 1000,
    });
    
    // Merge and deduplicate
    const allExceptions = [...exceptions, ...securityViolations, ...complianceFailures];
    const uniqueIds = new Set<string>();
    
    return allExceptions.filter((log) => {
      if (uniqueIds.has(log.logId)) {
        return false;
      }
      uniqueIds.add(log.logId);
      return true;
    });
  }
  
  /**
   * Export logs for Phase 3 training dataset
   */
  exportForTraining(filters?: {
    action?: OperationAction;
    startDate?: string;
    endDate?: string;
  }): Array<{
    action: OperationAction;
    resourceType: ResourceType;
    outcome: 'success' | 'failure' | 'pending' | 'blocked';
    metadata: OperationMetadata;
    timestamp: string;
  }> {
    const logs = this.query(filters || {});
    
    // Export anonymized data suitable for ML training
    return logs.map((log) => ({
      action: log.action,
      resourceType: log.resourceType,
      outcome: log.outcome,
      metadata: {
        habitabilityFlag: log.metadata.habitabilityFlag,
        riskLevel: log.metadata.riskLevel,
        approvalReason: log.metadata.approvalReason,
        rejectionReason: log.metadata.rejectionReason,
        processingTimeMs: log.metadata.processingTimeMs,
        piiTypesDetected: log.metadata.piiTypesDetected,
        redactionCount: log.metadata.redactionCount,
      },
      timestamp: log.timestamp,
    }));
  }
  
  /**
   * Get statistics for monitoring dashboard
   */
  getStats(timeRange?: { start: string; end: string }): {
    totalLogs: number;
    byOutcome: Record<string, number>;
    byAction: Record<string, number>;
    byResourceType: Record<string, number>;
    complianceMetrics: {
      totalRedactions: number;
      violationsBlocked: number;
      complianceCheckPassRate: number;
    };
  } {
    const logs = timeRange
      ? this.query({ startDate: timeRange.start, endDate: timeRange.end, limit: 10000 })
      : this.logs;
    
    const byOutcome: Record<string, number> = {};
    const byAction: Record<string, number> = {};
    const byResourceType: Record<string, number> = {};
    let totalRedactions = 0;
    let violationsBlocked = 0;
    let complianceChecksPassed = 0;
    let complianceChecksTotal = 0;
    
    logs.forEach((log) => {
      byOutcome[log.outcome] = (byOutcome[log.outcome] || 0) + 1;
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byResourceType[log.resourceType] = (byResourceType[log.resourceType] || 0) + 1;
      
      if (log.piiRedacted && log.redactionAuditId) {
        totalRedactions++;
      }
      
      if (log.action === 'SECURITY_VIOLATION_DETECTED') {
        violationsBlocked++;
      }
      
      if (log.action === 'COMPLIANCE_CHECK_PASSED') {
        complianceChecksPassed++;
        complianceChecksTotal++;
      } else if (log.action === 'COMPLIANCE_CHECK_FAILED') {
        complianceChecksTotal++;
      }
    });
    
    return {
      totalLogs: logs.length,
      byOutcome,
      byAction,
      byResourceType,
      complianceMetrics: {
        totalRedactions,
        violationsBlocked,
        complianceCheckPassRate:
          complianceChecksTotal > 0 ? complianceChecksPassed / complianceChecksTotal : 1,
      },
    };
  }
  
  /**
   * Clear all logs (development only)
   */
  clear(): void {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clear logs in production');
    }
    this.logs = [];
  }
  
  private validateLog(log: OperationLog): void {
    const requiredFields: Array<keyof OperationLog> = [
      'logId',
      'timestamp',
      'userId',
      'userRole',
      'action',
      'resourceType',
      'outcome',
      'metadata',
      'piiRedacted',
      'immutable',
    ];
    
    for (const field of requiredFields) {
      if (log[field] === undefined || log[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if (!log.immutable) {
      throw new Error('Log must be marked as immutable');
    }
  }
}

// Singleton instance
const logStore = new OperationalLogStore();

/**
 * Generate unique log ID
 */
function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create and append an operation log
 * This is the primary function for logging operations
 */
export function logOperation(input: {
  userId: string;
  userRole: UserRole;
  action: OperationAction;
  resourceType: ResourceType;
  resourceId?: string;
  outcome: 'success' | 'failure' | 'pending' | 'blocked';
  statusCode?: number;
  errorMessage?: string;
  metadata?: OperationMetadata;
  piiRedacted?: boolean;
  redactionAuditId?: string;
}): OperationLog {
  const log: OperationLog = {
    logId: generateLogId(),
    timestamp: new Date().toISOString(),
    userId: input.userId,
    userRole: input.userRole,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    outcome: input.outcome,
    statusCode: input.statusCode,
    errorMessage: input.errorMessage,
    metadata: input.metadata || {},
    piiRedacted: input.piiRedacted || false,
    redactionAuditId: input.redactionAuditId,
    immutable: true,
  };
  
  // Append to store
  logStore.append(log);
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('[OperationalLog]', {
      logId: log.logId,
      action: log.action,
      outcome: log.outcome,
      userId: log.userId,
    });
  }
  
  return log;
}

/**
 * Log Laura portal actions (PRO-22 integration)
 */
export function logLauraAction(input: {
  userId: string;
  userRole: UserRole;
  action: Exclude<
    OperationAction,
    | 'MESSAGE_DRAFTED'
    | 'MESSAGE_SUBMITTED'
    | 'MESSAGE_APPROVED'
    | 'MESSAGE_REJECTED'
    | 'APPROVAL_QUEUE_ACCESSED'
    | 'HABITABILITY_FLAGGED'
  >;
  reportId?: string;
  outcome: 'success' | 'failure' | 'pending' | 'blocked';
  metadata?: OperationMetadata;
}): OperationLog {
  return logOperation({
    ...input,
    resourceType: 'forensic_report',
    resourceId: input.reportId,
  });
}

/**
 * Log Tony portal actions (PRO-27 integration)
 */
export function logTonyAction(input: {
  userId: string;
  userRole: UserRole;
  action: Extract<
    OperationAction,
    | 'MESSAGE_DRAFTED'
    | 'MESSAGE_SUBMITTED'
    | 'MESSAGE_APPROVED'
    | 'MESSAGE_REJECTED'
    | 'APPROVAL_QUEUE_ACCESSED'
    | 'HABITABILITY_FLAGGED'
  >;
  messageId?: string;
  outcome: 'success' | 'failure' | 'pending' | 'blocked';
  metadata?: OperationMetadata;
}): OperationLog {
  return logOperation({
    ...input,
    resourceType: 'tenant_message',
    resourceId: input.messageId,
  });
}

/**
 * Log PII redaction event
 */
export function logPIIRedaction(input: {
  userId: string;
  userRole: UserRole;
  redactionAuditId: string;
  piiTypesDetected: string[];
  redactionCount: number;
  path: string;
}): OperationLog {
  return logOperation({
    userId: input.userId,
    userRole: input.userRole,
    action: 'PII_REDACTION_APPLIED',
    resourceType: 'system',
    outcome: 'success',
    metadata: {
      path: input.path,
      piiTypesDetected: input.piiTypesDetected,
      redactionCount: input.redactionCount,
    },
    piiRedacted: true,
    redactionAuditId: input.redactionAuditId,
  });
}

/**
 * Log security violation
 */
export function logSecurityViolation(input: {
  userId: string;
  userRole: UserRole;
  violationType: string;
  details: any;
  blocked: boolean;
}): OperationLog {
  return logOperation({
    userId: input.userId,
    userRole: input.userRole,
    action: 'SECURITY_VIOLATION_DETECTED',
    resourceType: 'system',
    outcome: input.blocked ? 'blocked' : 'failure',
    metadata: {
      violationType: input.violationType,
      details: input.details,
    },
  });
}

/**
 * Retrieve logs for audit or reporting
 */
export function getOperationLogs(filters?: LogQueryFilters): OperationLog[] {
  return logStore.query(filters || {});
}

/**
 * Get exception logs for Nightly Exception Report
 */
export function getExceptionLogs(since?: string): OperationLog[] {
  return logStore.getExceptionLogs(since);
}

/**
 * Export training dataset for Phase 3
 */
export function exportTrainingData(filters?: {
  action?: OperationAction;
  startDate?: string;
  endDate?: string;
}): Array<{
  action: OperationAction;
  resourceType: ResourceType;
  outcome: 'success' | 'failure' | 'pending' | 'blocked';
  metadata: OperationMetadata;
  timestamp: string;
}> {
  return logStore.exportForTraining(filters);
}

/**
 * Get operational statistics
 */
export function getOperationalStats(timeRange?: {
  start: string;
  end: string;
}): {
  totalLogs: number;
  byOutcome: Record<string, number>;
  byAction: Record<string, number>;
  byResourceType: Record<string, number>;
  complianceMetrics: {
    totalRedactions: number;
    violationsBlocked: number;
    complianceCheckPassRate: number;
  };
} {
  return logStore.getStats(timeRange);
}

// Export singleton store for direct access when needed
export { logStore };

// Default export
export default {
  logOperation,
  logLauraAction,
  logTonyAction,
  logPIIRedaction,
  logSecurityViolation,
  getOperationLogs,
  getExceptionLogs,
  exportTrainingData,
  getOperationalStats,
};
