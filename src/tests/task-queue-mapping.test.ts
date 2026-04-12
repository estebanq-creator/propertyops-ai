import { describe, expect, it } from 'vitest';
import { mapIssueToTask, type PaperclipIssue } from '@/lib/paperclip';

function makeIssue(overrides: Partial<PaperclipIssue>): PaperclipIssue {
  return {
    id: 'issue-1',
    companyId: 'company-1',
    title: 'Test issue',
    status: 'backlog',
    priority: 'medium',
    createdAt: '2026-04-11T00:00:00Z',
    updatedAt: '2026-04-11T00:00:00Z',
    ...overrides,
  };
}

describe('task queue status mapping', () => {
  it('maps in_progress issues to approved so approved tasks do not bounce back to pending', () => {
    const task = mapIssueToTask(makeIssue({ status: 'in_progress' }));
    expect(task.status).toBe('approved');
  });

  it('maps cancelled issues to rejected', () => {
    const task = mapIssueToTask(makeIssue({ status: 'cancelled' }));
    expect(task.status).toBe('rejected');
  });

  it('maps failed issues to failed', () => {
    const task = mapIssueToTask(makeIssue({ status: 'failed' }));
    expect(task.status).toBe('failed');
  });
});
