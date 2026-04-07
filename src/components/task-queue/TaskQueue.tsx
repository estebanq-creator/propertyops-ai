'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';

export function TaskQueue() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('pending');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  const filteredTasks = tasks.filter((task) =>
    filter === 'all' ? true : task.status === filter
  );

  const handleApprove = async (taskId: string) => {
    if (!confirm('Are you sure you want to approve this task? This action will be logged.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve task');
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: 'approved', approvedAt: new Date().toISOString() } : t
        )
      );
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Failed to approve task. Please try again.');
    }
  };

  const handleReject = async (taskId: string) => {
    if (!confirm('Are you sure you want to reject this task? This action will be logged.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/reject`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reject task');
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'rejected' } : t))
      );
    } catch (err) {
      console.error('Rejection failed:', err);
      alert('Failed to reject task. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-6">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        {(['pending', 'approved', 'completed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm font-medium rounded-t ${
              filter === f
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-1 text-xs">
                ({tasks.filter((t) => t.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No {filter} tasks
          </p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {task.description}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    task.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : task.status === 'approved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : task.status === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}
                >
                  {task.status}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="capitalize">{task.priority}</span> priority
                  {task.identifier && (
                    <span className="ml-2">• {task.identifier}</span>
                  )}
                  {task.assigneeAgentId && (
                    <span className="ml-2">• Agent</span>
                  )}
                </div>

                {task.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(task.id)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(task.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
                
                {task.status === 'completed' && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    ✓ Completed
                  </span>
                )}
                
                {task.status === 'rejected' && (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    ✗ Cancelled
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
