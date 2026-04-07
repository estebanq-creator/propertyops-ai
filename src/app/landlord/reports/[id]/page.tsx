'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function ReportDetail() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, [params.id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Fetch all reports and find the matching one
      // In production: GET /api/landlord/reports/[id]
      const response = await fetch('/api/landlord/reports');
      const data = await response.json();
      if (data.success) {
        const foundReport = data.data.find((r: ForensicReport) => r.id === params.id);
        if (foundReport) {
          setReport(foundReport);
        } else {
          setError('Report not found');
        }
      } else {
        setError(data.error || 'Failed to load report');
      }
    } catch (err) {
      setError('Network error - unable to load report');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-l-4 border-red-500';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-l-4 border-yellow-500';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-l-4 border-blue-500';
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
            <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
          </div>
        </div>
        <DisclaimerFooter />
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 text-xl mb-2">Error</div>
            <p className="text-gray-600 dark:text-gray-400">{error || 'Report not found'}</p>
            <button
              onClick={() => router.push('/landlord')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <DisclaimerFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Reports
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Report ID: {report.id}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 flex-1">
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          {/* Report Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Document Integrity Report
            </h1>
            <CompactDisclaimer />
          </div>

          {/* Report Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tenant Name</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {report.tenantName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Document Type</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {getDocumentTypeLabel(report.documentType)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Property</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {report.propertyId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Report Date</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Review Status */}
          {report.reviewedAt && (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded mb-6">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ <strong>Validated by Mission Control</strong>
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Reviewed on {new Date(report.reviewedAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* Anomaly Analysis */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Forensic Analysis Results
            </h2>

            {report.anomalies.length === 0 ? (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-6 rounded">
                <p className="text-green-800 dark:text-green-200 font-medium mb-2">
                  ✓ No Anomalies Detected
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  This document passed all forensic integrity checks. No alterations, 
                  inconsistencies, or suspicious patterns were detected during analysis.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  The following anomalies were detected during forensic analysis. 
                  Each flag includes evidence citations for human review.
                </p>
                {report.anomalies.map((anomaly, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded ${getSeverityColor(anomaly.severity)}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold capitalize">{anomaly.severity}</span>
                      <span className="text-gray-600 dark:text-gray-400">•</span>
                      <span className="font-semibold">{anomaly.type}</span>
                    </div>
                    <div className="mb-2">
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Evidence:
                      </p>
                      <p className="text-gray-800 dark:text-gray-200">
                        {anomaly.evidence}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location:
                      </p>
                      <p className="text-gray-800 dark:text-gray-200">
                        {anomaly.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compliance Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
              ⚖️ Important Compliance Notice
            </h3>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
              <li>• This is a forensic analysis report ONLY — not a tenant screening decision</li>
              <li>• No scores, grades, or pass/fail verdicts are provided</li>
              <li>• All anomalies require human review before any housing decision</li>
              <li>• This report does not constitute legal or eviction advice</li>
              <li>• Fair Housing Act compliance is required for all uses</li>
            </ul>
          </div>
        </section>
      </div>

      <DisclaimerFooter />
    </main>
  );
}
