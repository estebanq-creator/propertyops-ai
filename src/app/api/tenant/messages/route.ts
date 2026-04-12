import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createTenantMessage, listTenantMessages } from '@/lib/tony-messages';
import { UserRole } from '@/types';

function getSessionContext(session: any) {
  if (!session?.user) {
    return null;
  }

  const user = session.user as typeof session.user & {
    id?: string;
    role?: UserRole;
    propertyIds?: string[];
    name?: string;
  };

  return {
    id: user.id || 'unknown-user',
    name: user.name || user.email || 'Unknown user',
    role: user.role || 'tenant',
    propertyIds: user.propertyIds || [],
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const viewer = getSessionContext(session);

    if (!viewer) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const tenantIdParam = request.nextUrl.searchParams.get('tenantId');
    const tenantId = viewer.role === 'tenant' ? viewer.id : tenantIdParam || undefined;

    if (viewer.role !== 'owner' && !tenantId) {
      return NextResponse.json({ success: false, error: 'tenantId is required' }, { status: 400 });
    }

    const messages = await listTenantMessages({ tenantId });
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tenant messages';
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

    if (viewer.role !== 'owner' && viewer.role !== 'tenant') {
      return NextResponse.json({ success: false, error: 'Only tenants and owners can create drafts' }, { status: 403 });
    }

    const body = await request.json();
    if (!body?.body || typeof body.body !== 'string') {
      return NextResponse.json({ success: false, error: 'body is required' }, { status: 400 });
    }

    const message = await createTenantMessage({
      tenantId: viewer.role === 'tenant' ? viewer.id : (body.tenantId as string | undefined) || viewer.id,
      tenantName: viewer.role === 'tenant' ? viewer.name : ((body.tenantName as string | undefined) || viewer.name),
      propertyId: (body.propertyId as string | undefined) || viewer.propertyIds[0],
      propertyLabel: (body.propertyLabel as string | undefined)?.trim(),
      unitId: body.unitId as string | undefined,
      unitLabel: (body.unitLabel as string | undefined)?.trim(),
      subject: body.subject as string | undefined,
      body: body.body,
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create tenant message';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
