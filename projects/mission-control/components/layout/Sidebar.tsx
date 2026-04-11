"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  FileText,
  Terminal,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Agents", href: "/agents", icon: Users, badge: 3 },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Review Inbox", href: "/review-inbox", icon: FileText, badge: 5 },
  { name: "Review Queue", href: "/review-queue", icon: FileText, badge: 5 },
  { name: "Logs", href: "/logs", icon: Terminal },
  { name: "Documentation", href: "/docs", icon: FileText },
  { name: "Security", href: "/security", icon: Shield },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <span className="text-lg font-bold text-foreground">
            Mission Control
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3" role="navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon size={20} aria-hidden="true" />
              {!collapsed && <span>{item.name}</span>}
              {!collapsed && item.badge && (
                <span
                  className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs"
                  aria-label={`${item.badge} items`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div
          className={cn(
            "rounded-md bg-muted p-3",
            collapsed && "px-2"
          )}
        >
          {!collapsed ? (
            <>
              <p className="text-xs font-medium text-muted-foreground">
                System Status
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">
                  All systems operational
                </span>
              </div>
            </>
          ) : (
            <span className="relative flex h-2 w-2 justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
          )}
        </div>
      </div>
    </aside>
  )
}
