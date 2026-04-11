"use client"

import * as React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
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
  Shield,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  Signature,
  Key,
  Lock,
  AlertCircle,
  Info,
} from "lucide-react"

interface ForcedConfirmModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onApprove: (task: Task, comment?: string, signature?: string) => Promise<void>
  onReject: (task: Task, comment: string) => Promise<void>
  minViewSeconds: number
  requireSignature: boolean
  requireTwoFactor: boolean
  onVerifyTwoFactor?: () => Promise<boolean>
}

/**
 * ForcedConfirmModal - Safety-critical task approval with forced read-and-confirm
 * 
 * Features:
 * - Minimum view time before approval enabled
 * - Explicit acknowledgment checkboxes
 * - Digital signature capture (if required)
 * - Two-factor authentication (if required)
 * - Clear risk communication
 * - No bulk approval allowed
 */
export function ForcedConfirmModal({
  task,
  isOpen,
  onClose,
  onApprove,
  onReject,
  minViewSeconds,
  requireSignature,
  requireTwoFactor,
  onVerifyTwoFactor,
}: ForcedConfirmModalProps) {
  const [viewStartTime, setViewStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [canApprove, setCanApprove] = useState(false)
  const [hasReadDetails, setHasReadDetails] = useState(false)
  const [hasUnderstoodRisk, setHasUnderstoodRisk] = useState(false)
  const [signature, setSignature] = useState("")
  const [twoFactorVerified, setTwoFactorVerified] = useState(false)
  const [isVerifying2FA, setIsVerifying2FA] = useState(false)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectionComment, setRejectionComment] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewStartTime(Date.now())
      setElapsedTime(0)
      setCanApprove(false)
      setHasReadDetails(false)
      setHasUnderstoodRisk(false)
      setSignature("")
      setTwoFactorVerified(false)
      setShowRejectInput(false)
      setRejectionComment("")

      // Start elapsed time counter
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const elapsed = (Date.now() - (viewStartTime || Date.now())) / 1000
          if (elapsed >= minViewSeconds) {
            setCanApprove(true)
            if (timerRef.current) {
              clearInterval(timerRef.current)
            }
            return minViewSeconds
          }
          return elapsed
        })
      }, 100)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [isOpen, minViewSeconds, viewStartTime])

  const handleApprove = async () => {
    if (!task || !canApprove) return
    if (!hasReadDetails || !hasUnderstoodRisk) return
    if (requireSignature && !signature.trim()) return
    if (requireTwoFactor && !twoFactorVerified) return

    setIsApproving(true)
    try {
      await onApprove(task, undefined, signature.trim() || undefined)
      handleClose()
    } catch (error) {
      console.error("Approval failed:", error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!task) return
    if (!rejectionComment.trim()) return

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

  const handleVerifyTwoFactor = async () => {
    if (!onVerifyTwoFactor) return
    
    setIsVerifying2FA(true)
    try {
      const verified = await onVerifyTwoFactor()
      setTwoFactorVerified(verified)
    } catch (error) {
      console.error("2FA verification failed:", error)
    } finally {
      setIsVerifying2FA(false)
    }
  }

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setViewStartTime(null)
    setElapsedTime(0)
    setCanApprove(false)
    setHasReadDetails(false)
    setHasUnderstoodRisk(false)
    setSignature("")
    setTwoFactorVerified(false)
    setShowRejectInput(false)
    setRejectionComment("")
    onClose()
  }

  // Progress percentage for countdown
  const progressPercent = Math.min((elapsedTime / minViewSeconds) * 100, 100)

  // All requirements met for approval
  const allRequirementsMet = useMemo(() => {
    if (!canApprove) return false
    if (!hasReadDetails || !hasUnderstoodRisk) return false
    if (requireSignature && !signature.trim()) return false
    if (requireTwoFactor && !twoFactorVerified) return false
    return true
  }, [canApprove, hasReadDetails, hasUnderstoodRisk, requireSignature, signature, requireTwoFactor, twoFactorVerified])

  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <ShieldAlert size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2">
                Safety Review Required
                <Badge variant="destructive" className="text-xs">
                  Forced Confirm
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Critical action requires explicit review and confirmation
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Banner */}
          <div
            className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 text-red-600 dark:text-red-400" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-200">
                  Safety-Critical Action
                </h4>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  This action {task.metadata.tenantName ? `affects tenant "${task.metadata.tenantName}"` : "has significant impact"} and requires careful review before approval.
                </p>
              </div>
            </div>
          </div>

          {/* Task Details */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">{task.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {task.description}
            </p>
            
            {task.actions.map((action) => (
              <div key={action.id} className="mt-3 rounded-md border bg-muted/50 p-3">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-muted-foreground" />
                  <span className="text-sm font-medium">{action.type}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
                {action.riskLevel === "critical" && (
                  <Badge variant="destructive" className="mt-2">
                    Critical Risk
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* Countdown Timer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-muted-foreground" />
                <span>Review time required</span>
              </div>
              <span className={cn(
                "font-medium",
                canApprove ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              )}>
                {canApprove ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    Ready to approve
                  </span>
                ) : (
                  `${Math.ceil(minViewSeconds - elapsedTime)}s remaining`
                )}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all duration-100",
                  canApprove ? "bg-green-500" : "bg-yellow-500"
                )}
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Review progress"
              />
            </div>
          </div>

          {/* Acknowledgment Checkboxes */}
          <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={hasReadDetails}
                onChange={(e) => setHasReadDetails(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm">
                I have carefully reviewed all details of this action
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={hasUnderstoodRisk}
                onChange={(e) => setHasUnderstoodRisk(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm">
                I understand the potential risks and consequences of this action
              </span>
            </label>
          </div>

          {/* Signature Field (if required) */}
          {requireSignature && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Digital Signature <span className="text-red-600">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Signature size={16} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Type your full legal name"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  disabled={!canApprove || !hasReadDetails || !hasUnderstoodRisk}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This signature will be legally binding and recorded in the audit log
              </p>
            </div>
          )}

          {/* Two-Factor Authentication (if required) */}
          {requireTwoFactor && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Two-Factor Authentication</span>
                </div>
                {twoFactorVerified && (
                  <Badge variant="success">
                    <CheckCircle2 size={12} className="mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleVerifyTwoFactor}
                variant="outline"
                disabled={twoFactorVerified || isVerifying2FA || !canApprove}
                className="w-full"
              >
                {twoFactorVerified ? (
                  <>
                    <CheckCircle2 size={16} className="mr-2" />
                    2FA Verified
                  </>
                ) : isVerifying2FA ? (
                  "Verifying..."
                ) : (
                  <>
                    <Lock size={16} className="mr-2" />
                    Verify with 2FA
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Info Note */}
          <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
            <Info size={14} className="mt-0.5 shrink-0" />
            <p>
              This approval cannot be undone. A complete audit trail including timestamp, 
              IP address, and user agent will be recorded.
            </p>
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
                disabled={!allRequirementsMet || isApproving}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isApproving ? (
                  <>
                    <CheckCircle2 size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield size={16} className="mr-2" />
                    Confirm & Approve
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
