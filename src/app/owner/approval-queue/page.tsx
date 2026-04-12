import { TonyDisclaimerFooter } from '@/components/legal/DisclaimerFooter';
import { TonyApprovalQueue } from '@/components/owner/TonyApprovalQueue';

export default function OwnerApprovalQueuePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="container mx-auto flex-1 px-4 py-6">
        <TonyApprovalQueue />
      </div>
      <TonyDisclaimerFooter />
    </main>
  );
}
