import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { approveTenantMessage, listTenantMessages, rejectTenantMessage } from '@/lib/tony-messages';
import { UserRole } from '@/types';

function getSessionContext(session: any) {
  if (!session?.user) {
    return null;
  }

  const user = session.user as typeof session.user & {
    role?: UserRole;
    name?: string;
  };

  return {
    name: user.name || user.email || 'Unknown user',
    role: user.role || 'tenant',
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const viewer = getSessionContext(session);

    if (!viewer) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (viewer.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only owners can view the approval queue' }, { status: 403 });
    }

    const submitted = (await listTenantMessages()).filter((message) => message.status === 'submitted');

    return NextResponse.json({
      success: true,
      data: submitted,
      meta: {
        total: submitted.length,
        urgent: submitted.filter((message) => message.isHabitability).length,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch approval queue';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const viewer = getSessionContext(session);

    if (!viewer) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (viewer.role !== 'owner') {
      return NextResponse.json({ success: false, error: 'Only owners can approve or reject messages' }, { status: 403 });
    }

    const body = await request.json();
    const id = body?.id as string | undefined;
    const action = body?.action as 'approve' | 'reject' | undefined;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'id and action are required' }, { status: 400 });
    }

    const message = action === 'approve'
      ? await approveTenantMessage(id, viewer.name)
      : await rejectTenantMessage(id, viewer.name, body?.reason as string | undefined);

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update approval queue';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
