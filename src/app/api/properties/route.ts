// Properties API Endpoint
// Returns user's accessible properties based on RBAC

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@/types';
import { paperclipRequest } from '@/lib/paperclip';

interface Property {
  id: string;
  name: string;
  address: string;
  landlordId: string;
  unitCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET() {
  try {
    // Get authenticated user
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userRole = (session.user as any).role as UserRole;
    const userId = (session.user as any).id as string;
    const userPropertyIds = (session.user as any).propertyIds as string[] || [];
    const landlordId = (session.user as any).landlordId as string | undefined;
    
    // Fetch all properties from Paperclip API
    // TODO: Replace with actual properties endpoint when available
    // For now, we'll fetch from companies endpoint as a placeholder
    const companyId = process.env.PAPERCLIP_COMPANY_ID || 'edea9103-a49f-487f-901f-05b2753b965d';
    
    let allProperties: Property[] = [];
    
    try {
      // Try to fetch properties (this endpoint may not exist yet)
      allProperties = await paperclipRequest<Property[]>(
        `/companies/${companyId}/properties`
      );
    } catch (error) {
      // Properties endpoint not available yet - return empty array
      // This is expected in Phase 2
      console.log('Properties endpoint not available, returning empty array');
      allProperties = [];
    }
    
    // Apply property scoping based on user role
    let accessibleProperties: Property[];
    
    if (userRole === 'owner') {
      // Owner sees all properties
      accessibleProperties = allProperties;
    } else if (userRole === 'landlord') {
      // Landlord sees only their properties
      accessibleProperties = allProperties.filter(
        p => p.landlordId === userId
      );
    } else if (userRole === 'tenant') {
      // Tenant sees only their assigned property
      accessibleProperties = allProperties.filter(
        p => userPropertyIds.includes(p.id)
      );
    } else {
      accessibleProperties = [];
    }
    
    return NextResponse.json({
      properties: accessibleProperties,
      count: accessibleProperties.length,
      role: userRole,
    });
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch properties';
    const isAuthError = errorMessage.includes('401') || errorMessage.includes('403');
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('timeout');
    
    return NextResponse.json(
      { 
        error: errorMessage,
        errorType: isAuthError ? 'AUTH' : isNetworkError ? 'NETWORK' : 'UNKNOWN',
      },
      { status: isAuthError ? 401 : isNetworkError ? 503 : 500 }
    );
  }
}
