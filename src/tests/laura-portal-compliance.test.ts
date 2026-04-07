import { describe, it, expect, vi, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Mock paperclip request module to intercept calls
vi.mock('@/lib/paperclip', () => {
  return {
    paperclipRequest: vi.fn(async (url, opts) => {
      // Store calls for inspection
      (global as any).__paperclipCalls = (global as any).__paperclipCalls || [];
      (global as any).__paperclipCalls.push({ url, opts });
      return { status: 200, json: async () => ({}) };
    }),
  };
});

// Import the approve route to test
const { POST } = await import('../../api/tasks/[id]/approve/route.ts');

describe('Laura Portal Compliance Tests', () => {
  const pagesToCheck = [
    'src/app/landlord/page.tsx',
    'src/app/owner/page.tsx',
  ];

  it('UI pages contain required disclaimer and Fair Housing language', () => {
    const disclaimer = 'Forensic Analysis Only';
    const fairHousing = 'Fair Housing Act';

    pagesToCheck.forEach((relative) => {
      const filePath = path.resolve(__dirname, '../../', relative);
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain(disclaimer);
      expect(content).toContain(fairHousing);
    });
  });

  it('UI pages do not contain prohibited terms like Pass/Fail or Credit Decision', () => {
    const prohibitedTerms = [
      'Pass',
      'Fail',
      'Approval',
      'Reject',
      'Score',
      'Credit',
      'Eviction',
      'Screening',
    ];
    pagesToCheck.forEach((relative) => {
      const filePath = path.resolve(__dirname, '../../', relative);
      const content = fs.readFileSync(filePath, 'utf8');
      prohibitedTerms.forEach((term) => {
        expect(content).not.toMatch(new RegExp(`\\b${term}\\b`, 'i'));
      });
    });
  });

  it('Approve API route creates audit log entry', async () => {
    const { paperclipRequest } = await import('@/lib/paperclip');
    const params = { params: { id: 'test-task' } } as any;
    await POST(new Request('http://example.com/api/tasks/test-task/approve'), params);

    const calls = (global as any).__paperclipCalls;
    const auditCall = calls.find((c: any) => c.url.includes('/audit-logs'));
    expect(auditCall).toBeDefined();
    expect(auditCall.opts.method).toBe('POST');
    const body = JSON.parse(auditCall.opts.body);
    expect(body.action).toBe('TASK_APPROVED');
    expect(body.target).toBe('test-task');
  });
});
