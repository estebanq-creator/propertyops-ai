// Silent Token Refresh Hook
// PropertyOps AI - Automatic Session Renewal
//
// Usage: Call useSilentTokenRefresh() in your root layout or auth provider
// This hook triggers a silent token refresh every 15 minutes while the user is active

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Silent token refresh hook
 * Automatically refreshes JWT session tokens in the background
 */
export function useSilentTokenRefresh() {
  const { data: session, update } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshSession = useCallback(async () => {
    if (session) {
      // Trigger silent refresh by calling update()
      // next-auth will refresh the token if it's older than updateAge
      await update();
    }
  }, [session, update]);

  useEffect(() => {
    if (!session) {
      // Clear interval if user logs out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial refresh after mount
    refreshSession();

    // Set up interval for silent refresh
    intervalRef.current = setInterval(refreshSession, REFRESH_INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [session, refreshSession]);
}

/**
 * Auth Provider Component
 * Wraps the application with next-auth session provider and silent refresh
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useSilentTokenRefresh();
  return children;
}
