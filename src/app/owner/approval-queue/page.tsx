import { useState, useEffect } from 'react';
import { DisclaimerFooter } from '@/components/legal/DisclaimerFooter';

export default function OwnerApprovalQueue() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/owner/approval-queue');
      const data = await res.json();
      if (data.success) setMessages(data.data);
      else setError(data.error || 'Failed to load queue');
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    const payload: any = { id, action };
    if (reason) payload.reason = reason;
    await fetch('/api/owner/approval-queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    fetchQueue();
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">CEO Approval Queue</h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="border rounded p-4 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">{msg.subject || '(no subject)'}</h2>
                  <span className={`px-2 py-1 rounded text-xs ${msg.habitability === 'red' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-800'}`}>Habitability {msg.habitability}</span>
                </div>
                <p>{msg.body.substring(0, 200)}…</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => handleAction(msg.id, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded" >Approve</button>
                  <button onClick={() => handleAction(msg.id, 'reject', 'Not relevant')} className="px-3 py-1 bg-red-600 text-white rounded" >Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <DisclaimerFooter />
    </main>
  );
}
