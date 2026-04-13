'use client';

/**
 * /landlord/submit — Document intake form for Phase 0B
 * Landlord pastes document text → Laura analyzes → enters review queue
 */

import { DisclaimerFooter } from '@/components/legal/DisclaimerFooter';
import { useState } from 'react';

const DOCUMENT_TYPES = [
  { value: 'paystub', label: 'Pay Stub' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'employment_letter', label: 'Employment Letter' },
  { value: 'id', label: 'Government ID' },
  { value: 'lease', label: 'Lease / Prior Rental History' },
];

export default function SubmitDocumentPage() {
  const [form, setForm] = useState({
    landlordId: '',
    propertyId: '',
    tenantName: '',
    documentType: 'paystub',
    documentText: '',
    submitterEmail: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ reportId?: string; anomalyCount?: number; error?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setResult(null);
    try {
      const res = await fetch('/api/landlord/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setResult({ reportId: data.data.reportId, anomalyCount: data.data.anomalyCount });
        setForm(f => ({ ...f, tenantName: '', documentText: '' }));
      } else {
        setStatus('error');
        setResult({ error: data.error || data.message });
      }
    } catch (err) {
      setStatus('error');
      setResult({ error: err instanceof Error ? err.message : 'Network error' });
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="container mx-auto max-w-2xl flex-1 px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Submit Document for Analysis</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Laura will analyze the document for integrity anomalies. Every report is reviewed by the founder before delivery.
          </p>
        </div>

        {status === 'success' && result && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-800">Document submitted successfully</p>
            <p className="mt-1 text-sm text-green-700">
              Report ID: <code className="font-mono">{result.reportId}</code> &middot;{' '}
              {result.anomalyCount ?? 0} anomaly flag{result.anomalyCount !== 1 ? 's' : ''} detected.
            </p>
            <p className="mt-1 text-sm text-green-600">
              This report is now in the founder review queue. You will be notified once it is reviewed.
            </p>
          </div>
        )}

        {status === 'error' && result?.error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-medium text-red-800">Submission failed</p>
            <p className="mt-1 text-sm text-red-700">{result.error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Landlord ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. landlord-001"
                value={form.landlordId}
                onChange={e => setForm(f => ({ ...f, landlordId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property ID
              </label>
              <input
                type="text"
                placeholder="e.g. prop-001 (optional)"
                value={form.propertyId}
                onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Applicant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Full name as it appears on the application"
              value={form.tenantName}
              onChange={e => setForm(f => ({ ...f, tenantName: e.target.value }))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.documentType}
              onChange={e => setForm(f => ({ ...f, documentType: e.target.value }))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DOCUMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Text <span className="text-red-500">*</span>
              <span className="ml-1 font-normal text-gray-400 dark:text-gray-500">(paste extracted text from the document)</span>
            </label>
            <textarea
              required
              rows={10}
              placeholder="Paste the full text content of the document here. For pay stubs: include all field labels and values. For bank statements: include transaction rows and account details."
              value={form.documentText}
              onChange={e => setForm(f => ({ ...f, documentText: e.target.value }))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Delivery Email
              <span className="ml-1 font-normal text-gray-400 dark:text-gray-500">(where to send the approved report)</span>
            </label>
            <input
              type="email"
              placeholder="landlord@example.com"
              value={form.submitterEmail}
              onChange={e => setForm(f => ({ ...f, submitterEmail: e.target.value }))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {status === 'loading' ? 'Analyzing document…' : 'Submit for Analysis'}
          </button>
        </form>
      </div>
      <DisclaimerFooter />
    </main>
  );
}
