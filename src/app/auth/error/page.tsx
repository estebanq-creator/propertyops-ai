'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server configuration error',
    description:
      'There is a problem with the server configuration. If you are the administrator, check that AUTH_SECRET and AUTH_TRUST_HOST are set in your environment variables.',
  },
  AccessDenied: {
    title: 'Access denied',
    description: 'You do not have permission to access this resource.',
  },
  Verification: {
    title: 'Verification failed',
    description: 'The sign-in link is no longer valid. It may have expired or already been used.',
  },
  Default: {
    title: 'Authentication error',
    description: 'An unexpected error occurred during sign in. Please try again.',
  },
};

function AuthErrorContent() {
  const params = useSearchParams();
  const errorCode = params.get('error') ?? 'Default';
  const { title, description } = errorMessages[errorCode] ?? errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full px-6 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            PropertyOpsAI
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Control Panel</p>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-6">
          <h2 className="text-base font-semibold text-red-700 dark:text-red-400 mb-1">
            {title}
          </h2>
          <p className="text-sm text-red-600 dark:text-red-300">{description}</p>
          {errorCode !== 'Default' && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-mono">
              Error code: {errorCode}
            </p>
          )}
        </div>

        <Link
          href="/auth/signin"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
