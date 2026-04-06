import { SystemMonitor } from '@/components/system-monitor/SystemMonitor';
import { TaskQueue } from '@/components/task-queue/TaskQueue';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            PropertyOpsAI Control Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              System Health
            </h2>
            <SystemMonitor />
          </section>

          {/* Task Queue Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Task Queue
            </h2>
            <TaskQueue />
          </section>
        </div>
      </div>
    </main>
  );
}
