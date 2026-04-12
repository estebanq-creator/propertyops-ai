import { TonyDisclaimerFooter } from '@/components/legal/DisclaimerFooter';
import { TenantMessagesPanel } from '@/components/tenant/TenantMessagesPanel';

export default function TenantMessagesPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="container mx-auto flex-1 px-4 py-6">
        <TenantMessagesPanel />
      </div>
      <TonyDisclaimerFooter />
    </main>
  );
}
