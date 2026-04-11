# Control Panel Component Architecture

## Overview
This document defines the modular UI component architecture for the PropertyOpsAI Owner Control Panel dashboard. The architecture follows a mobile-first, responsive design approach using shadcn/ui and Tailwind CSS.

## Component Library Choice

### shadcn/ui + Tailwind CSS
- **Rationale**: Provides a collection of accessible, customizable components built on Radix UI primitives with Tailwind styling
- **Benefits**:
  - No external dependencies beyond React and Tailwind
  - Full control over component styling and behavior
  - Accessible by default (WCAG compliant)
  - TypeScript support
  - Easy to extend and customize

### Required Primitives
- Card
- Button (with variants: primary, secondary, destructive, outline, ghost)
- Table (with sorting, filtering, pagination)
- Dialog
- DropdownMenu
- Tabs
- Badge
- Tooltip
- Alert
- Progress
- Skeleton
- Switch
- Input
- Label
- Select
- Textarea
- Checkbox
- RadioGroup
- Separator
- ScrollArea
- Accordion
- Collapsible
- Command (for search/command palettes)
- Popover
- Sheet (for mobile-friendly side panels)

## Core Components

### 1. System Monitor Dashboard

#### Agent Status Card
```tsx
interface AgentStatusCardProps {
  agent: {
    id: string;
    name: string;
    role: string;
    status: 'running' | 'idle' | 'error' | 'offline';
    lastHeartbeat: Date;
    cpuUsage: number; // 0-100
    memoryUsage: number; // 0-100
    queueDepth: number;
  };
}
```

**Features:**
- Real-time status indicator with color coding
- Heartbeat timestamp with relative time display
- Resource usage meters (CPU/Memory)
- Queue depth indicator
- Expandable detail view for full metrics

#### System Health Indicator
```tsx
interface SystemHealthProps {
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  tunnelStatus: 'connected' | 'disconnected' | 'degraded';
  lastUpdated: Date;
}
```

**Features:**
- Overall system health score
- Tunnel connection status
- Last telemetry update timestamp
- Visual health meter

### 2. Task Queue Manager

#### Task List
```tsx
interface TaskListProps {
  tasks: Task[];
  onApprove: (taskId: string) => void;
  onReject: (taskId: string) => void;
  onSelect: (taskId: string) => void;
  selectedTaskId?: string;
}
```

**Features:**
- Sortable columns (priority, status, created, due)
- Filterable by status, assignee, type
- Bulk selection for batch operations
- Status badges with color coding
- Priority indicators
- Action buttons (approve/reject)

#### Task Detail View
```tsx
interface TaskDetailProps {
  task: Task;
  onApprove: () => void;
  onReject: () => void;
  onComment: (comment: string) => void;
}
```

**Features:**
- Full task description
- Priority and status indicators
- Assignee information
- Timeline of task history
- Comment thread
- Action buttons (approve/reject with confirmation)
- Audit log of previous actions

### 3. Visual Cron Job Manager

#### Cron Job List
```tsx
interface CronJobListProps {
  jobs: CronJob[];
  onToggle: (jobId: string, enabled: boolean) => void;
  onTrigger: (jobId: string) => void;
  onEdit: (jobId: string) => void;
}
```

**Features:**
- Job name and description
- Next run countdown timer
- Last run status and duration
- Enable/disable toggle switch
- Manual trigger button
- Schedule summary (human-readable)

#### Cron Job Editor
```tsx
interface CronJobEditorProps {
  job?: CronJob; // undefined for new job
  onSave: (job: CronJob) => void;
  onCancel: () => void;
}
```

**Features:**
- Cron expression input with validation
- Visual schedule picker (alternative to cron syntax)
- Job name and description fields
- Enable/disable toggle
- Schedule preview showing next 5 run times
- Command/input configuration

#### Job Execution History
```tsx
interface JobExecutionHistoryProps {
  executions: CronJobExecution[];
}
```

**Features:**
- Timeline of past executions
- Status indicators (success/failure)
- Duration and timestamp
- Log output viewer
- Filter by time range

## Shared UI Patterns

### Navigation Structure
- **Primary Navigation**: Left sidebar (collapsible on mobile)
  - System Monitor
  - Task Queue
  - Cron Jobs
  - Audit Log
  - Settings

- **Secondary Navigation**: Top bar (persistent)
  - Notifications
  - User menu
  - System status indicator

### Notification System
```tsx
interface NotificationProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number; // auto-dismiss in ms
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Features:**
- Toast notifications (bottom-right)
- Banner notifications (top, for critical alerts)
- Dismissible
- Action buttons when applicable
- Notification center for history

### Loading States
- **Component-level**: Skeleton loaders matching component layout
- **Page-level**: Full-page spinner with message
- **Data-level**: Table row skeletons, card placeholders

### Error Boundaries
- **Component Error**: Graceful fallback UI with retry option
- **Page Error**: Full-page error state with navigation options
- **API Error**: Toast notification with technical details in debug mode

### Responsive Design
- **Breakpoints**:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

- **Mobile Adaptations**:
  - Bottom navigation bar for primary actions
  - Sheet components for side panels
  - Collapsible sections
  - Touch-friendly target sizes

## Component Hierarchy

```
OwnerControlPanel
├── Layout
│   ├── SidebarNavigation
│   ├── TopBar
│   └── MainContent
├── SystemMonitor
│   ├── AgentStatusGrid
│   │   └── AgentStatusCard
│   ├── SystemHealthIndicator
│   └── TunnelStatus
├── TaskQueue
│   ├── TaskToolbar
│   ├── TaskList
│   │   └── TaskListItem
│   └── TaskDetailPanel
│       ├── TaskHeader
│       ├── TaskMetadata
│       ├── TaskTimeline
│       └── TaskActions
└── CronManager
    ├── CronJobList
    │   └── CronJobListItem
    ├── CronJobDetail
    │   ├── JobInfo
    │   ├── ExecutionHistory
    │   └── JobActions
    └── CronJobEditor
```

## Build Priority

### Phase 1 (MVP)
1. Layout structure (sidebar, top bar)
2. System Monitor (basic agent status cards)
3. Task List (read-only view)
4. Task Detail (read-only)
5. Basic notifications
6. Mobile-responsive layout

### Phase 2 (Interactive)
1. Task approval/rejection workflow
2. Cron Job List (read-only)
3. Audit log viewer
4. Enhanced notifications with actions
5. Loading states and error boundaries

### Phase 3 (Full Featured)
1. Cron Job management (enable/disable/trigger)
2. Cron Job Editor
3. Advanced filtering and search
4. Bulk operations
5. Export features

## Reusable Component Patterns

### Data Table Pattern
```tsx
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowSelect?: (row: TData) => void;
  selectedRowId?: string;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPageChange: (pageIndex: number) => void;
  };
  sorting?: {
    columnId: string;
    direction: 'asc' | 'desc';
    onSortChange: (columnId: string) => void;
  };
  filtering?: {
    filters: Filter[];
    onFilterChange: (filters: Filter[]) => void;
  };
}
```

### Status Badge Pattern
```tsx
interface StatusBadgeProps {
  status: 'todo' | 'in_progress' | 'blocked' | 'done' | 'error';
  size?: 'sm' | 'md' | 'lg';
}
```

### Metric Card Pattern
```tsx
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: React.ReactNode;
}
```

## Implementation Notes

1. **Accessibility**: All components must follow WCAG 2.1 AA guidelines
2. **Performance**: Use React.memo and useMemo where appropriate for large lists
3. **Internationalization**: Prepare for i18n from the start (use translation keys)
4. **Testing**: Each component should have unit tests and visual regression tests
5. **Documentation**: Storybook integration for component documentation

## Wireframes Reference

Wireframes are available in Figma at:
- [System Monitor Wireframe](https://www.figma.com/file/.../System-Monitor)
- [Task Queue Wireframe](https://www.figma.com/file/.../Task-Queue)
- [Cron Manager Wireframe](https://www.figma.com/file/.../Cron-Manager)

## Next Steps

1. Create component library initialization script
2. Implement Phase 1 components
3. Set up Storybook for documentation
4. Create visual regression tests
5. Integrate with backend APIs