# Technical Specification: PropertyOpsAI Owner Control Panel

## 1. Architecture Overview

The PropertyOpsAI Owner Control Panel is a Next.js 15+ web application deployed on Vercel utilizing the App Router for improved performance and routing capabilities. The application will be structured into modular components, facilitating maintainability and scalability.

**Tech Stack:**
- Framework: Next.js 15+ (App Router)
- Language: TypeScript 5.x
- Styling: Tailwind CSS 3.x + shadcn/ui components
- Auth: next-auth v5 (Auth.js) with Edge Middleware
- Validation: Zod for runtime schema validation
- HTTP Client: Axios with interceptors for auth/token handling
- Deployment: Vercel (preview + production environments)

**System Boundaries:**
- Cloud Layer: Vercel-hosted Next.js app (public internet)
- Tunnel Layer: Tailscale secure tunnel (private network)
- Local Layer: OpenClaw agents on landlord's machine (never directly exposed)

---

## 2. IAM Access Control (Vercel Edge Middleware)

### 2.1 Authentication Flow

**Session Management:**
- Session tokens issued via next-auth using JWT strategy (no database required for MVP)
- Tokens stored in HTTP-only, Secure, SameSite=Strict cookies
- Token lifetime: 24 hours (configurable via AUTH_SESSION_MAX_AGE)
- Refresh mechanism: Silent refresh via `/api/auth/session` endpoint on page load and every 15 minutes
- Token expiration handling:
  - If token expired: redirect to `/api/auth/signin` with callback to original URL
  - If token expiring within 5 minutes: trigger background refresh
  - If refresh fails: force re-authentication

**Token Structure (JWT Payload):**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "owner|admin|viewer",
  "iat": 1775507400,
  "exp": 1775593800,
  "companyId": "propertyops-ai"
}
```

### 2.2 Authorization Rules

**Role Definitions:**
| Role | Permissions |
|------|-------------|
| owner | Full access: view/approve/reject tasks, manage cron jobs, view audit logs, system config |
| admin | View tasks, approve/reject tasks, view cron jobs, view audit logs (no system config) |
| viewer | Read-only: view system status, view task queue, view cron job status |

**Edge Middleware Enforcement:**
```typescript
// middleware.ts (Vercel Edge)
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Token validated automatically by withAuth
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    // Role-based path protection
    if (path.startsWith('/dashboard/settings') && role !== 'owner') {
      return NextResponse.redirect(new URL('/403', req.url));
    }
    if (path.startsWith('/api/admin') && role !== 'owner' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Must have valid token
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

### 2.3 Session Security

- **CSRF Protection:** next-auth built-in CSRF token for state-changing operations
- **XSS Mitigation:** HTTP-only cookies prevent JavaScript access
- **Replay Attack Prevention:** Token includes `iat` (issued-at) timestamp; tokens older than 24h rejected
- **Logout:** Cookie cleared via `/api/auth/signout` endpoint; client-side session state reset

---

## 3. Secure Tunneling Strategy

### 3.1 Tailscale Configuration

**Recommended Approach:**
- Use Tailscale Funnel or Tailscale SSH for secure local → cloud communication
- Local agent (OpenClaw gateway) runs Tailscale daemon in tailnet
- Cloud app (Vercel) accesses local API via Tailscale IP + port

**Setup Steps:**
1. Install Tailscale on landlord's machine: `curl -fsSL https://tailscale.com/install.sh | sh`
2. Authenticate: `tailscale up --auth-key=${TAILSCALE_AUTH_KEY}`
3. Enable Tailscale SSH (optional): `tailscale set --ssh=true`
4. Obtain Tailscale IP: `tailscale ip`
5. Configure OpenClaw gateway to bind to Tailscale IP only (not 0.0.0.0)

**Environment Variables:**
```bash
# On Vercel
TAILSCALE_AUTH_KEY=tskey-auth-xxx  # One-time auth key for device enrollment
TAILNET_NAME=propertyops.tailnet   # Your tailnet name

# On local machine (OpenClaw gateway)
GATEWAY_BIND_HOST=100.x.x.x        # Tailscale IP (not 0.0.0.0)
GATEWAY_BIND_PORT=3100
```

### 3.2 Fallback: Cloudflare Tunnel

If Tailscale is not viable:
```bash
# Install cloudflared
brew install cloudflared

# Run tunnel
cloudflared tunnel --url http://localhost:3100
```

**Trade-offs:**
- Tailscale: Simpler auth, automatic key rotation, private tailnet (recommended)
- Cloudflare: Public URL (requires additional auth layer), more config overhead

### 3.3 Tunnel Health Monitoring

- **Heartbeat Endpoint:** Local agent exposes `/health` endpoint (returns 200 OK + version)
- **Cloud Polling:** Next.js app polls `/health` every 30 seconds via API route
- **Reconnection Logic:**
  - If 3 consecutive health checks fail: mark tunnel as "degraded"
  - If 10 consecutive failures: mark as "offline" and alert owner
  - Automatic reconnection: Tailscale daemon handles this; cloud app just polls

---

## 4. Security Model

### 4.1 Zero-Trust Architecture

**Principles:**
- Never trust, always verify: Every request authenticated and authorized
- Least privilege: Roles grant minimum necessary permissions
- Defense in depth: Multiple layers (auth, tunnel, encryption, audit)

**Request Flow:**
1. Browser → Vercel Edge Middleware (auth check)
2. Vercel API Route → Tailscale Tunnel (encrypted)
3. Tailscale → Local Gateway (IP whitelist)
4. Local Gateway → OpenClaw Agent (internal auth)

### 4.2 Encryption

**In Transit:**
- All external traffic: HTTPS (TLS 1.3) via Vercel
- Tunnel traffic: Tailscale WireGuard encryption (ChaCha20-Poly1305)
- Internal API calls: Mutual TLS optional for Phase 3+

**At Rest:**
- Session tokens: Encrypted via next-auth (AES-256-GCM)
- Audit logs: Encrypted at database level (if using DB) or file-level (if using JSON files)
- Environment variables: Encrypted via Vercel Secrets (never committed to Git)

### 4.3 PAM/PII Data Handling

**Data Classification:**
| Category | Examples | Handling Requirements |
|----------|----------|----------------------|
| PII (Personal Identifiable Information) | Tenant name, email, phone, SSN | Encrypt at rest, redact in logs, access logging required |
| PAM (Privileged Access Material) | Auth tokens, API keys, Tailscale auth keys | Never log, encrypt at rest, rotate every 90 days |
| Operational Data | Task status, agent health, cron schedules | Standard encryption, audit logging |

**PII Redaction Rules:**
- All logs: Redact email, phone, SSN using regex patterns before writing
- API responses: Filter PII fields unless caller has `owner` role
- Database/Storage: PII fields encrypted with separate key (envelope encryption)

**Access Controls:**
- PII access: `owner` and `admin` roles only
- PAM access: `owner` role only (via Vercel Secrets UI)
- Audit log access: All authenticated roles (read-only)

### 4.4 Security Headers (Next.js)

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
```

---

## 5. API Contracts

### 5.1 Cloud → Local Commands (OpenClaw Gateway)

**Endpoint:** `POST http://<tailscale-ip>:3100/api/v1/commands`

**Request Schema (Zod):**
```typescript
import { z } from 'zod';

const CommandSchema = z.object({
  commandId: z.string().uuid(),
  action: z.enum(['approve_task', 'reject_task', 'trigger_cron', 'enable_cron', 'disable_cron']),
  payload: z.object({
    taskId: z.string().optional(),      // For approve/reject
    cronJobId: z.string().optional(),   // For cron operations
    reason: z.string().optional(),      // For reject
  }),
  issuedAt: z.string().datetime(),
  issuedBy: z.string(),                 // User ID from auth token
});

type Command = z.infer<typeof CommandSchema>;
```

**Response Schema:**
```typescript
const CommandResponseSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'queued']),
  commandId: z.string().uuid(),
  message: z.string().optional(),
  executedAt: z.string().datetime().optional(),
});
```

**Error Handling:**
- `400 Bad Request`: Invalid schema (return Zod error details)
- `401 Unauthorized`: Invalid/missing auth token
- `403 Forbidden`: Valid token but insufficient permissions
- `500 Internal Error`: Local agent failure (retry with exponential backoff)

### 5.2 Local → Cloud Telemetry (OpenClaw → Vercel)

**Endpoint:** `POST https://<vercel-url>/api/telemetry`

**Request Schema:**
```typescript
const TelemetrySchema = z.object({
  agentId: z.string(),
  timestamp: z.string().datetime(),
  systemHealth: z.object({
    status: z.enum(['healthy', 'degraded', 'critical', 'offline']),
    cpuUsage: z.number().min(0).max(100),
    memoryUsage: z.number().min(0).max(100),
    diskUsage: z.number().min(0).max(100),
    uptime: z.number(), // seconds
  }),
  taskQueue: z.object({
    pending: z.number(),
    inProgress: z.number(),
    approved: z.number(),
    rejected: z.number(),
  }),
  tunnelStatus: z.object({
    connected: z.boolean(),
    lastHeartbeat: z.string().datetime(),
    latencyMs: z.number().optional(),
  }),
  alerts: z.array(z.object({
    severity: z.enum(['info', 'warning', 'error', 'critical']),
    message: z.string(),
    timestamp: z.string().datetime(),
  })).optional(),
});

type Telemetry = z.infer<typeof TelemetrySchema>;
```

**Response:** `202 Accepted` (async processing; telemetry stored in-memory or DB)

**Authentication:**
- Local agent includes `X-API-Key` header (pre-shared key configured in OpenClaw)
- Vercel API route validates key against `PAPERCLIP_API_KEY` env var

---

## 6. Deployment Pipeline

### 6.1 Vercel Project Configuration

**GitHub Integration:**
- Connect GitHub repo `propertyopsai/control-panel` to Vercel
- Auto-deploy on push to `main` branch (production)
- Auto-deploy on PR creation (preview environment)

**Environment Variables (Vercel Dashboard):**
```bash
# Auth
AUTH_SECRET=<32-byte-random-hex>          # Generate: openssl rand -hex 32
AUTH_TRUST_HOST=true                       # Required for Vercel deployment

# Paperclip/OpenClaw
PAPERCLIP_API_URL=http://<tailscale-ip>:3100
PAPERCLIP_API_KEY=pcp_<random-secret>      # Generate: openssl rand -hex 16

# Tunneling
TAILSCALE_AUTH_KEY=tskey-auth-<key>        # From Tailscale dashboard
TAILNET_NAME=propertyops.tailnet

# App
NEXT_PUBLIC_APP_URL=https://control-panel.propertyops.ai
NODE_ENV=production
```

**Build Settings:**
- Framework Preset: Next.js
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `.next` (default)

### 6.2 CI/CD Pipeline

**GitHub Actions (`.github/workflows/ci.yml`):**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test -- --coverage

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 6.3 Rollback Procedure

**Automatic Rollback (Vercel):**
1. Go to Vercel Dashboard → Project → Deployments
2. Find last known-good deployment
3. Click "Promote to Production"
4. Vercel instantly rolls back (no downtime)

**Manual Rollback (GitHub):**
```bash
# Revert last commit if it caused issues
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <good-commit-sha>
git push --force origin main
```

**Post-Rollback Checklist:**
- [ ] Verify production URL loads correctly
- [ ] Check Vercel function logs for errors
- [ ] Test authentication flow
- [ ] Confirm tunnel connectivity
- [ ] Notify team via Slack/Telegram

### 6.4 Staging → Production Promotion

**Environment Strategy:**
- `main` branch → Production (live URL)
- Feature branches → Preview URLs (auto-generated per PR)
- No dedicated staging environment for MVP (use preview URLs)

**Promotion Process:**
1. Develop on feature branch
2. Open PR → triggers preview deployment
3. Test on preview URL
4. Merge to `main` → auto-promotes to production
5. Monitor Vercel Analytics for 15 minutes post-deploy

---

## 7. Audit Logging

### 7.1 What Gets Logged

**User Actions:**
- Login/logout (timestamp, user ID, IP address)
- Task approval/rejection (task ID, decision, user ID, timestamp)
- Cron job management (job ID, action, user ID, timestamp)
- Settings changes (setting name, old value, new value, user ID)

**System Events:**
- Tunnel connection/disconnection (timestamp, duration, reason)
- Agent health status changes (previous status, new status, timestamp)
- API errors (endpoint, error message, stack trace, timestamp)
- Deployment events (commit SHA, deploy URL, triggered by, timestamp)

### 7.2 Log Storage

**MVP Approach (File-Based):**
- Logs written to `logs/audit.jsonl` (JSON Lines format)
- Rotated daily (max 30 days retention)
- Stored on local machine (never in cloud for PII compliance)

**Production Approach (Database):**
- Use PostgreSQL (Vercel Postgres or Supabase)
- Table: `audit_logs` with columns: `id`, `event_type`, `user_id`, `metadata_jsonb`, `timestamp`
- Retention: 90 days (configurable via `AUDIT_LOG_RETENTION_DAYS`)

### 7.3 Retention Policy

| Log Type | Retention | Rationale |
|----------|-----------|-----------|
| User actions | 90 days | Compliance + dispute resolution |
| System events | 30 days | Operational debugging |
| API errors | 30 days | Debugging + monitoring |
| Deployment events | 1 year | Audit trail for releases |

### 7.4 Query Interface

**API Endpoint:** `GET /api/audit-logs`

**Query Parameters:**
- `startDate`: ISO 8601 date (e.g., `2026-04-01T00:00:00Z`)
- `endDate`: ISO 8601 date
- `eventType`: Filter by event type (e.g., `task_approved`)
- `userId`: Filter by user ID
- `limit`: Max results (default 100, max 1000)

**Response:**
```json
{
  "logs": [
    {
      "id": "log_abc123",
      "eventType": "task_approved",
      "userId": "user_xyz",
      "metadata": {
        "taskId": "task_456",
        "taskName": "Screen tenant application",
        "decision": "approved"
      },
      "timestamp": "2026-04-06T20:29:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 100,
    "hasMore": false
  }
}
```

**Export:**
- CSV export available via `GET /api/audit-logs?format=csv`
- PDF report generation (Phase 3+)

### 7.5 Compliance Mapping

| Requirement | Implementation |
|-------------|----------------|
| Fair Housing: Non-discriminatory screening | Audit log captures all screening decisions + rationale |
| PAM/PII: Access logging | All PII access logged with user ID + timestamp |
| SOC 2: Change management | Deployment events + settings changes logged |
| GDPR: Right to access | Audit log export supports data subject requests |

---

## 8. Monitoring & Alerting

### 8.1 Health Checks

**Endpoints:**
- `/api/health`: Returns 200 OK if app is running
- `/api/health/ready`: Returns 200 OK if app + tunnel + agents are healthy

**Metrics Tracked:**
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Tunnel latency
- Agent uptime

### 8.2 Alerting Rules

| Condition | Severity | Notification Channel |
|-----------|----------|---------------------|
| Tunnel offline > 5 min | Critical | Email + SMS + Push |
| Agent health = critical | High | Email + Push |
| Error rate > 5% (5 min window) | High | Email |
| Deployment failure | Medium | Email |
| Auth failures > 10 (1 hour) | Medium | Email |

**Notification Integration:**
- Use `resend` for email (Phase 1)
- Use Twilio for SMS (Phase 2)
- Use Telegram bot for push (Phase 2)

---

## 9. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page load time (3G) | < 2s | Vercel Analytics |
| API response time (p95) | < 500ms | Vercel Function Logs |
| Search results | < 500ms | Custom instrumentation |
| Export generation | < 5s | API latency tracking |
| Uptime | 99.9% | UptimeRobot or Pingdom |

---

## 10. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-06 | ProdEng | Initial draft |
| 1.1 | 2026-04-06 | ProdEng | Added IAM flow, API schemas, deployment pipeline, audit logging, PAM/PII handling |

---

## Approval Status

- [ ] Hermes Approval: **Conditional** (pending expansion of 5 sections - IN PROGRESS)
- [ ] Final Approval: Pending
- [ ] Engineering Ready: No (awaiting final approval)
