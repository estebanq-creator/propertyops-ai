import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { approveTenantMessage, getTenantMessage, rejectTenantMessage } from '@/lib/tony-messages';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const viewer = getSessionContext(session);

    if (!viewer) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const message = await getTenantMessage(id);

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message not found' }, { status: 404 });
    }

    if (viewer.role !== 'owner' && viewer.id !== message.tenantId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tenant message';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
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

    if (viewer.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only owners can approve or reject messages' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const action = body?.action as 'approve' | 'reject' | undefined;

    if (action === 'approve') {
      const message = await approveTenantMessage(id, viewer.name);
      return NextResponse.json({ success: true, data: message });
    }

    if (action === 'reject') {
      const message = await rejectTenantMessage(id, viewer.name, body?.reason as string | undefined);
      return NextResponse.json({ success: true, data: message });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update tenant message';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
