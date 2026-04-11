import { useState, useEffect } from 'react';
import { DisclaimerFooter } from '@/components/legal/DisclaimerFooter';

export default function TenantMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => fetchMessages(), []);

  const fetchMessages = async () => {
    setLoading(true);
    const res = await fetch('/api/tenant/messages?tenantId=tenant-123');
    const data = await res.json();
    if (data.success) setMessages(data.data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">My Message Drafts</h1>
        {loading && <p>Loading…</p>}
        {!loading && <dl>
          {messages.map(msg => (
            <dt key={msg.id} className="font-semibold"></a>{msg.subject || '(no subject)'}<dt>
            <dt>Body:<dt>{msg.body.substring(0, 100)}…<dt>
            <dt>Status: {msg.status}<dt>
          
            <dt><button onClick={() => fetch('/api/tenant/messages/' + msg.id, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'submit' }) }) className="px-3 py-1 rounded bg-blue-600 text-white"><span>Submit for Approval</span><button>
          <dt></button>
          <dt>
          ))}
        </dd>
      </section>
      <DisclaimerFooter />
    </main>
  );
}
