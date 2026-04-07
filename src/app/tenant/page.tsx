'use client';

import { useState } from 'react';

type View = 'dashboard' | 'maintenance' | 'status';

export default function TenantDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navItems: { id: View; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'status', label: 'My Status' },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Welcome to Tony Portal
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Maintenance requests and status tracking for your unit.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Requests</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                </div>
              </div>
            </section>
            
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Recent Maintenance
              </h2>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                No recent maintenance requests. Use the Maintenance tab to submit a new request.
              </div>
            </section>
          </div>
        );
      
      case 'maintenance':
        return (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Maintenance Requests
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Submit and track maintenance requests for your unit.
            </p>
            
            {/* New Request Form Placeholder */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Submit New Request
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Issue Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option>Select an issue type...</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Appliance</option>
                    <option>HVAC</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Describe the issue..."
                  />
                </div>
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
                  disabled
                >
                  Submit Request (Coming Soon)
                </button>
              </div>
            </div>
            
            {/* Request History */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Request History
              </h3>
              <div className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                No maintenance requests yet
              </div>
            </div>
          </section>
        );
      
      case 'status':
        return (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              My Unit Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unit</div>
                  <div className="font-medium text-gray-900 dark:text-white">Not assigned</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  —
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Property</div>
                  <div className="font-medium text-gray-900 dark:text-white">Not assigned</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  —
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Lease Status</div>
                  <div className="font-medium text-gray-900 dark:text-white">Not assigned</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  —
                </div>
              </div>
            </div>
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
                  Tony Portal
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Maintenance & Status
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
                <div className="text-gray-900 dark:text-white font-medium">Tenant</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">Unit Access</div>
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
          PropertyOps AI • Tony Portal • Phase 3 RBAC • © {new Date().getFullYear()}
        </div>
      </footer>
    </main>
  );
}
