import { NextRequest, NextResponse } from 'next/server';
import { getMessage, updateMessage } from '@/lib/tenant-messages';

function detectHabitability(body: string): 'red' | 'green' {
  const lowWords = ['broken', 'leaking', 'damage'];
  const txt = body.toLowerCase();
  return lowWords.some(w => txt.includes(w)) ? 'red' : 'green';
}

export async function GET(request: NextRequest) {
  const { params } = request;
  const id = params?.id as string;
  if (!id) return NextResponse.json({ success: false, error: 'id missing' }, { status: 400 });
  const msg = getMessage(id);
  if (!msg) return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
  return NextResponse.json({ success: true, data: msg });
}

export async function POST(request: NextRequest) {
  const { params } = request;
  const id = params?.id as string;
  if (!id) return NextResponse.json({ success: false, error: 'id missing' }, { status: 400 });
  const msg = getMessage(id);
  if (!msg) return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
  const body = await request.json();
  const { action } = body;
  if (!action) return NextResponse.json({ success: false, error: 'action required' }, { status: 400 });
  if (action === 'submit') {
    const habit = detectHabitability(msg.body);
    updateMessage(id, { status: 'submitted', habitability: habit, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true, data: { id } });
  }
  if (action === 'approve') {
    updateMessage(id, { status: 'approved', approvedAt: new Date().toISOString(), approvedBy: 'CEO' });
    return NextResponse.json({ success: true, data: { id } });
  }
  if (action === 'reject') {
    const { reason } = body;
    updateMessage(id, { status: 'rejected', rejectReason: reason, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true, data: { id } });
  }
  return NextResponse.json({ success: false, error: 'unknown action' }, { status: 400 });
}
