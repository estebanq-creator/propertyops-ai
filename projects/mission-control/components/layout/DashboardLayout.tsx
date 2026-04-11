"use client"

import * as React from "react"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          collapsed={false}
          onToggle={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <TopNav
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          showMenuButton={true}
        />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
