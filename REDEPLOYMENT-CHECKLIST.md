# Control Panel Redeployment Checklist

**Date:** April 7, 2026 19:43 EDT  
**Purpose:** Redeploy control panel after AUTH_SECRET is added to Vercel  
**Initiative:** PRO-28 (Security & Access Layer)

---

## Pre-Deployment Verification ✅

### 1. Directory Readiness
- ✅ Control panel directory exists: `/Users/david/.openclaw/workspace-hermes/control-panel`
- ✅ Git repository initialized and tracked
- ✅ `.vercel` directory present with project linkage
- ✅ Project ID: `prj_hjDsX8JfZAmxaCtuGjMCIXtkh1cL`
- ✅ Org ID: `team_GXFrMbvbCaNkCJOiTwJXg5Ty`

### 2. Build Configuration
- ✅ `package.json` valid (Next.js 16.2.2, React 19.2.4)
- ✅ `next.config.ts` minimal configuration (no blockers)
- ✅ `tsconfig.json` present
- ✅ Build script: `next build`
- ✅ No `vercel.json` required (Next.js auto-detection works)

### 3. Dependencies
- ✅ `node_modules` present (428KB package-lock.json)
- ✅ Vercel CLI installed: `/opt/homebrew/bin/vercel` (v50.22.1)
- ✅ All dependencies installed

### 4. Current Deployment Status
- ✅ Latest deployment: `dpl_BDnhkgTqkJRoVurwKLqv6F4dXxDL`
- ✅ Status: Ready (Production)
- ✅ URL: https://control-panel-8inc1bfww-estebanq-7865s-projects.vercel.app
- ✅ Build duration: 32s
- ⚠️ Environment variables: **None configured**

### 5. Authentication Requirements
- 🔴 **AUTH_SECRET must be added to Vercel before redeployment**
- 🔴 Current `.env.local` has empty `AUTH_SECRET=`
- 🔴 Vercel env list shows: "No Environment Variables found"

---

## Required Steps

### Step 1: Generate AUTH_SECRET (David)
```bash
# Generate a secure random string (32 bytes, base64 encoded)
openssl rand -base64 32
```

**Example output:** `xJ7kR9mN2pQ5vL8wY3tH6zB4cF1dG0sA9eK7iM4uO2=`

⚠️ **Save this value securely** - it will be needed for future deployments

### Step 2: Add AUTH_SECRET to Vercel (David)

**Option A: CLI**
```bash
cd /Users/david/.openclaw/workspace-hermes/control-panel
vercel env add AUTH_SECRET
# Paste the generated secret when prompted
# Select: Production, Preview, Development (all environments)
```

**Option B: Vercel Dashboard**
1. Visit: https://vercel.com/estebanq-7865s-projects/control-panel/settings/environment-variables
2. Click "Add New"
3. Name: `AUTH_SECRET`
4. Value: (paste generated secret)
5. Environments: ✅ Production ✅ Preview ✅ Development
6. Click "Save"

### Step 3: Confirm AUTH_SECRET Added (Subagent)
```bash
vercel env list
# Should show: AUTH_SECRET (masked value)
```

### Step 4: Execute Redeployment (Subagent)
```bash
cd /Users/david/.openclaw/workspace-hermes/control-panel
vercel --prod --yes
```

**Expected output:**
- Build starts
- Next.js compilation
- Deployment completes
- New production URL displayed

### Step 5: Verify Deployment (Subagent)
```bash
# Check deployment status
vercel ls

# Verify environment variables are active
vercel env list
```

### Step 6: Test Portal Access (David)
1. Visit: https://control-panel-8inc1bfww-estebanq-7865s-projects.vercel.app/auth/signin
2. Login with test credentials:
   - Email: `admin@propertyops.ai`
   - Password: `temp123`
3. Verify redirect to `/owner` dashboard
4. Navigate to `/owner/review-gate`
5. Confirm 0/50 counter visible

---

## Post-Deployment Verification

### Environment Variables (Production)
| Variable | Required | Status |
|----------|----------|--------|
| `AUTH_SECRET` | ✅ Critical | ⏳ Pending |
| `NODE_ENV` | ⚠️ Recommended | ⏳ Not set |
| `AUTH_TRUST_HOST` | ⚠️ Recommended | ⏳ Not set |
| `NEXT_PUBLIC_APP_URL` | ⚠️ Recommended | ⏳ Not set |
| `PAPERCLIP_API_URL` | 🔵 Phase 2 | ⏳ Not set |
| `PAPERCLIP_API_KEY` | 🔵 Phase 2 | ⏳ Not set |

### Functional Tests
- [ ] Authentication flow works (signin → dashboard)
- [ ] Session persists (refresh doesn't logout)
- [ ] Owner dashboard accessible at `/owner`
- [ ] Review gate accessible at `/owner/review-gate`
- [ ] Laura portal accessible at `/landlord`
- [ ] Disclaimer footer visible on all pages
- [ ] 0/50 counter displays correctly

---

## Rollback Plan

If deployment fails:

1. **Check build logs:**
   ```bash
   vercel ls
   # Click failed deployment → View Build Logs
   ```

2. **Common issues:**
   - Missing environment variables → Add and redeploy
   - Build errors → Check `next build` locally first
   - TypeScript errors → Fix and commit

3. **Previous deployment still active:**
   - Vercel keeps previous deployment live until new one succeeds
   - No downtime during redeployment

---

## Notes

- **Current deployment is healthy** - no urgent need to redeploy except for AUTH_SECRET
- **AUTH_SECRET is critical** for NextAuth session management in production
- **Without AUTH_SECRET**, NextAuth will throw errors in production
- **Development auth** accepts any credentials (hardcoded to owner role)
- **Phase 2** will require Paperclip API integration for real authentication

---

## Subagent Task Status

**Spawned:** April 7, 2026 19:43 EDT  
**Task:** Prepare control panel for redeployment after AUTH_SECRET is added  

**Completed:**
- ✅ Verified control-panel directory readiness
- ✅ Checked package.json and build configuration
- ✅ Prepared vercel deploy command
- ✅ Documented pre-deployment checks (this file)

**Pending:**
- ⏳ Wait for confirmation that AUTH_SECRET has been added to Vercel
- ⏳ Execute: `vercel --prod --yes`
- ⏳ Verify deployment succeeds
- ⏳ Report deployment status and portal URL

---

**Ready for Step 3 execution once David confirms AUTH_SECRET is added.**
