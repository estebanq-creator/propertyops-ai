import { NextRequest, NextResponse } from "next/server"
import { validateAuditLogFilter, validateAuditLogEntry } from "@/lib/validations/audit"
import { auditLog } from "@/lib/store/audit-store"

/**
 * GET /api/audit
 * 
 * Query audit logs with filtering, pagination, and sorting
 * Used by the AuditLogViewer component
 * 
 * Query Parameters:
 * - eventTypes: comma-separated list of event types
 * - severity: info|warning|error|critical
 * - dateFrom: ISO8601 datetime
 * - dateTo: ISO8601 datetime
 * - actorType: human|agent|system|api
 * - actorId: string
 * - resourceType: string
 * - resourceId: string
 * - success: true|false
 * - search: string (searches across all fields)
 * - page: number (default: 1)
 * - limit: number (default: 50, max: 100)
 * - sortBy: timestamp|severity|eventType (default: timestamp)
 * - sortOrder: asc|desc (default: desc)
 * 
 * Response:
 * {
 *   entries: AuditLogEntry[],
 *   pagination: { page, limit, total, totalPages, hasMore },
 *   retention: { policy, minimumRetentionMonths, oldestEntry, complianceStatus }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const filterData: Record<string, unknown> = {}

    // Event types
    const eventTypes = searchParams.get("eventTypes")
    if (eventTypes) {
      filterData.eventTypes = eventTypes.split(",")
    }

    // Severity
    const severity = searchParams.get("severity")
    if (severity) {
      filterData.severity = severity
    }

    // Date range
    const dateFrom = searchParams.get("dateFrom")
    if (dateFrom) {
      filterData.dateFrom = dateFrom
    }
    const dateTo = searchParams.get("dateTo")
    if (dateTo) {
      filterData.dateTo = dateTo
    }

    // Actor filters
    const actorType = searchParams.get("actorType")
    if (actorType) {
      filterData.actorType = actorType
    }
    const actorId = searchParams.get("actorId")
    if (actorId) {
      filterData.actorId = actorId
    }

    // Resource filters
    const resourceType = searchParams.get("resourceType")
    if (resourceType) {
      filterData.resourceType = resourceType
    }
    const resourceId = searchParams.get("resourceId")
    if (resourceId) {
      filterData.resourceId = resourceId
    }
    const propertyId = searchParams.get("propertyId")
    if (propertyId) {
      filterData.propertyId = propertyId
    }
    const tenantId = searchParams.get("tenantId")
    if (tenantId) {
      filterData.tenantId = tenantId
    }

    // Outcome filter
    const success = searchParams.get("success")
    if (success !== null) {
      filterData.success = success === "true"
    }

    // Search
    const search = searchParams.get("search")
    if (search) {
      filterData.search = search
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    filterData.page = page
    filterData.limit = Math.min(limit, 100)

    // Sorting
    const sortBy = searchParams.get("sortBy")
    if (sortBy && ["timestamp", "severity", "eventType"].includes(sortBy)) {
      filterData.sortBy = sortBy
    }
    const sortOrder = searchParams.get("sortOrder")
    if (sortOrder && ["asc", "desc"].includes(sortOrder)) {
      filterData.sortOrder = sortOrder
    }

    // Validate filter
    const validation = validateAuditLogFilter(filterData)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid filter parameters",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const filter = validation.data

    // Query audit logs
    const result = auditLog.query(filter)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[Audit] Error:", error)

    return NextResponse.json(
      {
        error: "Failed to query audit logs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/audit
 * 
 * Create a new audit log entry
 * Called internally by the system when events occur
 * 
 * Request: AuditLogEntry (without id, hash, previousHash, signature)
 * Response: Created audit log entry with hash chain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate entry
    const validation = validateAuditLogEntry(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid audit log entry",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    // Create entry with hash chain
    const entry = auditLog.create(validation.data)

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error("[Audit] Error:", error)

    return NextResponse.json(
      {
        error: "Failed to create audit log entry",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
