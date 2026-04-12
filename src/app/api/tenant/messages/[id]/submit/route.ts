import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTenantMessage, submitTenantMessage } from '@/lib/tony-messages';
import { UserRole } from '@/types';

function getSessionContext(session: any) {
  if (!session?.user) {
    return null;
  }

  const user = session.user as typeof session.user & {
    id?: string;
    role?: UserRole;
    name?: string;
  };

  return {
    id: user.id || 'unknown-user',
    name: user.name || user.email || 'Unknown user',
    role: user.role || 'tenant',
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const viewer = getSessionContext(session);

    if (!viewer) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (viewer.role !== 'tenant' && viewer.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only tenants and owners can submit drafts' }, { status: 403 });
    }

    const { id } = await params;
    const message = await getTenantMessage(id);

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    if (viewer.role !== 'owner' && viewer.id !== message.tenantId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const submitted = await submitTenantMessage(id, viewer.name);
    return NextResponse.json({ success: true, data: submitted });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit tenant message';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
