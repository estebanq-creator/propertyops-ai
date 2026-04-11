import { Resend } from "resend"
import { AlertPayload, AlertSeverity } from "@/lib/validations/health"

/**
 * Alerting Service
 * Routes critical alerts to appropriate channels based on severity
 * 
 * Channels:
 * - Email (Resend): All severities
 * - SMS (Twilio): High and Critical only (stubbed)
 * - Webhook: Configurable endpoints (stubbed)
 */

// Alert channel configuration
interface AlertChannelConfig {
  email: {
    enabled: boolean
    from: string
    to: string[]
  }
  sms: {
    enabled: boolean
    to: string[]
  }
  webhook: {
    enabled: boolean
    urls: string[]
  }
}

// Alert routing rules
interface AlertRoutingRule {
  severity: AlertSeverity
  channels: Array<"email" | "sms" | "webhook">
  rateLimitSeconds?: number
}

class AlertingService {
  private resend: Resend | null = null
  private config: AlertChannelConfig
  private rules: AlertRoutingRule[]
  private sentAlerts: Map<string, number> = new Map()

  constructor() {
    // Initialize Resend if API key exists
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      this.resend = new Resend(resendKey)
    }

    this.config = {
      email: {
        enabled: !!process.env.RESEND_API_KEY,
        from: process.env.ALERT_EMAIL_FROM || "alerts@mission-control.propertyops.ai",
        to: process.env.ALERT_EMAIL_TO?.split(",") || ["admin@propertyops.ai"],
      },
      sms: {
        enabled: !!process.env.TWILIO_ACCOUNT_SID,
        to: process.env.ALERT_SMS_TO?.split(",") || [],
      },
      webhook: {
        enabled: !!process.env.ALERT_WEBHOOK_URL,
        urls: process.env.ALERT_WEBHOOK_URL?.split(",") || [],
      },
    }

    // Define routing rules by severity
    this.rules = [
      {
        severity: "low",
        channels: ["email"],
        rateLimitSeconds: 300, // 5 minutes
      },
      {
        severity: "medium",
        channels: ["email"],
        rateLimitSeconds: 120, // 2 minutes
      },
      {
        severity: "high",
        channels: ["email", "sms"],
        rateLimitSeconds: 60, // 1 minute
      },
      {
        severity: "critical",
        channels: ["email", "sms", "webhook"],
        rateLimitSeconds: 30, // 30 seconds
      },
    ]
  }

  /**
   * Send alert through appropriate channels based on severity
   */
  async sendAlert(alert: AlertPayload): Promise<AlertSendResult> {
    const result: AlertSendResult = {
      alertId: alert.id || crypto.randomUUID(),
      severity: alert.severity,
      channels: [],
      errors: [],
    }

    // Check rate limiting
    const rule = this.rules.find((r) => r.severity === alert.severity)
    if (!rule) {
      result.errors.push(`No routing rule for severity: ${alert.severity}`)
      return result
    }

    const rateLimitKey = `${alert.category}:${alert.title}`
    const lastSent = this.sentAlerts.get(rateLimitKey)
    const now = Date.now()

    if (lastSent && rule.rateLimitSeconds) {
      const elapsed = (now - lastSent) / 1000
      if (elapsed < rule.rateLimitSeconds) {
        // Rate limited, skip but don't error
        console.log(`[Alerting] Rate limited: ${rateLimitKey} (${Math.round(elapsed)}s/${rule.rateLimitSeconds}s)`)
        result.rateLimited = true
        return result
      }
    }

    // Send through each configured channel
    const sendPromises: Promise<void>[] = []

    if (rule.channels.includes("email") && this.config.email.enabled) {
      sendPromises.push(
        this.sendEmail(alert)
          .then(() => result.channels.push("email"))
          .catch((err) => result.errors.push(`Email: ${err.message}`))
      )
    }

    if (rule.channels.includes("sms") && this.config.sms.enabled) {
      sendPromises.push(
        this.sendSms(alert)
          .then(() => result.channels.push("sms"))
          .catch((err) => result.errors.push(`SMS: ${err.message}`))
      )
    }

    if (rule.channels.includes("webhook") && this.config.webhook.enabled) {
      sendPromises.push(
        this.sendWebhook(alert)
          .then(() => result.channels.push("webhook"))
          .catch((err) => result.errors.push(`Webhook: ${err.message}`))
      )
    }

    await Promise.allSettled(sendPromises)

    // Update rate limit tracking
    this.sentAlerts.set(rateLimitKey, now)

    // Clean old entries (keep last hour)
    if (this.sentAlerts.size > 100) {
      const oneHourAgo = Date.now() - 3600000
      for (const [key, timestamp] of this.sentAlerts.entries()) {
        if (timestamp < oneHourAgo) {
          this.sentAlerts.delete(key)
        }
      }
    }

    return result
  }

  /**
   * Send alert via email using Resend
   */
  private async sendEmail(alert: AlertPayload): Promise<void> {
    if (!this.resend) {
      throw new Error("Resend not initialized")
    }

    const subject = `[${alert.severity.toUpperCase()}] ${alert.title}`
    
    const html = this.buildEmailHtml(alert)
    const text = this.buildEmailText(alert)

    const response = await this.resend.emails.send({
      from: this.config.email.from,
      to: this.config.email.to,
      subject,
      html,
      text,
      tags: {
        severity: alert.severity,
        category: alert.category,
        agentId: alert.agentId || "system",
      },
    })

    if (response.error) {
      throw new Error(response.error.message)
    }

    console.log(`[Alerting] Email sent: ${response.id}`)
  }

  /**
   * Send alert via SMS using Twilio (STUB)
   * 
   * TODO: Implement with actual Twilio credentials
   * - Install: npm install twilio
   * - Set env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
   */
  private async sendSms(alert: AlertPayload): Promise<void> {
    if (this.config.sms.to.length === 0) {
      throw new Error("No SMS recipients configured")
    }

    // STUB: Twilio implementation
    // Uncomment and configure when Twilio credentials are available:
    /*
    const twilio = require("twilio")
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    const message = `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`

    for (const to of this.config.sms.to) {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      })
    }
    */

    // Stub implementation - log only
    console.log(`[Alerting] SMS STUB - Would send to ${this.config.sms.to.join(", ")}`)
    console.log(`[Alerting] SMS STUB - Severity: ${alert.severity}, Title: ${alert.title}`)
    
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  /**
   * Send alert to webhook endpoints (STUB)
   */
  private async sendWebhook(alert: AlertPayload): Promise<void> {
    if (this.config.webhook.urls.length === 0) {
      throw new Error("No webhook URLs configured")
    }

    const sendPromises = this.config.webhook.urls.map(async (url) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.ALERT_WEBHOOK_TOKEN || ""}`,
        },
        body: JSON.stringify(alert),
      })

      if (!response.ok) {
        throw new Error(`Webhook responded with ${response.status}`)
      }
    })

    await Promise.all(sendPromises)
    console.log(`[Alerting] Webhook sent to ${this.config.webhook.urls.length} endpoint(s)`)
  }

  /**
   * Build HTML email body
   */
  private buildEmailHtml(alert: AlertPayload): string {
    const severityColors: Record<AlertSeverity, string> = {
      low: "#22c55e",
      medium: "#eab308",
      high: "#f97316",
      critical: "#ef4444",
    }

    const color = severityColors[alert.severity]

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { padding: 20px; border-radius: 8px 8px 0 0; background-color: ${color}; color: white; }
    .content { padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; background-color: ${color}; color: white; }
    .meta { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
    .button { display: inline-block; padding: 12px 24px; background-color: ${color}; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">${alert.severity}</span>
      <h1 style="margin: 12px 0 0 0; font-size: 24px;">${alert.title}</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; line-height: 1.6;">${alert.message}</p>
      
      ${alert.agentName ? `
        <p style="margin-top: 16px; font-size: 14px; color: #6b7280;">
          <strong>Agent:</strong> ${alert.agentName} ${alert.agentId ? `(${alert.agentId})` : ""}
        </p>
      ` : ""}
      
      ${alert.metadata ? `
        <details style="margin-top: 16px;">
          <summary style="cursor: pointer; font-size: 14px; color: #6b7280;">View Details</summary>
          <pre style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; font-size: 12px; overflow-x: auto;">${JSON.stringify(alert.metadata, null, 2)}</pre>
        </details>
      ` : ""}
      
      <div class="meta">
        <p><strong>Category:</strong> ${alert.category}</p>
        <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
        ${alert.requiresAck ? `<p><strong>Action Required:</strong> This alert requires acknowledgment</p>` : ""}
      </div>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://mission-control.propertyops.ai"}/alerts" class="button">
        View in Mission Control
      </a>
    </div>
  </div>
</body>
</html>
    `.trim()
  }

  /**
   * Build plain text email body
   */
  private buildEmailText(alert: AlertPayload): string {
    let text = `
[${alert.severity.toUpperCase()}] ${alert.title}

${alert.message}
    `.trim()

    if (alert.agentName) {
      text += `\n\nAgent: ${alert.agentName}${alert.agentId ? ` (${alert.agentId})` : ""}`
    }

    text += `\n\nCategory: ${alert.category}`
    text += `\nTime: ${new Date(alert.timestamp).toLocaleString()}`
    
    if (alert.requiresAck) {
      text += `\nAction Required: This alert requires acknowledgment`
    }

    text += `\n\nView in Mission Control: ${process.env.NEXT_PUBLIC_APP_URL || "https://mission-control.propertyops.ai"}/alerts`

    return text
  }

  /**
   * Check if a specific alert type was recently sent (for rate limiting)
   */
  wasRecentlySent(category: string, title: string, windowSeconds: number = 300): boolean {
    const key = `${category}:${title}`
    const lastSent = this.sentAlerts.get(key)
    if (!lastSent) return false
    
    const elapsed = (Date.now() - lastSent) / 1000
    return elapsed < windowSeconds
  }

  /**
   * Clear rate limit tracking for a specific alert
   */
  clearRateLimit(category: string, title: string): void {
    const key = `${category}:${title}`
    this.sentAlerts.delete(key)
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): Map<string, number> {
    return new Map(this.sentAlerts)
  }
}

export interface AlertSendResult {
  alertId: string
  severity: AlertSeverity
  channels: Array<"email" | "sms" | "webhook">
  errors: string[]
  rateLimited?: boolean
}

// Singleton instance
let alertingService: AlertingService | null = null

export function getAlertingService(): AlertingService {
  if (!alertingService) {
    alertingService = new AlertingService()
  }
  return alertingService
}

// Convenience export for direct use
export const alerting = getAlertingService()
