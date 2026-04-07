import { NextResponse } from 'next/server';
import { SystemHealth, Agent, UserRole } from '@/types';
import { getAgents, getHealth as getPaperclipHealth, mapAgentStatus } from '@/lib/paperclip';
import { getTunnelStatus } from '@/lib/tunnel';
import { auth } from '@/lib/auth';
import { canViewSystemHealth } from '@/lib/rbac';

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
    
    // Check if user can view system health details
    if (!canViewSystemHealth(userRole)) {
      // Return limited health info for non-owner users
      return NextResponse.json({
        status: 'healthy',
        agents: [],
        tunnelStatus: 'connected',
        lastCheck: new Date().toISOString(),
        limited: true,
        message: 'System health details restricted to owner role',
      });
    }
    
    // Fetch Paperclip API health
    const paperclipHealth = await getPaperclipHealth();
    
    // Fetch agents from Paperclip API
    const agentsData = await getAgents();
    
    // Get tunnel status
    const tunnelData = await getTunnelStatus();
    
    // Map agents to our internal format
    const agents: Agent[] = agentsData.map((agent) => ({
      id: agent.id,
      name: agent.name || `Agent ${agent.id.slice(0, 8)}`,
      ...mapAgentStatus(agent),
      adapter: agent.adapter,
    }));
    
    // Calculate system health metrics
    const totalAgents = agents.length;
    const onlineAgents = agents.filter((a) => a.status === 'online' || a.status === 'busy').length;
    const errorAgents = agents.filter((a) => a.status === 'error').length;
    const offlineAgents = agents.filter((a) => a.status === 'offline').length;
    
    // Determine overall system status
    let status: SystemHealth['status'] = 'healthy';
    if (errorAgents > 0 || tunnelData.status === 'disconnected') {
      status = 'unhealthy';
    } else if (offlineAgents > 0 || tunnelData.status === 'reconnecting') {
      status = 'degraded';
    }
    
    // Calculate uptime (simplified - based on agent availability)
    const uptime = totalAgents > 0 ? onlineAgents / totalAgents : 0;
    
    // Calculate error rate
    const errorRate = totalAgents > 0 ? errorAgents / totalAgents : 0;
    
    const health: SystemHealth = {
      status,
      agents,
      tunnelStatus: tunnelData.status,
      lastCheck: new Date().toISOString(),
      uptime,
      errorRate,
      paperclipVersion: paperclipHealth.version,
      paperclipStatus: paperclipHealth.status,
    };
    
    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Health check failed';
    const isAuthError = errorMessage.includes('401') || errorMessage.includes('403');
    const isNetworkError = errorMessage.includes('network') || errorMessage.includes('timeout');
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: errorMessage,
        errorType: isAuthError ? 'AUTH' : isNetworkError ? 'NETWORK' : 'UNKNOWN',
        tunnelStatus: 'disconnected',
        agents: [],
        lastCheck: new Date().toISOString(),
      },
      { status: isAuthError ? 401 : isNetworkError ? 503 : 500 }
    );
  }
}
