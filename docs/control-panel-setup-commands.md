# PropertyOpsAI Owner Control Panel - Repository Initialization Commands

## 1. Project Initialization

```bash
# Create Next.js 15+ app with App Router, TypeScript, ESLint, and Tailwind CSS
npx create-next-app@latest control-panel --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm

cd control-panel
```

## 2. Directory Structure

```bash
# Create standard app router folders
mkdir -p src/app/dashboard
mkdir -p src/app/api
mkdir -p src/components/ui
mkdir -p src/components/dashboard
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types

# Configure path aliases (already set by create-next-app with --import-alias)
# Verify tsconfig.json has: "@/*": ["./src/*"]
```

## 3. Install Dependencies

```bash
# Core dependencies (already installed by create-next-app)
# next, react, react-dom, typescript, eslint, tailwindcss, postcss, autoprefixer

# UI components - shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add card button table dialog badge skeleton toast

# Auth
npm install @auth/core next-auth

# API validation
npm install zod axios

# Icons
npm install lucide-react
```

## 4. Git & GitHub Setup

```bash
# Initialize git repository
git init

# Create initial commit
git add .
git commit -m "Initial commit: Next.js 15+ control panel with Tailwind CSS"

# Create GitHub repo (requires GitHub CLI)
gh repo create propertyopsai/control-panel --public --source=. --remote=origin --push

# Alternative: Manual GitHub repo creation
# 1. Go to github.com/new
# 2. Create repo: propertyopsai/control-panel
# 3. Run:
git remote add origin https://github.com/propertyopsai/control-panel.git
git branch -M main
git push -u origin main

# Set up main branch protection (via GitHub UI or CLI)
# GitHub UI: Settings > Branches > Add branch protection rule > main
# Or via gh CLI:
gh api repos/propertyopsai/control-panel/branches/main/protection \
  --method PUT \
  -f required_status_checks='{"strict":false,"contexts":["build"]}' \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f enforce_admins=true \
  -f restrictions='{"users":[],"teams":[],"apps":[]}'
```

## 5. Vercel Integration

```bash
# Install Vercel CLI
npm install -g vercel

# Link project to Vercel
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Configure environment variables in Vercel dashboard:
# - AUTH_SECRET (for next-auth)
# - AUTH_TRUST_HOST=true
# - DATABASE_URL (if using database)
# - TAILSCALE_AUTH_KEY (for tunneling)
# - PAPERCLIP_API_URL
# - PAPERCLIP_API_KEY
```

## 6. Initial Commit Structure

```
control-panel/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── card.tsx
│   │   │   ├── button.tsx
│   │   │   └── ...
│   │   └── dashboard/
│   │       ├── SystemMonitor.tsx
│   │       ├── TaskQueue.tsx
│   │       └── CronManager.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   └── useSystemStatus.ts
│   └── types/
│       └── index.ts
├── public/
├── .env.local.example
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 7. Environment Variables Template

Create `.env.local.example`:

```bash
# Auth
AUTH_SECRET=your-auth-secret-here
AUTH_TRUST_HOST=true

# Paperclip API
PAPERCLIP_API_URL=http://localhost:3100
PAPERCLIP_API_KEY=pcp_xxx

# Tunneling
TAILSCALE_AUTH_KEY=tskey-auth-xxx

# App
NEXT_PUBLIC_APP_URL=https://control-panel.propertyops.ai
```

## 8. Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run lint` passes
- [ ] GitHub repo is accessible
- [ ] Vercel preview deployment is live
- [ ] Environment variables are configured in Vercel
