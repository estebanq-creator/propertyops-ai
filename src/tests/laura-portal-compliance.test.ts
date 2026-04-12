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
    setIssueStatus: vi.fn(async (id, status, comment) => {
      (global as any).__setIssueStatusCalls = (global as any).__setIssueStatusCalls || [];
      (global as any).__setIssueStatusCalls.push({ id, status, comment });
      return { id, status };
    }),
    getIssue: vi.fn(async (id) => ({
      id,
      companyId: 'company-1',
      title: 'Test task',
      status: 'backlog',
      priority: 'medium',
      assigneeAgentId: 'agent-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
  };
});

// Import the approve route to test
const { POST } = await import('../app/api/tasks/[id]/approve/route.ts');

describe('Laura Portal Compliance Tests', () => {
  const landlordPages = [
    'src/app/landlord/page.tsx',
  ];
  const ownerReviewPages = [
    'src/app/owner/review-gate/page.tsx',
  ];
  const disclaimerComponent = 'src/components/legal/DisclaimerFooter.tsx';

  it('Laura pages wire the required disclaimer component and Fair Housing guardrails', () => {
    const disclaimerComponentPath = path.resolve(__dirname, '../../', disclaimerComponent);
    const disclaimerContent = fs.readFileSync(disclaimerComponentPath, 'utf8');

    expect(disclaimerContent).toContain('Forensic Analysis Only');
    expect(disclaimerContent).toContain('Fair Housing Act');

    [...landlordPages, ...ownerReviewPages].forEach((relative) => {
      const filePath = path.resolve(__dirname, '../../', relative);
      const content = fs.readFileSync(filePath, 'utf8');

      expect(content).toMatch(/DisclaimerFooter|CompactDisclaimer/);
    });
  });

  it('Landlord-facing Laura pages do not contain prohibited screening terms', () => {
    const prohibitedTerms = [
      'Pass',
      'Fail',
      'Score',
      'Credit',
      'Eviction',
      'Screening',
    ];

    landlordPages.forEach((relative) => {
      const filePath = path.resolve(__dirname, '../../', relative);
      const content = fs.readFileSync(filePath, 'utf8');

      prohibitedTerms.forEach((term) => {
        expect(content).not.toMatch(new RegExp(`\\b${term}\\b`, 'i'));
      });
    });
  });

  it('Owner review workflows are allowed to use approve and reject controls', () => {
    ownerReviewPages.forEach((relative) => {
      const filePath = path.resolve(__dirname, '../../', relative);
      const content = fs.readFileSync(filePath, 'utf8');

      expect(content).toMatch(/\bApprove\b/);
      expect(content).toMatch(/\bReject\b/);
    });
  });

  it('Landlord-facing Laura pages do not use prohibited tenancy decision language', () => {
    const prohibitedDecisionTerms = [
      'Approved for tenancy',
      'Tenant rejected',
    ];

    landlordPages.forEach((relative) => {
      const filePath = path.resolve(__dirname, '../../', relative);
      const content = fs.readFileSync(filePath, 'utf8');

      prohibitedDecisionTerms.forEach((term) => {
        expect(content).not.toMatch(new RegExp(term, 'i'));
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
