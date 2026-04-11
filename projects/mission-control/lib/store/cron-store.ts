import { CronJob, CreateCronJob, UpdateCronJob, CronJobStatus, CronJobResult } from "@/lib/validations/cron"

/**
 * Cron Job Store - In-memory cron job management
 * 
 * Phase 2: Read-only access for visualization
 * Phase 3: Full CRUD operations and execution
 */

interface CronJobStore {
  jobs: Map<string, CronJob>
  executionHistory: Map<string, CronJobResult[]>
}

class CronJobManager {
  private store: CronJobStore = {
    jobs: new Map(),
    executionHistory: new Map(),
  }

  /**
   * Create a new cron job
   */
  create(jobData: CreateCronJob): CronJob {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const job: CronJob = {
      ...jobData,
      id,
      status: "active",
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        consecutiveFailures: 0,
      },
      metadata: {
        ...jobData.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: jobData.metadata?.createdBy || "system",
        version: 1,
      },
    }

    // Calculate next run time
    job.nextRun = this.calculateNextRun(job.schedule)

    this.store.jobs.set(id, job)
    this.store.executionHistory.set(id, [])

    console.log(`[Cron] Created job ${id}: ${job.name}`)
    return job
  }

  /**
   * Update an existing cron job
   */
  update(jobId: string, updates: UpdateCronJob): CronJob | null {
    const job = this.store.jobs.get(jobId)
    if (!job) return null

    const updatedJob: CronJob = {
      ...job,
      ...updates,
      schedule: updates.schedule ? { ...job.schedule, ...updates.schedule } : job.schedule,
      target: updates.target ? { ...job.target, ...updates.target } : job.target,
      config: updates.config ? { ...job.config, ...updates.config } : job.config,
      metadata: {
        ...job.metadata,
        updatedAt: new Date().toISOString(),
        version: (job.metadata?.version || 1) + 1,
      },
    }

    // Recalculate next run if schedule changed
    if (updates.schedule) {
      updatedJob.nextRun = this.calculateNextRun(updatedJob.schedule)
    }

    this.store.jobs.set(jobId, updatedJob)
    console.log(`[Cron] Updated job ${jobId}`)
    return updatedJob
  }

  /**
   * Delete a cron job
   */
  delete(jobId: string): boolean {
    const deleted = this.store.jobs.delete(jobId)
    this.store.executionHistory.delete(jobId)
    
    if (deleted) {
      console.log(`[Cron] Deleted job ${jobId}`)
    }
    
    return deleted
  }

  /**
   * Get a single cron job by ID
   */
  get(jobId: string): CronJob | undefined {
    return this.store.jobs.get(jobId)
  }

  /**
   * List cron jobs with optional filtering
   */
  list(filters?: {
    status?: CronJobStatus
    category?: string
    tag?: string
    search?: string
  }): CronJob[] {
    let jobs = Array.from(this.store.jobs.values())

    if (filters?.status) {
      jobs = jobs.filter((j) => j.status === filters.status)
    }

    if (filters?.category) {
      jobs = jobs.filter((j) => j.metadata?.category === filters.category)
    }

    if (filters?.tag) {
      jobs = jobs.filter((j) => j.metadata?.tags?.includes(filters.tag!))
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      jobs = jobs.filter(
        (j) =>
          j.name.toLowerCase().includes(searchLower) ||
          j.description.toLowerCase().includes(searchLower)
      )
    }

    // Sort by next run time
    jobs.sort((a, b) => {
      if (!a.nextRun && !b.nextRun) return 0
      if (!a.nextRun) return 1
      if (!b.nextRun) return -1
      return new Date(a.nextRun).getTime() - new Date(b.nextRun).getTime()
    })

    return jobs
  }

  /**
   * Update job status
   */
  updateStatus(jobId: string, status: CronJobStatus): CronJob | null {
    const job = this.store.jobs.get(jobId)
    if (!job) return null

    job.status = status
    job.metadata = {
      ...job.metadata,
      updatedAt: new Date().toISOString(),
    }

    console.log(`[Cron] Job ${jobId} status changed to ${status}`)
    return job
  }

  /**
   * Record job execution
   */
  recordExecution(jobId: string, result: CronJobResult): void {
    const job = this.store.jobs.get(jobId)
    if (!job) return

    // Update stats
    job.stats.totalRuns++
    
    if (result.success) {
      job.stats.successfulRuns++
      job.stats.consecutiveFailures = 0
      job.stats.lastSuccess = result.completedAt || result.startedAt
    } else {
      job.stats.failedRuns++
      job.stats.consecutiveFailures++
      job.stats.lastFailure = result.completedAt || result.startedAt
    }

    // Calculate average duration
    if (result.duration) {
      const totalDuration = (job.stats.averageDuration || 0) * (job.stats.totalRuns - 1)
      job.stats.averageDuration = (totalDuration + result.duration) / job.stats.totalRuns
    }

    // Update last run
    job.lastRun = result

    // Update next run
    job.nextRun = this.calculateNextRun(job.schedule)

    // Store in history
    const history = this.store.executionHistory.get(jobId) || []
    history.push(result)
    
    // Keep only last 100 executions
    if (history.length > 100) {
      history.shift()
    }
    this.store.executionHistory.set(jobId, history)

    // Update status based on result
    if (!result.success && job.status === "running") {
      job.status = "failed"
    } else if (job.status === "running") {
      job.status = "active"
    }

    console.log(
      `[Cron] Job ${jobId} execution: ${result.success ? "success" : "failed"} (${result.duration}ms)`
    )
  }

  /**
   * Get execution history for a job
   */
  getExecutionHistory(
    jobId: string,
    options?: {
      limit?: number
      offset?: number
      status?: "success" | "failure" | "all"
    }
  ): CronJobResult[] {
    const history = this.store.executionHistory.get(jobId) || []
    
    let filtered = [...history]
    
    if (options?.status && options.status !== "all") {
      filtered = filtered.filter((r) =>
        options.status === "success" ? r.success : !r.success
      )
    }
    
    const offset = options?.offset || 0
    const limit = options?.limit || 50
    
    return filtered.slice(offset, offset + limit).reverse() // Most recent first
  }

  /**
   * Get aggregate statistics
   */
  getStats(): {
    total: number
    active: number
    paused: number
    disabled: number
    running: number
    failed: number
    totalRuns: number
    successfulRuns: number
    failedRuns: number
    successRate: number
  } {
    const jobs = Array.from(this.store.jobs.values())
    
    return {
      total: jobs.length,
      active: jobs.filter((j) => j.status === "active").length,
      paused: jobs.filter((j) => j.status === "paused").length,
      disabled: jobs.filter((j) => j.status === "disabled").length,
      running: jobs.filter((j) => j.status === "running").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      totalRuns: jobs.reduce((sum, j) => sum + j.stats.totalRuns, 0),
      successfulRuns: jobs.reduce((sum, j) => sum + j.stats.successfulRuns, 0),
      failedRuns: jobs.reduce((sum, j) => sum + j.stats.failedRuns, 0),
      successRate: jobs.reduce((sum, j) => sum + j.stats.totalRuns, 0) > 0
        ? (jobs.reduce((sum, j) => sum + j.stats.successfulRuns, 0) /
            jobs.reduce((sum, j) => sum + j.stats.totalRuns, 0)) * 100
        : 0,
    }
  }

  /**
   * Get jobs due to run (for scheduler)
   */
  getDueJobs(): CronJob[] {
    const now = new Date()
    
    return Array.from(this.store.jobs.values()).filter((job) => {
      if (job.status !== "active") return false
      if (!job.nextRun) return false
      
      const nextRun = new Date(job.nextRun)
      return nextRun <= now
    })
  }

  /**
   * Calculate next run time from schedule
   * Simplified implementation - use cron parser in production
   */
  private calculateNextRun(schedule: CronSchedule): string {
    // For interval-based schedules
    if (schedule.interval) {
      const now = new Date()
      const intervalMs = this.parseInterval(schedule.interval)
      return new Date(now.getTime() + intervalMs).toISOString()
    }

    // For cron expressions, use a proper cron parser in production
    // This is a simplified placeholder
    const now = new Date()
    
    // Parse basic cron expression
    const parts = schedule.expression.split(/\s+/)
    if (parts.length >= 2) {
      const [minute, hour] = parts
      
      const nextRun = new Date(now)
      
      // Set hour
      if (hour !== "*") {
        nextRun.setHours(parseInt(hour))
      }
      
      // Set minute
      if (minute !== "*") {
        nextRun.setMinutes(parseInt(minute))
      }
      
      // If already passed, add a day
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
      
      return nextRun.toISOString()
    }

    // Default: 1 hour from now
    return new Date(now.getTime() + 3600000).toISOString()
  }

  /**
   * Parse ISO 8601 duration to milliseconds
   */
  private parseInterval(interval: string): number {
    const match = interval.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return 3600000 // Default 1 hour

    const hours = parseInt(match[1] || "0")
    const minutes = parseInt(match[2] || "0")
    const seconds = parseInt(match[3] || "0")

    return hours * 3600000 + minutes * 60000 + seconds * 1000
  }

  /**
   * Clear all jobs (for testing)
   */
  clear(): void {
    this.store.jobs.clear()
    this.store.executionHistory.clear()
  }

  /**
   * Export jobs for backup
   */
  export(): CronJob[] {
    return Array.from(this.store.jobs.values())
  }

  /**
   * Import jobs from backup
   */
  import(jobs: CronJob[]): void {
    for (const job of jobs) {
      this.store.jobs.set(job.id, job)
      this.store.executionHistory.set(job.id, [])
    }
  }
}

// Singleton instance
let cronJobManager: CronJobManager | null = null

export function getCronJobManager(): CronJobManager {
  if (!cronJobManager) {
    cronJobManager = new CronJobManager()
  }
  return cronJobManager
}

// Convenience export
export const cronManager = getCronJobManager()
