// Tunnel Connectivity Monitoring
// PropertyOpsAI Control Panel - Phase 1

import { checkTunnelConnectivity } from './paperclip';

export type TunnelStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface TunnelHealth {
  status: TunnelStatus;
  lastCheck: string;
  latencyMs?: number;
  error?: string;
  consecutiveFailures: number;
}

// Configuration
const HEALTH_CHECK_INTERVAL_MS = parseInt(
  process.env.HEALTH_CHECK_INTERVAL_MS || '30000',
  10
);
const OFFLINE_THRESHOLD_MS = parseInt(
  process.env.TUNNEL_OFFLINE_ALERT_THRESHOLD_MS || '300000',
  10
);
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Tunnel monitoring singleton
 */
class TunnelMonitor {
  private health: TunnelHealth = {
    status: 'connected',
    lastCheck: new Date().toISOString(),
    consecutiveFailures: 0,
  };

  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(health: TunnelHealth) => void> = new Set();

  /**
   * Start monitoring tunnel connectivity
   */
  start(): void {
    if (this.checkInterval) {
      return; // Already running
    }

    // Initial check
    this.performCheck();

    // Set up periodic checks
    this.checkInterval = setInterval(
      () => this.performCheck(),
      HEALTH_CHECK_INTERVAL_MS
    );
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get current tunnel health
   */
  getHealth(): TunnelHealth {
    return { ...this.health };
  }

  /**
   * Subscribe to health updates
   */
  subscribe(listener: (health: TunnelHealth) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Perform a single connectivity check
   */
  private async performCheck(): Promise<void> {
    const result = await checkTunnelConnectivity();
    const now = new Date().toISOString();

    let newStatus: TunnelStatus = this.health.status;
    let consecutiveFailures = this.health.consecutiveFailures;

    if (result.connected) {
      consecutiveFailures = 0;
      newStatus = 'connected';
    } else {
      consecutiveFailures += 1;

      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        newStatus = 'disconnected';
      } else {
        newStatus = 'reconnecting';
      }
    }

    const newHealth: TunnelHealth = {
      status: newStatus,
      lastCheck: now,
      latencyMs: result.latencyMs,
      error: result.error,
      consecutiveFailures,
    };

    // Update health and notify listeners if changed
    const statusChanged = this.health.status !== newHealth.status;
    this.health = newHealth;

    if (statusChanged) {
      this.notifyListeners();
    }
  }

  /**
   * Notify all listeners of health update
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.health);
      } catch (error) {
        console.error('Tunnel monitor listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const tunnelMonitor = new TunnelMonitor();

/**
 * Get current tunnel status (for API routes)
 */
export async function getTunnelStatus(): Promise<TunnelHealth> {
  // If monitor hasn't been started, do a one-time check
  const health = tunnelMonitor.getHealth();
  
  // If we've never checked, do so now
  if (health.lastCheck === new Date(0).toISOString()) {
    const result = await checkTunnelConnectivity();
    return {
      status: result.connected ? 'connected' : 'disconnected',
      lastCheck: new Date().toISOString(),
      latencyMs: result.latencyMs,
      error: result.error,
      consecutiveFailures: result.connected ? 0 : 1,
    };
  }

  return health;
}

/**
 * Start tunnel monitoring (call once at app startup)
 */
export function startTunnelMonitoring(): void {
  tunnelMonitor.start();
}

/**
 * Stop tunnel monitoring (call on app shutdown)
 */
export function stopTunnelMonitoring(): void {
  tunnelMonitor.stop();
}
