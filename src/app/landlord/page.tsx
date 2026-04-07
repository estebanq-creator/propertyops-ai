'use client';

import { useState } from 'react';

type View = 'dashboard' | 'documents' | 'properties';

export default function LandlordDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const navItems: { id: View; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'documents', label: 'Document Reports' },
    { id: 'properties', label: 'My Properties' },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Welcome to Laura Portal
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Forensic Document Integrity Reports for your properties.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Properties</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Documents Reviewed</div>
                </div>
              </div>
            </section>
            
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Recent Activity
              </h2>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                No recent activity. Document reports will appear here when tenant onboarding documents are uploaded.
              </div>
            </section>
          </div>
        );
      
      case 'documents':
        return (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Forensic Document Integrity Reports
            </h2>
            <div className="text-gray-500 dark:text-gray-400">
              <p className="mb-4">
                Laura analyzes tenant onboarding documents for anomalies and integrity issues.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Laura provides forensic analysis only — no scoring or screening recommendations. 
                  All anomaly flags require human review.
                </p>
              </div>
              <div className="mt-6 text-center py-8">
                <div className="text-gray-400 dark:text-gray-500">
                  No documents pending review
                </div>
              </div>
            </div>
          </section>
        );
      
      case 'properties':
        return (
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              My Properties
            </h2>
            <div className="text-gray-500 dark:text-gray-400">
              Properties you manage will appear here.
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
                  Laura Portal
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Forensic Document Integrity
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
                <div className="text-gray-900 dark:text-white font-medium">Landlord</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">Property Access</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
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
          PropertyOps AI • Laura Portal • Phase 3 RBAC • © {new Date().getFullYear()}
        </div>
      </footer>
    </main>
  );
}
