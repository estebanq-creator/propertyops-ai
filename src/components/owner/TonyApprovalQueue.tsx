'use client';

import { useEffect, useState } from 'react';
import { TenantMessage } from '@/types';

interface QueueResponse {
  success: boolean;
  data: TenantMessage[];
  error?: string;
}

function queueCardClasses(message: TenantMessage) {
  return message.isHabitability
    ? 'border-red-300 bg-red-50/70 dark:border-red-800 dark:bg-red-950/20'
    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20';
}

export function TonyApprovalQueue() {
  const [messages, setMessages] = useState<TenantMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/owner/approval-queue', { cache: 'no-store' });
      const data = (await response.json()) as QueueResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load approval queue');
      }

      setMessages(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load approval queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const processMessage = async (id: string, action: 'approve' | 'reject') => {
    try {
      setProcessingId(id);
      const reason = action === 'reject'
        ? window.prompt('Optional rejection reason:', 'Needs clarification before sending')
        : undefined;

      const response = await fetch('/api/owner/approval-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, reason }),
      });
      const data = (await response.json()) as QueueResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to ${action} message`);
      }

      setMessages((current) => current.filter((message) => message.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process approval action');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tony approval queue</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Every tenant message stays draft-only until an owner explicitly approves it. Habitability
            messages are sorted first and highlighted in red for immediate review.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchQueue}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Refresh queue
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Loading approval queue...</p>
      ) : messages.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">No tenant messages are awaiting approval right now.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {messages.map((message) => (
            <article key={message.id} className={`rounded-lg border p-4 ${queueCardClasses(message)}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{message.subject}</h3>
                    {message.isHabitability && (
                      <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
                        HABITABILITY
                      </span>
                    )}
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      Pending review
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{message.body}</p>

                  <dl className="grid gap-2 text-xs text-gray-500 dark:text-gray-400 md:grid-cols-2">
                    <div>
                      <dt className="font-medium text-gray-600 dark:text-gray-300">Tenant</dt>
                      <dd>{message.tenantName || message.tenantId}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600 dark:text-gray-300">Location</dt>
                      <dd>{[message.propertyLabel, message.unitLabel].filter(Boolean).join(' • ') || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600 dark:text-gray-300">Submitted</dt>
                      <dd>{message.submittedAt ? new Date(message.submittedAt).toLocaleString() : 'Draft only'}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-600 dark:text-gray-300">Urgency markers</dt>
                      <dd>{message.habitabilityMatches.join(', ') || 'Standard maintenance request'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex min-w-52 flex-col gap-3">
                  <button
                    type="button"
                    disabled={processingId === message.id}
                    onClick={() => processMessage(message.id, 'approve')}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {processingId === message.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={processingId === message.id}
                    onClick={() => processMessage(message.id, 'reject')}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
