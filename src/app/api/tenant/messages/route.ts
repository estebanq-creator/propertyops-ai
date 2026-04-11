import { NextRequest, NextResponse } from 'next/server';
import { addMessage, getAllSubmittedMessages } from '@/lib/tenant-messages';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { tenantId, subject, body } = data;
  if (!tenantId || !body) {
    return NextResponse.json({ success: false, error: 'tenantId and body required' }, { status: 400 });
  }
  const msg = {
    id: uuidv4(),
    tenantId,
    subject,
    body,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  addMessage(msg);
  return NextResponse.json({ success: true, data: msg });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tenantId = url.searchParams.get('tenantId');
  if (!tenantId) return NextResponse.json({ success: false, error: 'tenantId missing' }, { status: 400 });
  const msgs = getAllSubmittedMessages().filter(m => m.tenantId === tenantId);
  return NextResponse.json({ success: true, data: msgs });
}
