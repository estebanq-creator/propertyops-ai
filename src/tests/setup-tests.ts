import { vi } from 'vitest';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        role: 'owner',
        propertyIds: ['property-1'],
      },
    },
    status: 'authenticated',
  }),
}));

// Mock next-auth server session
vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}));
