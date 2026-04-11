import { createHash } from "crypto"
import {
  AuditLogEntry,
  AuditLogFilter,
  AuditLogQueryResponse,
  AgentReasoning,
  InputData,
  Outcome,
} from "@/lib/validations/audit"

/**
 * Audit Log Store - Tamper-evident audit logging
 * 
 * Features:
 * - Hash chain for tamper evidence (each entry links to previous)
 * - 36-month minimum retention policy
 * - In-memory store (production should use database)
 * - Automatic compliance checking
 */

interface AuditLogStore {
  entries: Map<string, AuditLogEntry>
  hashChain: string[] // Ordered list of hashes for quick verification
  lastHash: string | null
}

class AuditLogManager {
  private store: AuditLogStore = {
    entries: new Map(),
    hashChain: [],
    lastHash: null,
  }

  private readonly RETENTION_MONTHS = 36
  private readonly HASH_ALGORITHM = "sha256"

  /**
   * Create a new audit log entry with tamper-evident hash chain
   */
  create(entry: Omit<AuditLogEntry, "id" | "hash" | "previousHash" | "signature" | "retentionUntil">): AuditLogEntry {
    const id = crypto.randomUUID()
    const timestamp = entry.timestamp || new Date().toISOString()
    
    // Calculate retention date (36 months from now)
    const retentionUntil = new Date()
    retentionUntil.setMonth(retentionUntil.getMonth() + this.RETENTION_MONTHS)

    // Build entry without hash fields
    const entryData: Omit<AuditLogEntry, "hash" | "previousHash" | "signature"> = {
      ...entry,
      id,
      timestamp,
      retentionUntil: retentionUntil.toISOString(),
    }

    // Generate hash chain
    const previousHash = this.store.lastHash
    const hash = this.generateHash(entryData, previousHash)

    // Complete entry
    const completeEntry: AuditLogEntry = {
      ...entryData,
      hash,
      previousHash,
      // Signature would be generated with private key in production
      // signature: sign(hash, privateKey)
    }

    // Store entry
    this.store.entries.set(id, completeEntry)
    this.store.hashChain.push(hash)
    this.store.lastHash = hash

    console.log(`[Audit] Created entry ${id} (${entry.eventType}) - hash: ${hash.substring(0, 16)}...`)

    return completeEntry
  }

  /**
   * Query audit logs with filtering
   */
  query(filter: AuditLogFilter): AuditLogQueryResponse {
    let entries = Array.from(this.store.entries.values())

    // Apply filters
    if (filter.eventTypes?.length) {
      entries = entries.filter((e) => filter.eventTypes!.includes(e.eventType))
    }

    if (filter.severity) {
      entries = entries.filter((e) => e.severity === filter.severity)
    }

    if (filter.dateFrom) {
      const fromDate = new Date(filter.dateFrom)
      entries = entries.filter((e) => new Date(e.timestamp) >= fromDate)
    }

    if (filter.dateTo) {
      const toDate = new Date(filter.dateTo)
      entries = entries.filter((e) => new Date(e.timestamp) <= toDate)
    }

    if (filter.actorType) {
      entries = entries.filter((e) => e.actor.type === filter.actorType)
    }

    if (filter.actorId) {
      entries = entries.filter((e) => e.actor.id === filter.actorId)
    }

    if (filter.resourceType) {
      entries = entries.filter((e) => e.resource?.type === filter.resourceType)
    }

    if (filter.resourceId) {
      entries = entries.filter((e) => e.resource?.id === filter.resourceId)
    }

    if (filter.propertyId) {
      entries = entries.filter((e) => e.resource?.propertyId === filter.propertyId)
    }

    if (filter.tenantId) {
      entries = entries.filter((e) => e.resource?.tenantId === filter.tenantId)
    }

    if (filter.success !== undefined) {
      entries = entries.filter((e) => e.outcome.success === filter.success)
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      entries = entries.filter((e) =>
        e.eventType.toLowerCase().includes(searchLower) ||
        e.actor.name.toLowerCase().includes(searchLower) ||
        e.resource?.name?.toLowerCase().includes(searchLower) ||
        e.outcome.result?.toLowerCase().includes(searchLower) ||
        e.agentReasoning?.reasoning.toLowerCase().includes(searchLower) ||
        JSON.stringify(e.inputData).toLowerCase().includes(searchLower)
      )
    }

    // Sort
    entries.sort((a, b) => {
      let aVal: any = a[filter.sortBy || "timestamp"]
      let bVal: any = b[filter.sortBy || "timestamp"]

      if (filter.sortBy === "severity") {
        const severityOrder = { info: 0, warning: 1, error: 2, critical: 3 }
        aVal = severityOrder[a.severity]
        bVal = severityOrder[b.severity]
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return filter.sortOrder === "desc" ? -comparison : comparison
    })

    // Pagination
    const total = entries.length
    const totalPages = Math.ceil(total / filter.limit)
    const page = Math.min(filter.page, totalPages) || 1
    const offset = (page - 1) * filter.limit
    const paginatedEntries = entries.slice(offset, offset + filter.limit)

    // Check retention compliance
    const oldestEntry = entries.length > 0
      ? entries.reduce((oldest, e) =>
          new Date(e.timestamp) < new Date(oldest.timestamp) ? e : oldest
        )
      : null

    const complianceStatus = this.checkCompliance()

    return {
      entries: paginatedEntries,
      pagination: {
        page,
        limit: filter.limit,
        total,
        totalPages,
        hasMore: offset + filter.limit < total,
      },
      retention: {
        policy: `${this.RETENTION_MONTHS}-months`,
        minimumRetentionMonths: this.RETENTION_MONTHS,
        oldestEntry: oldestEntry?.timestamp,
        complianceStatus,
      },
    }
  }

  /**
   * Get a single audit log entry by ID
   */
  get(id: string): AuditLogEntry | undefined {
    return this.store.entries.get(id)
  }

  /**
   * Verify hash chain integrity
   * Returns true if chain is unbroken and untampered
   */
  verifyChain(): { valid: boolean; error?: string; brokenAtIndex?: number } {
    const hashes = this.store.hashChain
    const entries = Array.from(this.store.entries.values())

    if (hashes.length === 0) {
      return { valid: true }
    }

    // Sort entries by timestamp to match hash chain order
    const sortedEntries = entries.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    let previousHash: string | undefined = undefined

    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i]
      const expectedHash = this.generateHash(entry, previousHash)

      if (entry.hash !== expectedHash) {
        return {
          valid: false,
          error: `Hash mismatch at entry ${entry.id}`,
          brokenAtIndex: i,
        }
      }

      if (entry.previousHash !== previousHash) {
        return {
          valid: false,
          error: `Previous hash mismatch at entry ${entry.id}`,
          brokenAtIndex: i,
        }
      }

      previousHash = entry.hash
    }

    return { valid: true }
  }

  /**
   * Check retention compliance
   */
  checkCompliance(): "compliant" | "warning" | "violation" {
    const now = new Date()
    const entries = Array.from(this.store.entries.values())

    if (entries.length === 0) {
      return "compliant"
    }

    const oldestEntry = entries.reduce((oldest, e) =>
      new Date(e.timestamp) < new Date(oldest.timestamp) ? e : oldest
    )

    const oldestDate = new Date(oldestEntry.timestamp)
    const retentionDate = new Date(oldestEntry.retentionUntil)

    // Check if we're approaching retention deadline
    const warningThreshold = new Date()
    warningThreshold.setMonth(warningThreshold.getMonth() + this.RETENTION_MONTHS - 1)

    if (retentionDate < now) {
      // Entry should have been retained but might be deleted
      return "violation"
    }

    if (retentionDate < warningThreshold) {
      return "warning"
    }

    return "compliant"
  }

  /**
   * Get entries that are due for deletion (past retention date)
   */
  getEntriesDueForDeletion(): AuditLogEntry[] {
    const now = new Date()
    const entries = Array.from(this.store.entries.values())

    return entries.filter((e) => new Date(e.retentionUntil) < now)
  }

  /**
   * Delete entries past retention date
   * Returns number of entries deleted
   */
  purgeExpiredEntries(): number {
    const expired = this.getEntriesDueForDeletion()
    let deleted = 0

    for (const entry of expired) {
      this.store.entries.delete(entry.id)
      deleted++
    }

    // Rebuild hash chain after deletion
    // Note: In production, you'd want to preserve the chain even after deletion
    // by keeping tombstone entries or using a different structure
    this.rebuildHashChain()

    console.log(`[Audit] Purged ${deleted} expired entries`)
    return deleted
  }

  /**
   * Export audit logs for backup or compliance audit
   */
  export(options?: {
    dateFrom?: string
    dateTo?: string
    includeHashes?: boolean
  }): AuditLogEntry[] {
    let entries = Array.from(this.store.entries.values())

    if (options?.dateFrom) {
      const fromDate = new Date(options.dateFrom)
      entries = entries.filter((e) => new Date(e.timestamp) >= fromDate)
    }

    if (options?.dateTo) {
      const toDate = new Date(options.dateTo)
      entries = entries.filter((e) => new Date(e.timestamp) <= toDate)
    }

    if (!options?.includeHashes) {
      // Remove hash fields for export if not requested
      entries = entries.map((e) => {
        const { hash, previousHash, signature, ...rest } = e
        return rest as Omit<AuditLogEntry, "hash" | "previousHash" | "signature">
      }) as any
    }

    // Sort by timestamp
    entries.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    return entries
  }

  /**
   * Import audit logs (for restoration or migration)
   */
  import(entries: AuditLogEntry[]): { imported: number; errors: string[] } {
    let imported = 0
    const errors: string[] = []

    // Sort by timestamp to maintain chain order
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    let previousHash: string | undefined = undefined

    for (const entry of sortedEntries) {
      try {
        // Verify hash chain
        const expectedHash = this.generateHash(entry, previousHash)
        
        if (entry.hash !== expectedHash) {
          errors.push(`Hash mismatch for entry ${entry.id}`)
          continue
        }

        this.store.entries.set(entry.id, entry)
        this.store.hashChain.push(entry.hash)
        previousHash = entry.hash
        imported++
      } catch (error) {
        errors.push(`Failed to import entry ${entry.id}: ${error}`)
      }
    }

    if (previousHash) {
      this.store.lastHash = previousHash
    }

    console.log(`[Audit] Imported ${imported} entries, ${errors.length} errors`)
    return { imported, errors }
  }

  /**
   * Get statistics about audit logs
   */
  getStats(): {
    totalEntries: number
    entriesByType: Record<string, number>
    entriesBySeverity: Record<string, number>
    entriesByActorType: Record<string, number>
    oldestEntry: string | null
    newestEntry: string | null
    averageEntriesPerDay: number
  } {
    const entries = Array.from(this.store.entries.values())

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        entriesByType: {},
        entriesBySeverity: {},
        entriesByActorType: {},
        oldestEntry: null,
        newestEntry: null,
        averageEntriesPerDay: 0,
      }
    }

    const entriesByType: Record<string, number> = {}
    const entriesBySeverity: Record<string, number> = {}
    const entriesByActorType: Record<string, number> = {}

    let oldestDate = new Date()
    let newestDate = new Date(0)

    for (const entry of entries) {
      // Count by type
      entriesByType[entry.eventType] = (entriesByType[entry.eventType] || 0) + 1

      // Count by severity
      entriesBySeverity[entry.severity] = (entriesBySeverity[entry.severity] || 0) + 1

      // Count by actor type
      entriesByActorType[entry.actor.type] =
        (entriesByActorType[entry.actor.type] || 0) + 1

      // Track date range
      const entryDate = new Date(entry.timestamp)
      if (entryDate < oldestDate) oldestDate = entryDate
      if (entryDate > newestDate) newestDate = entryDate
    }

    // Calculate average entries per day
    const daysDiff =
      (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
    const averageEntriesPerDay = daysDiff > 0 ? entries.length / daysDiff : entries.length

    return {
      totalEntries: entries.length,
      entriesByType,
      entriesBySeverity,
      entriesByActorType,
      oldestEntry: oldestDate.toISOString(),
      newestEntry: newestDate.toISOString(),
      averageEntriesPerDay: Math.round(averageEntriesPerDay * 100) / 100,
    }
  }

  /**
   * Clear all entries (for testing only)
   */
  clear(): void {
    this.store.entries.clear()
    this.store.hashChain = []
    this.store.lastHash = null
  }

  /**
   * Generate hash for an entry
   */
  private generateHash(
    entry: Omit<AuditLogEntry, "hash" | "previousHash" | "signature">,
    previousHash?: string | null
  ): string {
    const hashInput = JSON.stringify({
      ...entry,
      previousHash: previousHash || null,
    })

    return createHash(this.HASH_ALGORITHM).update(hashInput).digest("hex")
  }

  /**
   * Rebuild hash chain from existing entries
   */
  private rebuildHashChain(): void {
    const entries = Array.from(this.store.entries.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    this.store.hashChain = []
    let previousHash: string | undefined = undefined

    for (const entry of entries) {
      const hash = this.generateHash(entry, previousHash)
      this.store.hashChain.push(hash)
      previousHash = hash
    }

    this.store.lastHash = previousHash || null
  }
}

// Singleton instance
let auditLogManager: AuditLogManager | null = null

export function getAuditLogManager(): AuditLogManager {
  if (!auditLogManager) {
    auditLogManager = new AuditLogManager()
  }
  return auditLogManager
}

// Convenience export
export const auditLog = getAuditLogManager()
