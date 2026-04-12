'use client';

import { useEffect, useMemo, useState } from 'react';
import { TenantMessage } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

function statusClasses(status: TenantMessage['status']) {
  switch (status) {
    case 'submitted':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
}

export function TenantMessagesPanel() {
  const [messages, setMessages] = useState<TenantMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<'draft' | 'submit' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    subject: '',
    propertyLabel: '',
    unitLabel: '',
    body: '',
  });

  const submittedCount = useMemo(
    () => messages.filter((message) => message.status === 'submitted').length,
    [messages]
  );
  const approvedCount = useMemo(
    () => messages.filter((message) => message.status === 'approved').length,
    [messages]
  );

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tenant/messages', { cache: 'no-store' });
      const data = (await response.json()) as ApiResponse<TenantMessage[]>;

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load maintenance drafts');
      }

      setMessages(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const createMessage = async (mode: 'draft' | 'submit') => {
    if (!form.body.trim()) {
      setError('Please describe the maintenance issue before continuing.');
      return;
    }

    try {
      setSaving(mode);
      setError(null);

      const createResponse = await fetch('/api/tenant/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const created = (await createResponse.json()) as ApiResponse<TenantMessage>;

      if (!createResponse.ok || !created.success) {
        throw new Error(created.error || 'Failed to save maintenance draft');
      }

      let nextMessage = created.data;

      if (mode === 'submit') {
        const submitResponse = await fetch(`/api/tenant/messages/${created.data.id}/submit`, {
          method: 'POST',
        });
        const submitted = (await submitResponse.json()) as ApiResponse<TenantMessage>;

        if (!submitResponse.ok || !submitted.success) {
          throw new Error(submitted.error || 'Failed to submit draft for approval');
        }

        nextMessage = submitted.data;
      }

      setMessages((current) => [nextMessage, ...current]);
      setForm({ subject: '', propertyLabel: '', unitLabel: '', body: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create maintenance draft');
    } finally {
      setSaving(null);
    }
  };

  const handleSubmitExisting = async (messageId: string) => {
    try {
      const response = await fetch(`/api/tenant/messages/${messageId}/submit`, {
        method: 'POST',
      });
      const data = (await response.json()) as ApiResponse<TenantMessage>;

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit draft for approval');
      }

      setMessages((current) => current.map((message) => (
        message.id === messageId ? data.data : message
      )));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit draft for approval');
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Draft-only maintenance messaging
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
              Tony helps you draft a maintenance request, but nothing is sent directly. Every message
              goes through owner review first, and habitability issues are flagged for urgent handling.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
              <div className="text-2xl font-semibold text-amber-700 dark:text-amber-300">{submittedCount}</div>
              <div className="text-amber-700/80 dark:text-amber-200/80">Pending review</div>
            </div>
            <div className="rounded-lg bg-green-50 px-4 py-3 dark:bg-green-900/20">
              <div className="text-2xl font-semibold text-green-700 dark:text-green-300">{approvedCount}</div>
              <div className="text-green-700/80 dark:text-green-200/80">Approved</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Compose a maintenance draft</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Subject</span>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              placeholder="Kitchen sink leaking"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Property</span>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={form.propertyLabel}
              onChange={(event) => setForm((current) => ({ ...current, propertyLabel: event.target.value }))}
              placeholder="Maple Court Apartments"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Unit</span>
            <input
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={form.unitLabel}
              onChange={(event) => setForm((current) => ({ ...current, unitLabel: event.target.value }))}
              placeholder="Unit 2B"
            />
          </label>
          <div className="hidden md:block" />
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-sm text-gray-600 dark:text-gray-400">Issue details</span>
          <textarea
            className="min-h-36 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={form.body}
            onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
            placeholder="Describe what is happening, when it started, and whether the issue affects safety or habitability."
          />
        </label>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => createMessage('draft')}
            disabled={saving !== null}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {saving === 'draft' ? 'Saving draft...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={() => createMessage('submit')}
            disabled={saving !== null}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving === 'submit' ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message history</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Drafts stay in review until an owner approves or rejects them.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchMessages}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Loading maintenance drafts...</p>
        ) : messages.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">No maintenance drafts yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`rounded-lg border p-4 ${
                  message.isHabitability
                    ? 'border-red-300 bg-red-50/60 dark:border-red-800 dark:bg-red-950/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20'
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{message.subject}</h4>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(message.status)}`}>
                        {message.status}
                      </span>
                      {message.isHabitability && (
                        <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
                          Habitability
                        </span>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{message.body}</p>
                    <dl className="mt-3 grid gap-2 text-xs text-gray-500 dark:text-gray-400 md:grid-cols-2">
                      <div>
                        <dt className="font-medium text-gray-600 dark:text-gray-300">Created</dt>
                        <dd>{new Date(message.createdAt).toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-600 dark:text-gray-300">Location</dt>
                        <dd>{[message.propertyLabel, message.unitLabel].filter(Boolean).join(' • ') || 'Not specified'}</dd>
                      </div>
                      {message.submittedAt && (
                        <div>
                          <dt className="font-medium text-gray-600 dark:text-gray-300">Submitted</dt>
                          <dd>{new Date(message.submittedAt).toLocaleString()}</dd>
                        </div>
                      )}
                      {message.approvedAt && (
                        <div>
                          <dt className="font-medium text-gray-600 dark:text-gray-300">Approved</dt>
                          <dd>{new Date(message.approvedAt).toLocaleString()}</dd>
                        </div>
                      )}
                    </dl>
                    {message.rejectionReason && (
                      <p className="mt-3 text-sm text-red-700 dark:text-red-300">
                        Rejection reason: {message.rejectionReason}
                      </p>
                    )}
                  </div>

                  {message.status === 'draft' && (
                    <button
                      type="button"
                      onClick={() => handleSubmitExisting(message.id)}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Submit for Approval
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
