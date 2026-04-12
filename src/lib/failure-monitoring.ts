/**
 * Failure Mode Monitoring - Unrecognized Mode Detection
 * PRO-28: Shadow Mode Security Implementation
 * 
 * Monitors for:
 * - PII leak attempts (redaction failures)
 * - Habitability false negatives (missed RED flags)
 * - Approval queue anomalies
 * - System errors (API failures, timeouts)
 * 
 * Flags immediately for Nightly Exception Report
 * Real-time CRITICAL alerting
 */

import { OperationLog, OperationAction } from '@/lib/operational-logging';

/**
 * Alert severity levels
 */
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Alert categories for classification
 */
export type AlertCategory =
  | 'PII_LEAK_ATTEMPT'
  | 'HABITABILITY_FALSE_NEGATIVE'
  | 'APPROVAL_QUEUE_ANOMALY'
  | 'SYSTEM_ERROR'
  | 'COMPLIANCE_VIOLATION'
  | 'PERFORMANCE_DEGRADATION'
  | 'SECURITY_THREAT';

/**
 * Alert structure for ingestion and reporting
 */
export interface Alert {
  // Identifiers
  alertId: string;
  timestamp: string;
  
  // Classification
  category: AlertCategory;
  severity: AlertSeverity;
  
  // Description
  title: string;
  description: string;
  
  // Context
  sourceLogId?: string;
  userId?: string;
  resourceId?: string;
  path?: string;
  
  // Evidence
  evidence: {
    type: string;
    data: any;
    confidence: number;
  }[];
  
  // Metadata
  metadata: Record<string, any>;
  
  // State
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive';
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  
  // Escalation
  escalated: boolean;
  escalatedAt?: string;
  includedInNightlyReport: boolean;
}

import { detectHabitability } from '@/lib/tony-messages';

/**
 * Failure mode detector configuration
 */
const MONITORING_CONFIG = {
  // Thresholds for anomaly detection
  thresholds: {
    // PII leak detection
    piiLeakConfidenceThreshold: 0.8,
    
    // Approval queue anomalies
    approvalQueueBacklogThreshold: 50,
    approvalRateDeviationThreshold: 0.3, // 30% deviation from baseline
    
    // Performance thresholds
    apiTimeoutThresholdMs: 10000,
    processingTimeThresholdMs: 30000,
    
    // Error rate thresholds
    errorRateThreshold: 0.05, // 5% error rate triggers alert
    
    // Habitability detection
    habitabilityKeywordMissRate: 0.1, // 10% miss rate triggers alert
  },

  // Auto-escalation rules
  autoEscalate: {
    categories: ['PII_LEAK_ATTEMPT', 'COMPLIANCE_VIOLATION', 'SECURITY_THREAT'] as AlertCategory[],
    severities: ['critical'] as AlertSeverity[],
  },
};

/**
 * In-memory alert store (production should use persistent storage)
 */
class AlertStore {
  private alerts: Alert[] = [];
  private readonly maxAlerts = 10000;
  
  /**
   * Create a new alert
   */
  create(alert: Omit<Alert, 'alertId' | 'timestamp' | 'status' | 'escalated' | 'includedInNightlyReport'>): Alert {
    const newAlert: Alert = {
      ...alert,
      alertId: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: 'new',
      escalated: false,
      includedInNightlyReport: false,
    };
    
    // Auto-escalate if matches criteria
    if (
      MONITORING_CONFIG.autoEscalate.categories.includes(newAlert.category) ||
      MONITORING_CONFIG.autoEscalate.severities.includes(newAlert.severity)
    ) {
      newAlert.escalated = true;
      newAlert.escalatedAt = newAlert.timestamp;
    }
    
    this.alerts.push(newAlert);
    
    // Trim if exceeds max
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(this.alerts.length - this.maxAlerts);
    }
    
    // Log critical alerts immediately
    if (newAlert.severity === 'critical') {
      console.error('[CRITICAL ALERT]', {
        alertId: newAlert.alertId,
        category: newAlert.category,
        title: newAlert.title,
        timestamp: newAlert.timestamp,
      });
    }
    
    return newAlert;
  }
  
  /**
   * Get alert by ID
   */
  get(alertId: string): Alert | undefined {
    return this.alerts.find((a) => a.alertId === alertId);
  }
  
  /**
   * Query alerts with filters
   */
  query(filters: {
    category?: AlertCategory;
    severity?: AlertSeverity;
    status?: Alert['status'];
    escalated?: boolean;
    includeInNightlyReport?: boolean;
    since?: string;
    limit?: number;
  }): Alert[] {
    let result = [...this.alerts];
    
    if (filters.category) {
      result = result.filter((a) => a.category === filters.category);
    }
    
    if (filters.severity) {
      result = result.filter((a) => a.severity === filters.severity);
    }
    
    if (filters.status) {
      result = result.filter((a) => a.status === filters.status);
    }
    
    if (filters.escalated !== undefined) {
      result = result.filter((a) => a.escalated === filters.escalated);
    }
    
    if (filters.includeInNightlyReport !== undefined) {
      result = result.filter((a) => a.includedInNightlyReport === filters.includeInNightlyReport);
    }
    
    if (filters.since) {
      const since = new Date(filters.since).getTime();
      result = result.filter((a) => new Date(a.timestamp).getTime() >= since);
    }
    
    // Sort by timestamp descending
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply limit
    if (filters.limit) {
      result = result.slice(0, filters.limit);
    }
    
    return result;
  }
  
  /**
   * Update alert status
   */
  update(alertId: string, updates: Partial<Alert>): Alert | null {
    const index = this.alerts.findIndex((a) => a.alertId === alertId);
    if (index === -1) {
      return null;
    }
    
    this.alerts[index] = { ...this.alerts[index], ...updates };
    return this.alerts[index];
  }
  
  /**
   * Acknowledge alert
   */
  acknowledge(alertId: string, userId: string): Alert | null {
    return this.update(alertId, {
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: userId,
    });
  }
  
  /**
   * Resolve alert
   */
  resolve(alertId: string, resolution: string, userId: string): Alert | null {
    return this.update(alertId, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolution,
      acknowledgedBy: userId,
    });
  }
  
  /**
   * Mark alerts for nightly report
   */
  markForNightlyReport(alertIds: string[]): void {
    this.alerts.forEach((alert) => {
      if (alertIds.includes(alert.alertId)) {
        alert.includedInNightlyReport = true;
      }
    });
  }
  
  /**
   * Get unreported critical/high alerts for nightly report
   */
  getUnreportedForNightly(): Alert[] {
    return this.query({
      status: 'new',
      escalated: true,
      includeInNightlyReport: false,
      since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
    }).filter((a) => a.severity === 'critical' || a.severity === 'high');
  }
  
  /**
   * Get alert statistics
   */
  getStats(since?: string): {
    total: number;
    byCategory: Record<AlertCategory, number>;
    bySeverity: Record<AlertSeverity, number>;
    byStatus: Record<Alert['status'], number>;
    criticalCount: number;
    unreportedCount: number;
  } {
    const alerts = since ? this.query({ since }) : this.alerts;
    
    const byCategory: Record<AlertCategory, number> = {
      PII_LEAK_ATTEMPT: 0,
      HABITABILITY_FALSE_NEGATIVE: 0,
      APPROVAL_QUEUE_ANOMALY: 0,
      SYSTEM_ERROR: 0,
      COMPLIANCE_VIOLATION: 0,
      PERFORMANCE_DEGRADATION: 0,
      SECURITY_THREAT: 0,
    };
    
    const bySeverity: Record<AlertSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    
    const byStatus: Record<Alert['status'], number> = {
      new: 0,
      acknowledged: 0,
      investigating: 0,
      resolved: 0,
      false_positive: 0,
    };
    
    let criticalCount = 0;
    
    alerts.forEach((alert) => {
      byCategory[alert.category]++;
      bySeverity[alert.severity]++;
      byStatus[alert.status]++;
      
      if (alert.severity === 'critical') {
        criticalCount++;
      }
    });
    
    return {
      total: alerts.length,
      byCategory,
      bySeverity,
      byStatus,
      criticalCount,
      unreportedCount: this.getUnreportedForNightly().length,
    };
  }
}

// Singleton instance
const alertStore = new AlertStore();

/**
 * Detect PII leak attempt from validation failure
 */
export function detectPIILeak(input: {
  userId: string;
  path: string;
  violations: any;
  sourceLogId?: string;
}): Alert {
  return alertStore.create({
    category: 'PII_LEAK_ATTEMPT',
    severity: 'critical',
    title: 'PII Leak Attempt Detected',
    description: `Unredacted PII detected in request to ${input.path}. Request blocked.`,
    sourceLogId: input.sourceLogId,
    userId: input.userId,
    path: input.path,
    evidence: [
      {
        type: 'pii_violation',
        data: input.violations,
        confidence: 0.95,
      },
    ],
    metadata: {
      violationDetails: input.violations,
      blocked: true,
    },
  });
}

/**
 * Detect potential habitability false negative
 */
export function detectHabitabilityFalseNegative(input: {
  messageId: string;
  messageContent: string;
  userId: string;
  missedKeywords: string[];
}): Alert {
  return alertStore.create({
    category: 'HABITABILITY_FALSE_NEGATIVE',
    severity: 'high',
    title: 'Potential Habitability False Negative',
    description: `Message may contain habitability issues but was not flagged. Keywords detected: ${input.missedKeywords.join(', ')}`,
    resourceId: input.messageId,
    userId: input.userId,
    evidence: [
      {
        type: 'keyword_match',
        data: {
          content: input.messageContent,
          keywords: input.missedKeywords,
        },
        confidence: 0.7,
      },
    ],
    metadata: {
      missedKeywords: input.missedKeywords,
      requiresReview: true,
    },
  });
}

/**
 * Detect approval queue anomaly
 */
export function detectApprovalQueueAnomaly(input: {
  anomalyType: 'backlog' | 'unusual_pattern' | 'rate_deviation';
  details: any;
  severity: AlertSeverity;
}): Alert {
  return alertStore.create({
    category: 'APPROVAL_QUEUE_ANOMALY',
    severity: input.severity,
    title: `Approval Queue Anomaly: ${input.anomalyType}`,
    description: `Detected unusual pattern in approval queue: ${JSON.stringify(input.details)}`,
    evidence: [
      {
        type: 'pattern_analysis',
        data: input.details,
        confidence: 0.8,
      },
    ],
    metadata: {
      anomalyType: input.anomalyType,
      requiresInvestigation: true,
    },
  });
}

/**
 * Detect system error
 */
export function detectSystemError(input: {
  errorType: string;
  errorMessage: string;
  path?: string;
  userId?: string;
  stackTrace?: string;
}): Alert {
  const severity = input.errorType.includes('timeout') || input.errorType.includes('api_failure')
    ? 'high'
    : 'medium';
  
  return alertStore.create({
    category: 'SYSTEM_ERROR',
    severity,
    title: `System Error: ${input.errorType}`,
    description: input.errorMessage,
    path: input.path,
    userId: input.userId,
    evidence: [
      {
        type: 'error_log',
        data: {
          errorType: input.errorType,
          errorMessage: input.errorMessage,
          stackTrace: input.stackTrace,
        },
        confidence: 1.0,
      },
    ],
    metadata: {
      errorType: input.errorType,
      requiresAttention: input.errorType === 'redaction_failure',
    },
  });
}

/**
 * Detect compliance violation
 */
export function detectComplianceViolation(input: {
  violationType: string;
  description: string;
  userId: string;
  resourceId?: string;
  evidence: any;
}): Alert {
  return alertStore.create({
    category: 'COMPLIANCE_VIOLATION',
    severity: 'critical',
    title: `Compliance Violation: ${input.violationType}`,
    description: input.description,
    userId: input.userId,
    resourceId: input.resourceId,
    evidence: Array.isArray(input.evidence)
      ? input.evidence
      : [{ type: 'compliance_check', data: input.evidence, confidence: 0.9 }],
    metadata: {
      violationType: input.violationType,
      requiresImmediateReview: true,
    },
  });
}

/**
 * Analyze operation logs for failure patterns
 */
export function analyzeLogsForFailures(logs: OperationLog[]): Alert[] {
  const alerts: Alert[] = [];
  
  logs.forEach((log) => {
    // Check for PII redaction failures
    if (log.action === 'COMPLIANCE_CHECK_FAILED' && log.metadata.piiTypesDetected) {
      alerts.push(
        detectPIILeak({
          userId: log.userId,
          path: log.metadata.path || 'unknown',
          violations: log.metadata.piiTypesDetected,
          sourceLogId: log.logId,
        })
      );
    }
    
    // Check for security violations
    if (log.action === 'SECURITY_VIOLATION_DETECTED') {
      alertStore.create({
        category: 'SECURITY_THREAT',
        severity: 'critical',
        title: 'Security Violation Detected',
        description: log.errorMessage || 'Security violation detected during operation',
        sourceLogId: log.logId,
        userId: log.userId,
        evidence: [
          {
            type: 'security_log',
            data: log.metadata,
            confidence: 0.95,
          },
        ],
        metadata: {
          violationType: log.metadata.violationType || 'unknown',
        },
      });
    }
  });
  
  return alerts;
}

/**
 * Scan message content for missed habitability keywords
 */
export function scanForMissedHabitabilityFlags(input: {
  messageId: string;
  content: string;
  wasFlagged: boolean;
  userId: string;
}): Alert | null {
  const detected = detectHabitability(input.content);
  const missedKeywords = !input.wasFlagged ? detected.matches : [];
  
  if (missedKeywords.length > 0) {
    return detectHabitabilityFalseNegative({
      messageId: input.messageId,
      messageContent: input.content,
      userId: input.userId,
      missedKeywords,
    });
  }
  
  return null;
}

/**
 * Monitor approval queue for anomalies
 */
export function monitorApprovalQueue(input: {
  currentBacklog: number;
  recentApprovals: number;
  recentRejections: number;
  baselineApprovalRate: number;
}): Alert | null {
  const { thresholds } = MONITORING_CONFIG;
  
  // Check backlog threshold
  if (input.currentBacklog > thresholds.approvalQueueBacklogThreshold) {
    return detectApprovalQueueAnomaly({
      anomalyType: 'backlog',
      details: {
        currentBacklog: input.currentBacklog,
        threshold: thresholds.approvalQueueBacklogThreshold,
      },
      severity: 'high',
    });
  }
  
  // Check approval rate deviation
  const currentApprovalRate =
    input.recentApprovals / (input.recentApprovals + input.recentRejections || 1);
  const deviation = Math.abs(currentApprovalRate - input.baselineApprovalRate);
  
  if (deviation > thresholds.approvalRateDeviationThreshold) {
    return detectApprovalQueueAnomaly({
      anomalyType: 'rate_deviation',
      details: {
        currentApprovalRate,
        baselineApprovalRate: input.baselineApprovalRate,
        deviation,
        threshold: thresholds.approvalRateDeviationThreshold,
      },
      severity: deviation > 0.5 ? 'critical' : 'medium',
    });
  }
  
  return null;
}

/**
 * Get alerts for Nightly Exception Report
 */
export function getNightlyExceptionReport(since?: string): {
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    highAlerts: number;
    byCategory: Record<AlertCategory, number>;
  };
  alerts: Alert[];
  recommendedActions: string[];
} {
  const now = new Date();
  const periodStart = since || new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  
  const alerts = alertStore.query({ since: periodStart });
  const stats = alertStore.getStats(periodStart);
  
  // Mark alerts for nightly report
  alertStore.markForNightlyReport(alerts.map((a) => a.alertId));
  
  // Generate recommended actions
  const recommendedActions: string[] = [];
  
  if (stats.byCategory.PII_LEAK_ATTEMPT > 0) {
    recommendedActions.push('Review PII redaction patterns and update regex rules');
  }
  
  if (stats.byCategory.HABITABILITY_FALSE_NEGATIVE > 0) {
    recommendedActions.push('Audit habitability keyword detection accuracy');
  }
  
  if (stats.byCategory.COMPLIANCE_VIOLATION > 0) {
    recommendedActions.push('Immediate compliance review required');
  }
  
  if (stats.criticalCount > 0) {
    recommendedActions.push(`Address ${stats.criticalCount} critical alert(s) before next business day`);
  }
  
  return {
    generatedAt: now.toISOString(),
    periodStart,
    periodEnd: now.toISOString(),
    summary: {
      totalAlerts: stats.total,
      criticalAlerts: stats.criticalCount,
      highAlerts: stats.bySeverity.high,
      byCategory: stats.byCategory,
    },
    alerts: alerts.filter((a) => a.status !== 'resolved' && a.status !== 'false_positive'),
    recommendedActions,
  };
}

/**
 * Get alert by ID
 */
export function getAlert(alertId: string): Alert | undefined {
  return alertStore.get(alertId);
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(alertId: string, userId: string): Alert | null {
  return alertStore.acknowledge(alertId, userId);
}

/**
 * Resolve an alert
 */
export function resolveAlert(alertId: string, resolution: string, userId: string): Alert | null {
  return alertStore.resolve(alertId, resolution, userId);
}

/**
 * Get alert statistics
 */
export function getAlertStats(since?: string) {
  return alertStore.getStats(since);
}

/**
 * Query alerts with filters
 */
export function query(filters?: {
  category?: string;
  severity?: string;
  status?: string;
  since?: string;
  limit?: number;
}): Alert[] {
  return alertStore.query(filters as any);
}

// Export default
export default {
  detectPIILeak,
  detectHabitabilityFalseNegative,
  detectApprovalQueueAnomaly,
  detectSystemError,
  detectComplianceViolation,
  analyzeLogsForFailures,
  scanForMissedHabitabilityFlags,
  monitorApprovalQueue,
  getNightlyExceptionReport,
  getAlert,
  acknowledgeAlert,
  resolveAlert,
  getAlertStats,
  query,
};
