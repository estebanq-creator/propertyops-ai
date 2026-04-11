# Mission Control Dashboard

Real-time monitoring and management dashboard for PropertyOps AI agents. Built with Next.js 14, shadcn/ui, and TypeScript.

## Features

- **WCAG 2.1 AA Accessible**: Full keyboard navigation, ARIA labels, color contrast compliance, reduced motion support
- **Performance Optimized**: useMemo hooks, React Server Component ready, sub-2s page loads
- **Responsive Design**: Mobile-first with collapsible sidebar and adaptive grid layouts
- **Real-time Monitoring**: Agent status, resource usage, queue depth, system health

## Components

### Layout Components

- `DashboardLayout` - Main responsive layout with sidebar and top navigation
- `Sidebar` - Collapsible navigation with active state indicators
- `TopNav` - Header with search, notifications, and user menu

### Dashboard Components

- `AgentStatusCard` - Agent status with heartbeat, CPU/memory meters, queue depth
- `SystemHealthIndicator` - Overall health score, Tailscale tunnel status, telemetry timestamp
- `AgentStatusCardSkeleton` / `SystemHealthIndicatorSkeleton` - Loading states

## Installation

```bash
cd /Users/david/.openclaw/workspace-main/projects/mission-control
npm install
npm run dev
```

## Project Structure

```
mission-control/
├── app/
│   ├── globals.css          # Tailwind + CSS variables
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── dashboard/
│   │   ├── AgentStatusCard.tsx
│   │   └── SystemHealthIndicator.tsx
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopNav.tsx
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── progress.tsx
├── lib/
│   └── utils.ts             # Utility functions
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Usage Examples

### Agent Status Card

```tsx
import { AgentStatusCard } from "@/components/dashboard/AgentStatusCard"

<AgentStatusCard
  agentId="agent-001"
  agentName="Bookkeeping Agent"
  description="Handles daily reconciliation"
  metrics={{
    cpuUsage: 45.2,
    memoryUsage: 62.8,
    queueDepth: 23,
    lastHeartbeat: new Date().toISOString(),
    status: "active",
  }}
/>
```

### System Health Indicator

```tsx
import { SystemHealthIndicator } from "@/components/dashboard/SystemHealthIndicator"

<SystemHealthIndicator
  metrics={{
    overallScore: 87,
    tailscale: {
      connected: true,
      peerCount: 4,
      latency: 23,
    },
    lastTelemetryUpdate: new Date().toISOString(),
    activeAgents: 3,
    totalAgents: 4,
    systemUptime: 168,
  }}
/>
```

## Accessibility Features

- **Keyboard Navigation**: All interactive elements focusable with visible focus rings
- **Screen Reader Support**: ARIA labels, roles, and live regions
- **Color Contrast**: All text meets WCAG AA contrast ratios (4.5:1 minimum)
- **Reduced Motion**: Respects `prefers-reduced-motion` preference
- **Semantic HTML**: Proper heading hierarchy, landmark regions, time elements

## Performance Optimizations

- **useMemo**: All expensive calculations memoized (status colors, relative time, resource metrics)
- **Skeleton Loading**: Perceived performance with skeleton states during data fetch
- **Server Component Ready**: Components can be converted to RSC for static data
- **Code Splitting**: Components lazy-loaded where appropriate

## API Integration

Replace demo data in `app/page.tsx` with real API calls:

```tsx
// Fetch agents
const response = await fetch('/api/agents')
const agents = await response.json()

// Fetch system health
const healthResponse = await fetch('/api/system/health')
const metrics = await healthResponse.json()
```

## Color Coding

| Status   | Color  | Use Case                    |
|----------|--------|-----------------------------|
| Green    | Active | Healthy, connected, normal  |
| Yellow   | Idle   | Warning, moderate usage     |
| Red      | Error  | Offline, critical, high load|
| Gray     | N/A    | Unknown, disabled           |

## Next Steps

1. Connect to real telemetry API endpoints
2. Add WebSocket for real-time updates
3. Implement agent action buttons (restart, pause, view logs)
4. Add historical charts for resource usage trends
5. Create alert/notification system for status changes
