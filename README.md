# PropertyOpsAI Owner Control Panel

AI-native operations dashboard for independent landlords and small property managers (5–150 units).

## Status

**Phase:** Phase 0 → Phase 1 (MVP Dashboard)  
**PROs:** PRO-15, PRO-16, PRO-17, PRO-18, PRO-19 ✅ Complete  
**Next:** Phase 1 MVP Deployment

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.x + shadcn/ui
- **Auth:** next-auth v5 (Edge Middleware IAM)
- **Validation:** Zod
- **HTTP:** Axios / Fetch API
- **Deployment:** Vercel (Edge + Serverless)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Vercel account
- Tailscale (for secure tunneling to local Gateway)

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your credentials
# - AUTH_SECRET: Generate with `openssl rand -base64 32`
# - PAPERCLIP_API_KEY: Your Paperclip API key
# - TAILSCALE_AUTH_KEY: (optional) For automated tunnel setup

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | ✅ | Session encryption key (generate with `openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | ✅ | Set to `true` for Vercel deployment |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your app URL (e.g., `https://control-panel.propertyops.ai`) |
| `PAPERCLIP_API_URL` | ✅ | Paperclip API base URL (default: `http://127.0.0.1:3100/api`) |
| `PAPERCLIP_API_KEY` | ✅ | Your Paperclip API bearer token |
| `TAILSCALE_AUTH_KEY` | ⚠️ | For automated Tailscale setup (optional) |
| `TAILNET_NAME` | ⚠️ | Your Tailscale tailnet name (optional) |

## Project Structure

```
control-panel/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # next-auth endpoints
│   │   │   ├── health/       # System health checks
│   │   │   ├── tasks/        # Task queue management
│   │   │   ├── cron/         # Cron job management
│   │   │   └── audit/        # Audit log access
│   │   ├── auth/
│   │   │   └── signin/       # Sign-in page
│   │   ├── dashboard/        # Main dashboard (protected)
│   │   └── page.tsx          # Landing/dashboard
│   ├── components/
│   │   ├── system-monitor/   # Agent health & status
│   │   ├── task-queue/       # Task approval workflow
│   │   ├── audit-log/        # Audit trail viewer
│   │   ├── cron-jobs/        # Cron job management
│   │   └── notifications/    # Alert system
│   ├── lib/
│   │   ├── auth.ts           # next-auth configuration
│   │   ├── paperclip.ts      # Paperclip API client
│   │   └── tunnel.ts         # Tailscale/Cloudflare tunnel helpers
│   ├── hooks/                # React hooks
│   └── types/                # TypeScript types
├── .env.local                # Local environment (gitignored)
├── .env.example              # Environment template
└── README.md
```

## Features by Phase

### Phase 0: Foundation ✅
- [x] Technical specification (PRO-16)
- [x] Repository initialization (PRO-17)
- [x] Component architecture (PRO-18)
- [x] Project roadmap (PRO-19)
- [ ] Vercel project linked
- [ ] Tailscale tunnel configured

### Phase 1: MVP Dashboard (Current)
- [ ] Authentication system (next-auth v5)
- [ ] System Monitor component (agent status)
- [ ] Task queue view (read-only)
- [ ] Tunnel connectivity (local → cloud)
- [ ] Production deployment

### Phase 2: Interactive Controls
- [ ] Task approval/rejection workflow
- [ ] Cron job viewer
- [ ] Audit log viewer
- [ ] Notification system
- [ ] Mobile-responsive layout

### Phase 3: Full Operations
- [ ] Cron job management
- [ ] Advanced filtering/search
- [ ] Export/reporting (CSV, PDF)
- [ ] Security audit

### Phase 4: Scale & Polish
- [ ] Multi-owner support
- [ ] Custom dashboards
- [ ] API for integrations
- [ ] Documentation & onboarding

## Security

- All requests authenticated and authorized
- Encryption in transit (TLS) and at rest
- Zero-trust architecture: no direct exposure of local systems
- Audit logging for all user actions
- PII filtered at local agent before transmission

### Compliance

- PAM/PII handling verified
- Fair Housing compliant (no tenant screening recommendations)
- Audit trail retention: 90 days (configurable)

## Development

```bash
# Run linting
npm run lint

# Run tests (when added)
npm test

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

```bash
# Link to Vercel project
vercel link --repo

# Deploy to production
vercel --prod
```

### Environment Setup on Vercel

Set these in Vercel dashboard → Project Settings → Environment Variables:

```
AUTH_SECRET=<generate with openssl rand -base64 32>
AUTH_TRUST_HOST=true
NEXT_PUBLIC_APP_URL=https://control-panel.propertyops.ai
PAPERCLIP_API_URL=https://gateway.propertyops.ai/api
PAPERCLIP_API_KEY=<your-key>
NODE_ENV=production
```

### Tailscale Tunnel

For secure connectivity between Vercel and your local Gateway:

1. Install Tailscale on Gateway machine
2. Create auth key: https://login.tailscale.com/admin/settings/keys
3. Add to Vercel env: `TAILSCALE_AUTH_KEY`
4. Set tailnet name: `TAILNET_NAME`

## Monitoring

- Health checks: `/api/health` (30s interval)
- Error rate alert threshold: 5% (5 min window)
- Auth failure alert threshold: 10 (1 hour)
- Tunnel offline alert: 5 minutes

## Support

- Documentation: `/docs` in workspace root
- Issues: GitHub repo issues
- Discord: https://discord.com/invite/clawd

## License

Proprietary - PropertyOps AI

---

**Built with ❤️ by PropertyOps AI**
