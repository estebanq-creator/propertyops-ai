/**
 * Alert Ingestion API - Monitoring Alerts Endpoint
 * PRO-28: Shadow Mode Security Implementation
 * 
 * Handles:
 * - POST: Create new alert
 * - GET: Query alerts (owner role only)
 * - PUT: Update alert status (acknowledge/resolve)
 * 
 * Integration point for Nightly Exception Report
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';
import { canViewAuditLogs } from '@/lib/rbac';
import {
  detectPIILeak,
  detectHabitabilityFalseNegative,
  detectApprovalQueueAnomaly,
  detectSystemError,
  detectComplianceViolation,
  getNightlyExceptionReport,
  acknowledgeAlert,
  resolveAlert,
  getAlert,
  getAlertStats,
  AlertCategory,
  AlertSeverity,
} from '@/lib/failure-monitoring';
import { logOperation } from '@/lib/operational-logging';

/**
 * POST /api/monitoring/alerts
 * Create a new alert
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userRole = (session.user as any).role as UserRole;
    const userId = session.user.id || 'unknown';
    
    // Parse request body
    const body = await request.json();
    
    const {
      category,
      severity,
      title,
      description,
      sourceLogId,
      resourceId,
      evidence,
      metadata,
      // Specific detection fields
      violations, // For PII leaks
      messageContent, // For habitability false negatives
      missedKeywords, // For habitability false negatives
      anomalyType, // For approval queue anomalies
      details, // For approval queue anomalies
      errorType, // For system errors
      errorMessage, // For system errors
      violationType, // For compliance violations
    } = body;
    
    let alert;
    
    // Route to appropriate detector based on category
    switch (category as AlertCategory) {
      case 'PII_LEAK_ATTEMPT':
        alert = detectPIILeak({
          userId,
          path: body.path || request.url,
          violations: violations || body.metadata || {},
          sourceLogId,
        });
        break;
        
      case 'HABITABILITY_FALSE_NEGATIVE':
        if (!messageContent || !missedKeywords || !resourceId) {
          return NextResponse.json(
            { error: 'Missing required fields: messageContent, missedKeywords, resourceId' },
            { status: 400 }
          );
        }
        alert = detectHabitabilityFalseNegative({
          messageId: resourceId,
          messageContent,
          userId,
          missedKeywords,
        });
        break;
        
      case 'APPROVAL_QUEUE_ANOMALY':
        if (!anomalyType || !details) {
          return NextResponse.json(
            { error: 'Missing required fields: anomalyType, details' },
            { status: 400 }
          );
        }
        alert = detectApprovalQueueAnomaly({
          anomalyType,
          details,
          severity: (severity as AlertSeverity) || 'medium',
        });
        break;
        
      case 'SYSTEM_ERROR':
        if (!errorType || !errorMessage) {
          return NextResponse.json(
            { error: 'Missing required fields: errorType, errorMessage' },
            { status: 400 }
          );
        }
        alert = detectSystemError({
          errorType,
          errorMessage,
          path: body.path,
          userId,
          stackTrace: body.stackTrace,
        });
        break;
        
      case 'COMPLIANCE_VIOLATION':
        if (!violationType || !description || !evidence) {
          return NextResponse.json(
            { error: 'Missing required fields: violationType, description, evidence' },
            { status: 400 }
          );
        }
        alert = detectComplianceViolation({
          violationType,
          description,
          userId,
          resourceId,
          evidence,
        });
        break;
        
      default:
        // Generic alert creation
        if (!category || !title || !description) {
          return NextResponse.json(
            { error: 'Missing required fields: category, title, description' },
            { status: 400 }
          );
        }
        
        alert = await import('@/lib/failure-monitoring').then((mod) =>
          mod.detectSystemError({
            errorType: category,
            errorMessage: description,
            path: body.path,
            userId,
          })
        );
    }
    
    // Log alert creation
    logOperation({
      userId,
      userRole,
      action: 'SECURITY_VIOLATION_DETECTED',
      resourceType: 'system',
      outcome: alert.severity === 'critical' ? 'blocked' : 'failure',
      metadata: {
        alertId: alert.alertId,
        alertCategory: alert.category,
        alertSeverity: alert.severity,
      },
    });
    
    return NextResponse.json(
      {
        success: true,
        alert: {
          alertId: alert.alertId,
          category: alert.category,
          severity: alert.severity,
          title: alert.title,
          timestamp: alert.timestamp,
          escalated: alert.escalated,
        },
      },
      { status: alert.severity === 'critical' ? 201 : 200 }
    );
  } catch (error) {
    console.error('Failed to create alert:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create alert';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/monitoring/alerts
 * Query alerts (owner role only)
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userRole = (session.user as any).role as UserRole;
    
    // Alerts are owner-only
    if (!canViewAuditLogs(userRole)) {
      return NextResponse.json(
        { error: 'Access denied: owner role required' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category') as AlertCategory | undefined;
    const severity = url.searchParams.get('severity') as AlertSeverity | undefined;
    const status = url.searchParams.get('status') as any;
    const since = url.searchParams.get('since');
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const nightly = url.searchParams.get('nightly') === 'true';
    
    // Special case: Nightly Exception Report
    if (nightly) {
      const report = getNightlyExceptionReport(since || undefined);
      
      logOperation({
        userId: session.user.id || 'unknown',
        userRole,
        action: 'REVIEW_QUEUE_ACCESSED',
        resourceType: 'audit_log',
        outcome: 'success',
        metadata: {
          reportType: 'nightly_exception_report',
          alertCount: report.summary.totalAlerts,
          criticalCount: report.summary.criticalAlerts,
        },
      });
      
      return NextResponse.json(report);
    }
    
    // Query alerts
    const alertsModule = await import('@/lib/failure-monitoring');
    const allAlerts = alertsModule.getAlertStats(since || undefined);
    
    // Build filter
    const filters: any = {
      limit,
    };
    
    if (category) filters.category = category;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    if (since) filters.since = since;
    
    // Get filtered alerts
    const alerts = await import('@/lib/failure-monitoring').then((mod) =>
      mod.default.query(filters)
    );
    
    // Log access
    logOperation({
      userId: session.user.id || 'unknown',
      userRole,
      action: 'REVIEW_QUEUE_ACCESSED',
      resourceType: 'audit_log',
      outcome: 'success',
      metadata: {
        alertQuery: true,
        resultCount: alerts.length,
        filters: { category, severity, status, since },
      },
    });
    
    return NextResponse.json({
      alerts,
      stats: allAlerts,
    });
  } catch (error) {
    console.error('Failed to query alerts:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to query alerts';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/monitoring/alerts
 * Update alert status (acknowledge/resolve)
 */
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userRole = (session.user as any).role as UserRole;
    const userId = session.user.id || 'unknown';
    
    // Owner role required
    if (!canViewAuditLogs(userRole)) {
      return NextResponse.json(
        { error: 'Access denied: owner role required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { alertId, action, resolution } = body;
    
    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: alertId, action' },
        { status: 400 }
      );
    }
    
    let alert;
    
    switch (action) {
      case 'acknowledge':
        alert = acknowledgeAlert(alertId, userId);
        if (!alert) {
          return NextResponse.json(
            { error: 'Alert not found' },
            { status: 404 }
          );
        }
        
        logOperation({
          userId,
          userRole,
          action: 'REVIEW_QUEUE_ACCESSED',
          resourceType: 'audit_log',
          outcome: 'success',
          metadata: {
            alertAction: 'acknowledge',
            alertId,
          },
        });
        
        break;
        
      case 'resolve':
        if (!resolution) {
          return NextResponse.json(
            { error: 'Resolution reason required' },
            { status: 400 }
          );
        }
        
        alert = resolveAlert(alertId, resolution, userId);
        if (!alert) {
          return NextResponse.json(
            { error: 'Alert not found' },
            { status: 404 }
          );
        }
        
        logOperation({
          userId,
          userRole,
          action: 'REVIEW_QUEUE_ACCESSED',
          resourceType: 'audit_log',
          outcome: 'success',
          metadata: {
            alertAction: 'resolve',
            alertId,
            resolution,
          },
        });
        
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "acknowledge" or "resolve"' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      alert: {
        alertId: alert.alertId,
        status: alert.status,
        acknowledgedAt: alert.acknowledgedAt,
        resolvedAt: alert.resolvedAt,
        acknowledgedBy: alert.acknowledgedBy,
      },
    });
  } catch (error) {
    console.error('Failed to update alert:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to update alert';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/monitoring/alerts/[id]
 * Mark alert as false positive (soft delete)
 * Note: Actual deletion is not allowed for audit trail
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userRole = (session.user as any).role as UserRole;
    const userId = session.user.id || 'unknown';
    
    // Owner role required
    if (!canViewAuditLogs(userRole)) {
      return NextResponse.json(
        { error: 'Access denied: owner role required' },
        { status: 403 }
      );
    }
    
    // Parse alert ID from URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const alertId = pathParts[pathParts.length - 1];
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID required' },
        { status: 400 }
      );
    }
    
    // Mark as false positive
    const alertModule = await import('@/lib/failure-monitoring');
    const alert = alertModule.getAlert(alertId);
    
    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }
    
    // Update to false positive
    const updated = alertModule.resolveAlert(alertId, 'Marked as false positive', userId);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update alert' },
        { status: 500 }
      );
    }
    
    logOperation({
      userId,
      userRole,
      action: 'REVIEW_QUEUE_ACCESSED',
      resourceType: 'audit_log',
      outcome: 'success',
      metadata: {
        alertAction: 'false_positive',
        alertId,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Alert marked as false positive',
      alertId,
    });
  } catch (error) {
    console.error('Failed to delete alert:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete alert';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
