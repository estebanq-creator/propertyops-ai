// NextAuth Type Extensions for RBAC
// PropertyOps AI - Extending next-auth v5 types

import { UserRole } from '@/types';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      propertyIds: string[];
      landlordId?: string;
    };
  }

  interface User {
    role: UserRole;
    propertyIds: string[];
    landlordId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    propertyIds: string[];
    landlordId?: string;
  }
}
