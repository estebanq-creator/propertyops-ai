import { useState, useEffect } from 'react';
import { DisclaimerFooter } from '@/components/legal/DisclaimerFooter';

export default function TenantDashboard() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/messages?tenantId=tenant-123');
      const data = await res.json();
      if (data.success) setMessages(data.data);
      else setError(data.error || 'Unable to load messages');
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewDraft = async (subject: string, body: string) => {
    const res = await fetch('/api/tenant/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 'tenant-123', subject, body }),
    });
    await fetchMessages();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">My Messages</h1>
        {/* Message list omitted for brevity */}
      </section>
      <DisclaimerFooter />
    </div>
  );
}
