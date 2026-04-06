import { NextResponse } from 'next/server';
import { SystemHealth } from '@/types';

// Mock data - will be replaced with actual Paperclip API calls
const MOCK_AGENTS = [
  { id: '1', name: 'Hermes', status: 'online' as const, lastHeartbeat: new Date().toISOString() },
  { id: '2', name: 'Intel', status: 'busy' as const, lastHeartbeat: new Date().toISOString(), currentTask: 'PRO-13' },
  { id: '3', name: 'Ops', status: 'online' as const, lastHeartbeat: new Date().toISOString() },
  { id: '4', name: 'ProdEng', status: 'online' as const, lastHeartbeat: new Date().toISOString() },
  { id: '5', name: 'Laura', status: 'offline' as const, lastHeartbeat: new Date(Date.now() - 3600000).toISOString() },
];

export async function GET() {
  try {
    // TODO: Replace with actual Paperclip API call to fetch agent status
    // const response = await fetch(`${process.env.PAPERCLIP_API_URL}/agents`, {
    //   headers: { Authorization: `Bearer ${process.env.PAPERCLIP_API_KEY}` },
    // });
    // const agents = await response.json();

    const health: SystemHealth = {
      status: 'healthy',
      agents: MOCK_AGENTS,
      tunnelStatus: 'connected',
      lastCheck: new Date().toISOString(),
      uptime: 0.999,
      errorRate: 0.01,
    };

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}
