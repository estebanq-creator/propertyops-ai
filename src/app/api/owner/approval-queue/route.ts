import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmittedMessages } from '@/lib/tenant-messages';
import { updateMessage } from '@/lib/tenant-messages';

export async function GET(request: NextRequest) {
  const msgs = getAllSubmittedMessages();
  return NextResponse.json({ success: true, data: msgs });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, action, reason } = body;
  const msg = getAllSubmittedMessages().find(m => m.id === id);
  if (!msg) return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
  if (action === 'approve') {
    updateMessage(id, { status: 'approved', approvedAt: new Date().toISOString(), approvedBy: 'CEO' });
    return NextResponse.json({ success: true, data: { id } });
  }
  if (action === 'reject') {
    updateMessage(id, { status: 'rejected', rejectReason: reason, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true, data: { id } });
  }
  return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
}
