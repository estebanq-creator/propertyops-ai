'use client';

import { SessionProvider } from 'next-auth/react';
import { SilentTokenRefresh } from './SilentTokenRefresh';

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SilentTokenRefresh />
      {children}
    </SessionProvider>
  );
}
