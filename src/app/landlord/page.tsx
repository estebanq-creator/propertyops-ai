'use client';

import { useState, useEffect } from 'react';
import { DisclaimerFooter, CompactDisclaimer } from '@/components/legal/DisclaimerFooter';

interface ForensicReport {
  id: string;
  propertyId: string;
  tenantName: string;
  documentType: string;
  anomalies: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    evidence: string;
    location: string;
  }[];
  createdAt: string;
  reviewedAt?: string;
}

type View = 'dashboard' | 'documents' | 'properties';

export default function LandlordDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ForensicReport[]>([]);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/landlord/reports');
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

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
              <CompactDisclaimer />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Forensic Document Integrity Reports for your properties.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {meta?.reviewGate?.validated || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Reports Validated</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {reports.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Approved Reports</div>
                </div>
              </div>
              {meta?.reviewGate && (
                <div className="mt-4">
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Review Gate Progress</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {meta.reviewGate.validated} / {meta.reviewGate.totalRequired}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(meta.reviewGate.validated / meta.reviewGate.totalRequired) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </section>
            
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Recent Activity
              </h2>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                {reports.length > 0 ? (
                  <p>{reports.length} approved report(s) available for review.</p>
                ) : (
                  <p>No approved reports yet. Documents are being reviewed by Mission Control.</p>
                )}
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
            <CompactDisclaimer />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Laura analyzes tenant onboarding documents for anomalies and integrity issues.
              All reports below have been validated by Mission Control.
            </p>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="mt-6 text-center py-8">
                <div className="text-gray-400 dark:text-gray-500">
                  No approved reports yet
                </div>
                <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
                  Documents uploaded for your properties will appear here after review.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {report.tenantName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {report.documentType} • Property: {report.propertyId}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {report.anomalies.length > 0 ? (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Anomaly Flags:
                        </p>
                        <div className="space-y-2">
                          {report.anomalies.map((anomaly, idx) => (
                            <div
                              key={idx}
                              className={`text-xs p-2 rounded ${
                                anomaly.severity === 'high'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  : anomaly.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}
                            >
                              <span className="font-semibold capitalize">{anomaly.severity}</span>
                              {' • '}{anomaly.type}
                              <p className="mt-1 text-gray-700 dark:text-gray-300">
                                {anomaly.evidence}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 rounded">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            ✓ No anomalies detected - Document integrity verified
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        View Full Report →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
      <DisclaimerFooter />
    </main>
  );
}
