import { NextRequest, NextResponse } from 'next/server';
import { getMessage, updateMessage } from '@/lib/tenant-messages';

export async function POST(request: NextRequest) {
  const { params } = request;
  const id = params?.id as string;
  if (!id) return NextResponse.json({ success: false, error: 'id missing' }, { status: 400 });
  const msg = getMessage(id);
  if (!msg) return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
  const habit = msg.body.toLowerCase().includes('broken') || msg.body.toLowerCase().includes('leaking') || msg.body.toLowerCase().includes('damage') ? 'red' : 'green';
  updateMessage(id, { status: 'submitted', habitability: habit, updatedAt: new Date().toISOString() });
  return NextResponse.json({ success: true, data: { id } });
}
