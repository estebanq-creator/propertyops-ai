// Role-Based Access Control Middleware
// PropertyOps AI - Route Protection
// Phase 0B: Tony portal (/tenant) is blocked until Phase 2 entry criteria are met.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';

/**
 * Phase gate: routes that are blocked until their phase criteria are met.
 * Code stays intact; routes are simply inaccessible until the gate is lifted.
 */
const PHASE_BLOCKED_ROUTES: Record<string, string> = {
  '/tenant': 'Tony portal is not active yet. Tony activates in Phase 2 after Laura accuracy is validated.',
};

/**
 * Role-based route patterns
 */
const ROLE_ROUTES: Record<string, UserRole[]> = {
  '/owner': ['owner'],
  '/landlord': ['landlord', 'owner'],
  '/tenant': ['tenant', 'owner'],
};

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/auth/signin',
  '/auth/signout',
  '/auth/error',
  '/api/auth',
];

function getRequiredRole(pathname: string): UserRole[] | null {
  for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return roles;
    }
  }
  return null;
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isPhaseBlocked(pathname: string): string | null {
  for (const [route, reason] of Object.entries(PHASE_BLOCKED_ROUTES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return reason;
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Phase gate check — block before auth
  const blockReason = isPhaseBlocked(pathname);
  if (blockReason) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Phase gate', message: blockReason },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Skip public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Redirect to signin if not authenticated
  if (!isAuthenticated) {
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  const userRole = (session.user as any)?.role as UserRole | undefined;
  const userPropertyIds = (session.user as any)?.propertyIds as string[] | undefined;

  const requiredRoles = getRequiredRole(pathname);

  if (requiredRoles) {
    if (!userRole || !requiredRoles.includes(userRole)) {
      const redirectPath = getDashboardPath(userRole);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (userRole !== 'owner' && (!userPropertyIds || userPropertyIds.length === 0)) {
      return NextResponse.redirect(new URL('/auth/error?code=NO_PROPERTY_ACCESS', request.url));
    }
  }

  if (pathname.startsWith('/api/')) {
    return handleApiAuth(request, session, userRole, userPropertyIds);
  }

  return NextResponse.next();
}

async function handleApiAuth(
  request: NextRequest,
  session: any,
  userRole: UserRole | undefined,
  userPropertyIds: string[] | undefined
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  if (userRole === 'owner') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/cron') || pathname.startsWith('/api/audit')) {
    return NextResponse.json(
      { error: 'Access denied: owner role required' },
      { status: 403 }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-User-Role', userRole || 'unknown');
  response.headers.set('X-User-Property-Ids', userPropertyIds?.join(',') || '');
  response.headers.set('X-User-Id', session.user.id || '');

  return response;
}

function getDashboardPath(role: UserRole | undefined): string {
  switch (role) {
    case 'owner': return '/owner';
    case 'landlord': return '/landlord';
    case 'tenant': return '/tenant';
    default: return '/auth/signin';
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
