"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Flag,
  User,
  AlertTriangle,
  Info,
} from "lucide-react"

interface BulkOperationsBarProps {
  selectedCount: number
  canBulkApproveCount: number
  onBulkApprove: (comment?: string) => Promise<void>
  onBulkReject: (comment: string) => Promise<void>
  onClearSelection: () => void
  maxBulkCount: number
}

/**
 * BulkOperationsBar - Action bar for bulk task operations
 * 
 * Features:
 * - Shows count of selected tasks
 * - Bulk approve/reject actions
 * - Warning when some selected tasks cannot be bulk-approved
 * - Keyboard shortcuts (Ctrl+A to select all, Esc to clear)
 */
export function BulkOperationsBar({
  selectedCount,
  canBulkApproveCount,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  maxBulkCount,
}: BulkOperationsBarProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectionComment, setRejectionComment] = useState("")

  const hasNonBulkApprovable = selectedCount > canBulkApproveCount

  const handleBulkApprove = async () => {
    if (canBulkApproveCount === 0) return
    
    setIsApproving(true)
    try {
      await onBulkApprove()
    } catch (error) {
      console.error("Bulk approval failed:", error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleBulkReject = async () => {
    if (!rejectionComment.trim()) return

    setIsRejecting(true)
    try {
      await onBulkReject(rejectionComment)
    } catch (error) {
      console.error("Bulk rejection failed:", error)
    } finally {
      setIsRejecting(false)
    }
  }

  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
      role="region"
      aria-label="Bulk operations"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-medium">
              {selectedCount} task{selectedCount !== 1 ? "s" : ""} selected
            </p>
            {hasNonBulkApprovable && (
              <p className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                <AlertTriangle size={12} />
                {selectedCount - canBulkApproveCount} task(s) require individual review
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showRejectInput ? (
            <>
              <input
                type="text"
                placeholder="Reason for bulk rejection"
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                className="flex h-10 w-64 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && rejectionComment.trim()) {
                    handleBulkReject()
                  }
                  if (e.key === "Escape") {
                    setShowRejectInput(false)
                    setRejectionComment("")
                  }
                }}
              />
              <Button
                onClick={handleBulkReject}
                disabled={!rejectionComment.trim() || isRejecting}
                variant="destructive"
                size="sm"
              >
                {isRejecting ? "Rejecting..." : "Confirm"}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectInput(false)
                  setRejectionComment("")
                }}
                variant="ghost"
                size="sm"
                disabled={isRejecting}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              {canBulkApproveCount > 0 && (
                <Button
                  onClick={handleBulkApprove}
                  disabled={isApproving || canBulkApproveCount === 0}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  {isApproving ? (
                    <>
                      <CheckCircle2 size={16} className="mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className="mr-2" />
                      Approve {canBulkApproveCount > 0 && `(${canBulkApproveCount})`}
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={() => setShowRejectInput(true)}
                variant="outline"
                disabled={isApproving || isRejecting}
                size="sm"
              >
                <XCircle size={16} className="mr-2" />
                Reject
              </Button>
              <Button
                onClick={onClearSelection}
                variant="ghost"
                size="sm"
                disabled={isApproving || isRejecting}
              >
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Max count warning */}
      {selectedCount > maxBulkCount && (
        <div className="mx-auto mt-2 flex max-w-7xl items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
          <Info size={12} />
          <span>
            Maximum {maxBulkCount} tasks can be processed at once. Please reduce your selection.
          </span>
        </div>
      )}
    </div>
  )
}
