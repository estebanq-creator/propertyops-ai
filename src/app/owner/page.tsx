'use client';

import { useState } from 'react';
import { SystemMonitor } from '@/components/system-monitor/SystemMonitor';
import { TaskQueue } from '@/components/task-queue/TaskQueue';
import { CronJobs } from '@/components/cron-jobs/CronJobs';
import { AuditLog } from '@/components/audit-log/AuditLog';
import { Notifications } from '@/components/notifications/Notifications';

type View = 'dashboard' | 'tasks' | 'cron' | 'audit' | 'notifications';

export default function OwnerDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navItems: { id: View; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'cron', label: 'Cron Jobs' },
    { id: 'audit', label: 'Audit Log' },
    { id: 'notifications', label: 'Notifications' },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                System Health
              </h2>
              <SystemMonitor />
            </section>
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Task Queue
              </h2>
              <TaskQueue />
            </section>
          </div>
        );
      case 'tasks':
        return (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Task Queue
            </h2>
            <TaskQueue />
          </section>
        );
      case 'cron':
        return (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Cron Jobs
            </h2>
            <CronJobs />
          </section>
        );
      case 'audit':
        return (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Audit Log
            </h2>
            <AuditLog />
          </section>
        );
      case 'notifications':
        return (
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Notifications
            </h2>
            <Notifications />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu - Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              
              {/* Logo/Title */}
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  PropertyOps AI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Owner Dashboard (Mission Control)
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    currentView === item.id
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* User Profile / Status */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm text-right">
                <div className="text-gray-900 dark:text-white font-medium">Owner</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">Full Access</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-md text-sm font-medium transition ${
                    currentView === item.id
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {renderView()}
      </div>

      {/* Footer */}
      <footer className="mt-8 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          PropertyOps AI • Owner Dashboard • Phase 3 RBAC • © {new Date().getFullYear()}
        </div>
      </footer>
    </main>
  );
}
