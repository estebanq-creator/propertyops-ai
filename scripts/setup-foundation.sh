#!/bin/bash
# PropertyOps AI Control Panel - Foundation Setup Script
# Next.js 15+ | TypeScript | Tailwind CSS 3.x | shadcn/ui | next-auth v5
#
# Usage: ./scripts/setup-foundation.sh

set -e

echo "🔧 PropertyOps AI Control Panel - Foundation Setup"
echo "=================================================="
echo ""

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required (you have $(node --version))"
  exit 1
fi
echo "✅ Node.js version: $(node --version)"

# Check if in control-panel directory
if [ ! -f "package.json" ]; then
  echo "❌ Run this script from the control-panel directory"
  exit 1
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Generate auth secret if not set
if [ ! -f ".env.local" ]; then
  echo ""
  echo "🔐 Generating .env.local with secure random secret..."
  AUTH_SECRET=$(openssl rand -base64 32)
  cat > .env.local << EOF
# PropertyOpsAI Control Panel - Local Environment
# Generated: $(date)

# Auth (next-auth v5 / Auth.js)
AUTH_SECRET=${AUTH_SECRET}
AUTH_SESSION_MAX_AGE=86400
AUTH_TRUST_HOST=true

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Paperclip API (Local Gateway)
PAPERCLIP_API_URL=http://127.0.0.1:3100/api
PAPERCLIP_API_KEY=<load-from-authoritative-paperclip-api-key.json>

# Audit & Monitoring
AUDIT_LOG_RETENTION_DAYS=90
HEALTH_CHECK_INTERVAL_MS=30000
TELEMETRY_FLUSH_INTERVAL_MS=15000

# Alerts
TUNNEL_OFFLINE_ALERT_THRESHOLD_MS=300000
ERROR_RATE_ALERT_THRESHOLD=0.05
AUTH_FAILURE_ALERT_THRESHOLD=10

# Performance Targets
PAGE_LOAD_TARGET_MS=2000
API_RESPONSE_TARGET_MS=500
UPTIME_TARGET=0.999
EOF
  echo "✅ .env.local created with secure random secret"
else
  echo "✅ .env.local already exists"
fi

# Initialize shadcn/ui if not already done
if [ ! -f "components.json" ]; then
  echo ""
  echo "🎨 Initializing shadcn/ui..."
  npx shadcn@latest init -d
  echo "✅ shadcn/ui initialized"
else
  echo "✅ shadcn/ui already configured"
fi

# Install essential shadcn components
echo ""
echo "🧩 Installing essential shadcn/ui components..."
npx shadcn@latest add button card input label avatar dropdown-menu -y
echo "✅ shadcn/ui components installed"

# Verify build
echo ""
echo "🔨 Verifying build..."
npm run build

echo ""
echo "=================================================="
echo "✅ Foundation setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update PAPERCLIP_API_KEY in .env.local"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Visit http://localhost:3000"
echo ""
echo "Security configuration:"
echo "  - JWT sessions (24h lifetime)"
echo "  - Silent token refresh (15min interval)"
echo "  - HTTP-only, Secure, SameSite=Strict cookies"
echo "  - RBAC middleware (owner/landlord/tenant roles)"
echo ""
echo "Documentation:"
echo "  - SECURITY-CONFIG.md — Authentication & authorization details"
echo "  - README.md — Project overview"
echo "=================================================="
