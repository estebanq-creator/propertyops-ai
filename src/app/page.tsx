'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';

/**
 * Root page - redirects to appropriate dashboard based on user role
 */
export default function RootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthAndRedirect() {
      try {
        // Fetch session to determine role
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (!session?.user) {
          // Not authenticated - redirect to signin
          router.push('/auth/signin?callbackUrl=/');
          return;
        }
        
        const role = session.user.role as UserRole;
        
        // Redirect based on role
        switch (role) {
          case 'owner':
            router.push('/owner');
            break;
          case 'landlord':
            router.push('/landlord');
            break;
          case 'tenant':
            router.push('/tenant');
            break;
          default:
            // Default to tenant (most restrictive)
            router.push('/tenant');
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
        // On error, redirect to signin
        router.push('/auth/signin');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuthAndRedirect();
  }, [router]);

  // Loading state
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </main>
  );
}
