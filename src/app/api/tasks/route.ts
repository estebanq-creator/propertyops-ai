import { NextResponse } from 'next/server';
import { Task } from '@/types';

// Mock data - will be replaced with actual Paperclip API calls
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Review tenant application - 123 Main St',
    status: 'pending',
    priority: 'high',
    assigneeAgentId: 'laura-123',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'Laura flagged income verification anomaly',
  },
  {
    id: '2',
    title: 'Approve maintenance vendor - ABC Plumbing',
    status: 'pending',
    priority: 'medium',
    assigneeAgentId: 'ops-456',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString(),
    description: 'New vendor onboarding requires approval',
  },
  {
    id: '3',
    title: 'Weekly competitive briefing review',
    status: 'approved',
    priority: 'medium',
    assigneeAgentId: 'intel-789',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    approvedAt: new Date(Date.now() - 43200000).toISOString(),
    approvedBy: 'David',
    description: 'Intel agent completed weekly briefing',
  },
];

export async function GET() {
  try {
    // TODO: Replace with actual Paperclip API call
    // const response = await fetch(`${process.env.PAPERCLIP_API_URL}/tasks`, {
    //   headers: { Authorization: `Bearer ${process.env.PAPERCLIP_API_KEY}` },
    // });
    // const tasks = await response.json();

    return NextResponse.json(MOCK_TASKS);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
