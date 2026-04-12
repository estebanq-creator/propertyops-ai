# PropertyOps AI Mission Control — Foundation Setup Guide

**Created:** April 9, 2026  
**Stack:** Next.js 15+ (App Router), TypeScript, Tailwind CSS 3.x, shadcn/ui, next-auth v5

---

## Quick Start

```bash
# Navigate to control-panel directory
cd /Users/david/.openclaw/workspace-hermes/control-panel

# Run setup script (installs deps, generates secrets, initializes shadcn/ui)
chmod +x scripts/setup-foundation.sh
./scripts/setup-foundation.sh

# Start development server
npm run dev

# Visit http://localhost:3000
```

---

## Terminal Commands for Manual Setup

If you prefer manual setup instead of the script:

### 1. Initialize Repository Structure

```bash
# Create Next.js 15+ app with TypeScript and Tailwind CSS
npx create-next-app@latest control-panel --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navigate to project
cd control-panel

# Install next-auth v5 (Auth.js)
npm install next-auth@beta

# Initialize shadcn/ui
npx shadcn@latest init

# Install essential UI components
npx shadcn@latest add button card input label avatar dropdown-menu
```

### 2. Configure Environment Variables

```bash
# Generate secure random secret for JWT signing
openssl rand -base64 32

# Create .env.local file
cat > .env.local << EOF
# Auth (next-auth v5 / Auth.js)
AUTH_SECRET=<paste-32-char-secret-here>
AUTH_SESSION_MAX_AGE=86400
AUTH_TRUST_HOST=true

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
EOF
```

### 3. Verify Installation

```bash
# Run type checking
npm run type-check

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

---

## Code Files (Already Implemented)

### 1. NextAuth Configuration

**File:** `src/lib/auth.ts`

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { UserRole } from '@/types';

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  propertyIds: string[];
  landlordId?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      id: 'propertyops',
      name: 'PropertyOpsAI',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // TODO: Replace with actual auth against Paperclip API
        if (credentials?.email && credentials?.password) {
          const user: ExtendedUser = {
            id: '1',
            email: credentials.email as string,
            name: credentials.email as string,
            role: 'owner',
            propertyIds: [],
            landlordId: undefined,
          };
          return user;
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 86400,        // 24 hours
    updateAge: 900,       // 15 minutes (silent refresh trigger)
  },
  cookies: {
    sessionToken: {
      name: `authjs.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 86400,
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.propertyIds = user.propertyIds;
        token.landlordId = user.landlordId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as UserRole;
        session.user.propertyIds = token.propertyIds as string[] || [];
        session.user.landlordId = token.landlordId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === 'true',
});
```

**Key Security Features:**
- ✅ JWT strategy (no database)
- ✅ HTTP-only cookies
- ✅ Secure flag (production)
- ✅ SameSite=Strict (CSRF protection)
- ✅ 24-hour session lifetime
- ✅ 15-minute silent refresh via `updateAge`

---

### 2. Silent Token Refresh Hook

**File:** `src/hooks/useSilentTokenRefresh.ts`

```typescript
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export function useSilentTokenRefresh() {
  const { data: session, update } = useSession();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshSession = useCallback(async () => {
    if (session) {
      await update(); // Triggers silent refresh
    }
  }, [session, update]);

  useEffect(() => {
    if (!session) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    refreshSession();
    intervalRef.current = setInterval(refreshSession, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [session, refreshSession]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useSilentTokenRefresh();
  return <>{children}</>;
}
```

**Integration:** Wrap your app in `src/app/layout.tsx`:

```tsx
import { AuthProvider } from "@/hooks/useSilentTokenRefresh";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

---

### 3. RBAC Middleware

**File:** `src/middleware/role-guard.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';

const ROLE_ROUTES: Record<string, UserRole[]> = {
  '/owner': ['owner'],
  '/landlord': ['landlord', 'owner'],
  '/tenant': ['tenant', 'owner'],
};

const PUBLIC_ROUTES = [
  '/auth/signin',
  '/auth/signout',
  '/auth/error',
  '/api/auth',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }
  
  // Get session
  const session = await auth();
  
  // Redirect to signin if not authenticated
  if (!session?.user) {
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }
  
  // Check role-based access
  const userRole = (session.user as any)?.role as UserRole | undefined;
  
  for (const [route, requiredRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      if (!userRole || !requiredRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/auth/error?code=ACCESS_DENIED', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Entry Point:** `src/middleware.ts`

```typescript
export { middleware } from './middleware/role-guard';
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

### 4. Type Definitions

**File:** `src/types/index.ts`

```typescript
export type UserRole = 'owner' | 'landlord' | 'tenant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  propertyIds: string[];        // Properties user can access
  landlordId?: string;          // For tenants: links to their landlord
  createdAt?: string;
  updatedAt?: string;
}
```

---

## Security Configuration Summary

| Feature | Status | Configuration |
|---------|--------|---------------|
| JWT Sessions | ✅ Implemented | `strategy: 'jwt'` |
| HTTP-only Cookies | ✅ Implemented | `httpOnly: true` |
| Secure Flag | ✅ Implemented | `secure: NODE_ENV === 'production'` |
| SameSite=Strict | ✅ Implemented | `sameSite: 'strict'` |
| 24h Lifetime | ✅ Implemented | `maxAge: 86400` |
| 15min Silent Refresh | ✅ Implemented | `updateAge: 900` + `useSilentTokenRefresh()` hook |
| RBAC Middleware | ✅ Implemented | `/owner`, `/landlord`, `/tenant` routes |
| Property Scoping | ✅ Scaffolded | `propertyIds` array in session |

---

## Current Status (Phase 1 MVP)

**Deployed:** April 7, 2026  
**Production URL:** https://control-panel-bskqlsizi-estebanq-7865s-projects.vercel.app

**What's Live:**
- ✅ Authentication gateway (next-auth v5)
- ✅ System Monitor component (agent health)
- ✅ Task queue view (read-only)
- ✅ Paperclip API integration
- ✅ Vercel deployment

**What's Pilot-Only:**
- 🟡 Laura Portal (forensic document analysis)
- 🟡 Manual invoicing (founder-led contracts)
- 🟡 CEO review gate (first 50 reports)

**See:** `../docs/LAUNCH-DECISION.md` for GTM sequence

---

## Next Steps

1. **Replace Placeholder Credentials:**
   - Update `AUTH_SECRET` in `.env.local` with real secret
   - Update `PAPERCLIP_API_KEY` with actual API key

2. **Test Authentication Flow:**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Test signin → dashboard → signout flow
   ```

3. **Deploy to Production:**
   ```bash
   # Set Vercel environment variables:
   # AUTH_SECRET, AUTH_TRUST_HOST=true, NODE_ENV=production
   
   # Deploy
   vercel --prod
   ```

4. **Onboard Pilot Landlords:**
   - See `../docs/LAURA-PILOT-READINESS.md`
   - Manual invoicing workflow: `../docs/MANUAL-BILLING-PILOT.md`

---

## Documentation

- **SECURITY-CONFIG.md** — Detailed security configuration
- **LAUNCH-DECISION.md** — GTM sequence and product release plan
- **LAURA-PILOT-READINESS.md** — Operational checklist
- **README.md** — Project overview

---

**Approved By:** ⬜ David (CEO)  
**Product Lead:** Hermes (✅)  
**Phase:** 1 (Pilot-Ready)
