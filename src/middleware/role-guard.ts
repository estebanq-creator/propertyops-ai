// Role-Based Access Control Middleware
// PropertyOps AI - Route Protection

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';

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

/**
 * Check if path matches a role-protected route
 */
function getRequiredRole(pathname: string): UserRole[] | null {
  for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return roles;
    }
  }
  return null;
}

/**
 * Check if path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Middleware for role-based access control
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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
  
  // Extract user role from session
  const userRole = (session.user as any)?.role as UserRole | undefined;
  const userPropertyIds = (session.user as any)?.propertyIds as string[] | undefined;
  
  // Check if route requires specific role
  const requiredRoles = getRequiredRole(pathname);
  
  if (requiredRoles) {
    // Verify user has required role
    if (!userRole || !requiredRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      const redirectPath = getDashboardPath(userRole);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    
    // For landlord/tenant routes, verify property access
    if (userRole !== 'owner' && (!userPropertyIds || userPropertyIds.length === 0)) {
      // User has no property access - redirect to error or owner
      return NextResponse.redirect(new URL('/auth/error?code=NO_PROPERTY_ACCESS', request.url));
    }
  }
  
  // API Route Protection
  if (pathname.startsWith('/api/')) {
    return handleApiAuth(request, session, userRole, userPropertyIds);
  }
  
  // All checks passed
  return NextResponse.next();
}

/**
 * Handle API route authorization
 */
async function handleApiAuth(
  request: NextRequest,
  session: any,
  userRole: UserRole | undefined,
  userPropertyIds: string[] | undefined
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  
  // Public API routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  // Require authentication for all other API routes
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Owner has access to all API routes
  if (userRole === 'owner') {
    return NextResponse.next();
  }
  
  // Role-specific API restrictions
  if (pathname.startsWith('/api/cron') || pathname.startsWith('/api/audit')) {
    // Only owner can access cron and audit APIs
    return NextResponse.json(
      { error: 'Access denied: owner role required' },
      { status: 403 }
    );
  }
  
  // For other APIs, property scoping will be applied in the route handler
  // Add user context to request headers for downstream use
  const response = NextResponse.next();
  response.headers.set('X-User-Role', userRole || 'unknown');
  response.headers.set('X-User-Property-Ids', userPropertyIds?.join(',') || '');
  response.headers.set('X-User-Id', session.user.id || '');
  
  return response;
}

/**
 * Get dashboard path based on user role
 */
function getDashboardPath(role: UserRole | undefined): string {
  switch (role) {
    case 'owner':
      return '/owner';
    case 'landlord':
      return '/landlord';
    case 'tenant':
      return '/tenant';
    default:
      return '/auth/signin';
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (robots.txt, sitemap.xml, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
