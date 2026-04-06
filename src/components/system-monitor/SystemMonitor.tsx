'use client';

import { useState, useEffect } from 'react';
import { Agent, SystemHealth } from '@/types';

export function SystemMonitor() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) throw new Error('Failed to fetch system health');
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-500 dark:text-gray-400">Loading system status...</p>
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

  if (!health) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Overall Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            System Status
          </span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              health.status === 'healthy'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : health.status === 'degraded'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {health.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Tunnel Status */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tunnel Connection
        </h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              health.tunnelStatus === 'connected'
                ? 'bg-green-500'
                : health.tunnelStatus === 'reconnecting'
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-red-500'
            }`}
          />
          <span className="text-gray-600 dark:text-gray-400 capitalize">
            {health.tunnelStatus}
          </span>
        </div>
      </div>

      {/* Agents */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Agents ({health.agents.length})
        </h3>
        <div className="space-y-2">
          {health.agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    agent.status === 'online'
                      ? 'bg-green-500'
                      : agent.status === 'busy'
                      ? 'bg-yellow-500'
                      : agent.status === 'error'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                  }`}
                />
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {agent.name}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {agent.status}
                {agent.currentTask && ` - ${agent.currentTask}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
            <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
              {(health.uptime * 100).toFixed(2)}%
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Error Rate:</span>
            <span className="ml-2 text-gray-800 dark:text-gray-200 font-medium">
              {(health.errorRate * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
