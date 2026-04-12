'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Silent token refresh component
 * Automatically refreshes JWT session tokens in the background
 * Must be rendered inside a SessionProvider
 */
export function SilentTokenRefresh() {
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

  return null; // This component renders nothing
}
