import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  if (diffInSeconds < 5) return "just now"
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays}d ago`
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
    case "healthy":
    case "connected":
      return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
    case "idle":
    case "warning":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400"
    case "offline":
    case "error":
    case "disconnected":
      return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
  }
}

export function getHealthScoreColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400"
  if (score >= 70) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-600 dark:text-red-400"
}
