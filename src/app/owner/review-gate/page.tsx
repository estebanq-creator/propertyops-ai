'use client';

import { useState, useEffect } from 'react';
import { DisclaimerFooter, CompactDisclaimer } from '@/components/legal/DisclaimerFooter';

interface ForensicReport {
  id: string;
  landlordId: string;
  propertyId: string;
  tenantName: string;
  documentType: 'lease' | 'id' | 'paystub' | 'bank_statement' | 'employment_letter';
  status: 'pending_review' | 'approved' | 'rejected';
  anomalies: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    evidence: string;
    location: string;
  }[];
  createdAt: string;
}

interface ReviewQueueResponse {
  success: boolean;
  data: ForensicReport[];
  meta: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    reviewGate: {
      totalRequired: number;
      validated: number;
      remaining: number;
      bypassEnabled: boolean;
      percentComplete: number;
    };
    compliance: {
      forensicOnly: boolean;
      noScoring: boolean;
      auditTrailRequired: boolean;
    };
  };
}

export default function ReviewGate() {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<ReviewQueueResponse | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/landlord/review-queue');
      const data = await response.json();
      if (data.success) {
        setQueue(data);
      } else {
        setError(data.error || 'Failed to load review queue');
      }
    } catch (err) {
      setError('Network error - unable to load review queue');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId: string) => {
    setProcessing(reportId);
    try {
      const response = await fetch(`/api/landlord/reports/${reportId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        // Refresh queue
        await fetchReviewQueue();
      } else {
        setError(data.error || 'Failed to approve report');
      }
    } catch (err) {
      setError('Network error - unable to approve report');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (reportId: string, reason?: string) => {
    setProcessing(reportId);
    try {
      const response = await fetch(`/api/landlord/reports/${reportId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'Not specified' }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchReviewQueue();
      } else {
        setError(data.error || 'Failed to reject report');
      }
    } catch (err) {
      setError('Network error - unable to reject report');
    } finally {
      setProcessing(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      lease: 'Lease Agreement',
      id: 'Government ID',
      paystub: 'Pay Stub',
      bank_statement: 'Bank Statement',
      employment_letter: 'Employment Letter',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading review queue...</p>
          </div>
        </div>
        <DisclaimerFooter />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-xl mb-2">Error</div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={fetchReviewQueue}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
        <DisclaimerFooter />
      </main>
    );
  }

  const reviewGate = queue?.meta.reviewGate;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Review Gate - Mission Control
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Forensic Report Validation (First 50 Reports)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-right">
                <div className="text-gray-900 dark:text-white font-medium">Owner</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">Mission Control</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Review Gate Progress */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Review Gate Progress
          </h2>
          
          {reviewGate && (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Validated: {reviewGate.validated} / {reviewGate.totalRequired}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {reviewGate.percentComplete}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      reviewGate.bypassEnabled
                        ? 'bg-green-600'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${reviewGate.percentComplete}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {queue?.meta.pending || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pending Review</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {queue?.meta.approved || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {queue?.meta.rejected || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {reviewGate.remaining}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                </div>
              </div>

              {/* Bypass Notice */}
              {reviewGate.bypassEnabled && (
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✅ <strong>Review gate complete:</strong> 50 reports validated. 
                    Bypass mode is now available for subsequent reports.
                  </p>
                </div>
              )}

              <CompactDisclaimer />
            </div>
          )}
        </section>

        {/* Review Queue */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Pending Reports
          </h2>

          {queue?.data.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No pending reports in the review queue.</p>
              <p className="text-sm mt-2">All reports have been validated.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue?.data.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
                >
                  {/* Report Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {report.tenantName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getDocumentTypeLabel(report.documentType)} • {report.landlordId}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Anomalies */}
                  {report.anomalies.length > 0 ? (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Anomaly Flags:
                      </p>
                      <div className="space-y-2">
                        {report.anomalies.map((anomaly, idx) => (
                          <div
                            key={idx}
                            className={`text-xs p-2 rounded ${getSeverityColor(anomaly.severity)}`}
                          >
                            <span className="font-semibold capitalize">{anomaly.severity}</span>
                            {' • '}{anomaly.type}
                            <p className="mt-1 text-gray-700 dark:text-gray-300">
                              {anomaly.evidence}
                            </p>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                              Location: {anomaly.location}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 rounded">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          ✓ No anomalies detected - Document integrity verified
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(report.id)}
                      disabled={processing === report.id}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {processing === report.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(report.id)}
                      disabled={processing === report.id}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {processing === report.id ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => {/* View full report */}}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <DisclaimerFooter />
    </main>
  );
}
