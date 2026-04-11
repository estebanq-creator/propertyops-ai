"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Task, TaskAction } from "@/types/task"
import { cn } from "@/lib/utils"
import {
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react"

interface DraftingAgentApprovalModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onApprove: (task: Task, comment?: string) => Promise<void>
  onReject: (task: Task, comment: string) => Promise<void>
}

/**
 * DraftingAgentApprovalModal - One-click approval for low-stakes tasks
 * 
 * Features:
 * - Streamlined UI for quick approvals
 * - Auto-approval countdown (optional)
 * - Clear summary of what will happen
 * - Minimal friction for routine tasks
 */
export function DraftingAgentApprovalModal({
  task,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: DraftingAgentApprovalModalProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectionComment, setRejectionComment] = useState("")
  const [autoApproveCountdown, setAutoApproveCountdown] = useState<number | null>(null)

  // Auto-approval countdown for drafting agent tasks
  useEffect(() => {
    if (isOpen && task?.approvalLevel === "drafting") {
      // Set countdown to 10 seconds
      setAutoApproveCountdown(10)
      
      const interval = setInterval(() => {
        setAutoApproveCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            return null
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isOpen, task?.approvalLevel])

  // Auto-approve when countdown reaches zero
  useEffect(() => {
    if (autoApproveCountdown === 0 && task) {
      handleApprove()
    }
  }, [autoApproveCountdown, task])

  const handleApprove = async () => {
    if (!task) return
    
    setIsApproving(true)
    try {
      await onApprove(task)
      handleClose()
    } catch (error) {
      console.error("Approval failed:", error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!task) return
    
    if (!rejectionComment.trim()) {
      return
    }

    setIsRejecting(true)
    try {
      await onReject(task, rejectionComment)
      handleClose()
    } catch (error) {
      console.error("Rejection failed:", error)
    } finally {
      setIsRejecting(false)
    }
  }

  const handleClose = () => {
    setRejectionComment("")
    setShowRejectInput(false)
    setAutoApproveCountdown(null)
    onClose()
  }

  // Memoize action summary
  const actionSummary = useMemo(() => {
    if (!task?.actions?.length) return null

    const primaryAction = task.actions[0]
    return (
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ArrowRight size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium">Action to be taken:</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {primaryAction.description}
            </p>
            {primaryAction.estimatedImpact && (
              <p className="mt-2 text-xs text-muted-foreground">
                <TrendingUp size={12} className="inline mr-1" />
                {primaryAction.estimatedImpact}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }, [task?.actions])

  // Memoize metadata display
  const metadataDisplay = useMemo(() => {
    if (!task?.metadata) return null

    const items = []
    
    if (task.metadata.amount) {
      items.push(
        <div key="amount" className="flex items-center gap-2">
          <DollarSign size={14} className="text-muted-foreground" />
          <span className="text-sm">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: task.metadata.currency || "USD",
            }).format(task.metadata.amount)}
          </span>
        </div>
      )
    }

    if (task.metadata.dueDate) {
      items.push(
        <div key="dueDate" className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <span className="text-sm">
            Due: {new Date(task.metadata.dueDate).toLocaleDateString()}
          </span>
        </div>
      )
    }

    if (task.metadata.propertyName) {
      items.push(
        <div key="property" className="flex items-center gap-2">
          <FileText size={14} className="text-muted-foreground" />
          <span className="text-sm">{task.metadata.propertyName}</span>
        </div>
      )
    }

    if (items.length === 0) return null

    return (
      <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
        {items}
      </div>
    )
  }, [task?.metadata])

  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Zap size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                Quick Approval Required
                <Badge variant="secondary" className="text-xs">
                  Drafting Agent
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Low-stakes task ready for one-click approval
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Task Info */}
          <div>
            <h3 className="font-semibold">{task.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {task.description}
            </p>
          </div>

          {/* Metadata */}
          {metadataDisplay}

          {/* Action Summary */}
          {actionSummary}

          {/* Auto-approve countdown */}
          {autoApproveCountdown !== null && autoApproveCountdown > 0 && (
            <div
              className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-800 dark:bg-yellow-900/20"
              role="status"
              aria-live="polite"
            >
              <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-200">
                Auto-approving in{" "}
                <span className="font-semibold">{autoApproveCountdown}</span>{" "}
                seconds
              </span>
            </div>
          )}

          {/* Risk indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle size={14} />
            <span>
              Risk level:{" "}
              <span className="font-medium text-green-600 dark:text-green-400">
                Low
              </span>{" "}
              · Reversible action
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {showRejectInput ? (
            <>
              <input
                type="text"
                placeholder="Reason for rejection (required)"
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && rejectionComment.trim()) {
                    handleReject()
                  }
                  if (e.key === "Escape") {
                    setShowRejectInput(false)
                  }
                }}
              />
              <Button
                onClick={handleReject}
                disabled={!rejectionComment.trim() || isRejecting}
                variant="destructive"
              >
                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
              </Button>
              <Button
                onClick={() => setShowRejectInput(false)}
                variant="ghost"
                disabled={isRejecting}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setShowRejectInput(true)}
                variant="outline"
                disabled={isApproving}
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isApproving ? (
                  <>
                    <CheckCircle2 size={16} className="mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
