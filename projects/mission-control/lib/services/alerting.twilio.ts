/**
 * Twilio SMS Service (Implementation Guide)
 * 
 * This file provides the complete Twilio implementation for SMS alerts.
 * Uncomment and configure when Twilio credentials are available.
 * 
 * Setup:
 * 1. npm install twilio
 * 2. Set environment variables:
 *    - TWILIO_ACCOUNT_SID
 *    - TWILIO_AUTH_TOKEN
 *    - TWILIO_PHONE_NUMBER
 *    - ALERT_SMS_TO (comma-separated list)
 */

// import twilio from "twilio"
import { AlertPayload, AlertSeverity } from "@/lib/validations/health"

// Twilio client type (when installed)
// type TwilioClient = ReturnType<typeof twilio>

class TwilioService {
  // private client: TwilioClient | null = null
  private fromNumber: string
  private toNumbers: string[]

  constructor() {
    // Initialize Twilio client when credentials are available:
    // const accountSid = process.env.TWILIO_ACCOUNT_SID
    // const authToken = process.env.TWILIO_AUTH_TOKEN
    // this.client = accountSid && authToken ? twilio(accountSid, authToken) : null

    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || ""
    this.toNumbers = process.env.ALERT_SMS_TO?.split(",") || []
  }

  /**
   * Check if Twilio is configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      this.fromNumber &&
      this.toNumbers.length > 0
    )
  }

  /**
   * Send SMS alert
   * 
   * @param alert - Alert payload to send
   * @returns Promise resolving to message SIDs
   */
  async sendSms(alert: AlertPayload): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error("Twilio not configured. Set TWILIO_* environment variables.")
    }

    // Format message for SMS (160 char limit per segment, Twilio handles concatenation)
    const message = this.formatSmsMessage(alert)

    // Send to all configured numbers
    const sendPromises = this.toNumbers.map(async (toNumber) => {
      // Uncomment when Twilio is installed:
      /*
      const result = await this.client!.messages.create({
        body: message,
        from: this.fromNumber,
        to: toNumber.trim(),
      })
      console.log(`[Twilio] SMS sent to ${toNumber}: ${result.sid}`)
      return result.sid
      */

      // Stub implementation
      console.log(`[Twilio STUB] Would send to ${toNumber}: ${message}`)
      return `stub-${Date.now()}`
    })

    const results = await Promise.all(sendPromises)
    return results
  }

  /**
   * Format alert as SMS message
   * 
   * SMS messages have 160 character limit per segment.
   * Twilio automatically concatenates multi-segment messages.
   */
  private formatSmsMessage(alert: AlertPayload): string {
    const severityEmoji: Record<AlertSeverity, string> = {
      low: "ℹ️",
      medium: "⚠️",
      high: "🔴",
      critical: "🚨",
    }

    // Truncate title if too long (leave room for other info)
    const maxTitleLength = 50
    const title = alert.title.length > maxTitleLength
      ? alert.title.substring(0, maxTitleLength - 3) + "..."
      : alert.title

    // Build message
    let message = `${severityEmoji[alert.severity]} [${alert.severity.toUpperCase()}] ${title}`

    // Add agent name if available
    if (alert.agentName) {
      message += `\nAgent: ${alert.agentName}`
    }

    // Add first 100 chars of message
    const maxMessageLength = 100
    const body = alert.message.length > maxMessageLength
      ? alert.message.substring(0, maxMessageLength - 3) + "..."
      : alert.message

    message += `\n${body}`

    // Add timestamp
    const time = new Date(alert.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
    message += `\n${time}`

    // Add short link to Mission Control
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mission-control.propertyops.ai"
    message += `\n${appUrl}/alerts`

    return message
  }

  /**
   * Send verification code (for 2FA in Forced Confirm modal)
   * 
   * @param phoneNumber - Destination phone number
   * @param code - Verification code (6 digits recommended)
   * @returns Message SID
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error("Twilio not configured")
    }

    const message = `Your Mission Control verification code: ${code}\n\nDo not share this code with anyone. Valid for 5 minutes.`

    // Uncomment when Twilio is installed:
    /*
    const result = await this.client!.messages.create({
      body: message,
      from: this.fromNumber,
      to: phoneNumber,
    })
    return result.sid
    */

    // Stub implementation
    console.log(`[Twilio STUB] Verification code to ${phoneNumber}: ${code}`)
    return `stub-verify-${Date.now()}`
  }

  /**
   * Send bulk SMS to multiple recipients
   * 
   * @param recipients - Array of phone numbers
   * @param message - Message to send
   * @returns Array of message SIDs
   */
  async sendBulkSms(recipients: string[], message: string): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error("Twilio not configured")
    }

    const sendPromises = recipients.map(async (toNumber) => {
      // Uncomment when Twilio is installed:
      /*
      const result = await this.client!.messages.create({
        body: message,
        from: this.fromNumber,
        to: toNumber.trim(),
      })
      return result.sid
      */

      // Stub implementation
      console.log(`[Twilio STUB] Bulk SMS to ${toNumber}: ${message}`)
      return `stub-bulk-${Date.now()}`
    })

    return Promise.all(sendPromises)
  }

  /**
   * Get message delivery status
   * 
   * @param messageSid - Twilio message SID
   * @returns Delivery status
   */
  async getMessageStatus(messageSid: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error("Twilio not configured")
    }

    // Uncomment when Twilio is installed:
    /*
    const message = await this.client!.messages(messageSid).fetch()
    return message.status
    */

    // Stub implementation
    console.log(`[Twilio STUB] Status for ${messageSid}`)
    return "delivered"
  }
}

// Singleton instance
let twilioService: TwilioService | null = null

export function getTwilioService(): TwilioService {
  if (!twilioService) {
    twilioService = new TwilioService()
  }
  return twilioService
}

// Convenience export
export const twilio = getTwilioService()
