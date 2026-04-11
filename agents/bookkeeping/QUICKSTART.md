# Bookkeeping Agent - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Get API Credentials (David Only)

**Stripe:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Secret key" (starts with `sk_test_`)
3. Save to `~/.openclaw/credentials/stripe-test.key`

**Mercury:**
1. Log into Mercury dashboard
2. Go to Settings → API Access (or contact support)
3. Generate API key
4. Note Organization ID and Account ID from dashboard URL
5. Save credentials to `~/.openclaw/credentials/`

### Step 2: Run Credential Setup

```bash
cd ~/.openclaw/workspace-hermes/agents/bookkeeping
bash scripts/credential-template.sh
```

This will guide you through saving credentials securely.

### Step 3: Test Connectivity

```bash
# Test Stripe (test mode)
node scripts/test-stripe.js test

# Test Mercury
node scripts/test-mercury.js
```

Expected output: ✅ All tests passed!

### Step 4: Run First Reconciliation

```bash
# Run for yesterday (default)
node scripts/daily-run.js

# Or specify a date
node scripts/daily-run.js 2026-04-05
```

### Step 5: Review Output

Check the generated reports:
```bash
# Daily reconciliation
ls -la output/daily-reconciliation/
cat output/daily-reconciliation/2026-04-05-reconciliation.json

# Alerts (if any discrepancies >$100)
cat output/daily-reconciliation/2026-04-05-alerts.json
```

---

## 📋 Daily Workflow

**Every business day (automated or manual):**

```bash
node scripts/daily-run.js
```

**Output:**
- ✅ Reconciliation report (JSON)
- ⚠️ Alerts file (if discrepancies found)
- 📊 Summary to stdout

**Review:**
1. Check for alerts (discrepancies >$100)
2. Review unknown transactions
3. Route alerts to David if critical

---

## 📊 Monthly P&L

**Generate on 3rd business day of month:**

```bash
# Previous month (default)
node scripts/generate-pl.js

# Specific month
node scripts/generate-pl.js 2026-03
```

**Output:**
- `output/monthly-pl/YYYY-MM-pl.json` (full data)
- `output/monthly-pl/YYYY-MM-pl.txt` (human-readable)

**Route to David for review before month-end close.**

---

## 🔧 Troubleshooting

### "Credential not found"
Run the credential setup script:
```bash
bash scripts/credential-template.sh
```

Or manually:
```bash
echo "sk_test_..." > ~/.openclaw/credentials/stripe-test.key
chmod 600 ~/.openclaw/credentials/stripe-test.key
```

### "API authentication failed"
- Check API key validity in dashboard
- Ensure no extra whitespace in credential files
- Verify you're using test vs production keys correctly

### "No transactions found"
- Check date range (script defaults to yesterday)
- Verify account ID in `mercury-org.json`
- Confirm transactions exist for that date

### "Reconciliation mismatch"
- Stripe payouts may arrive next business day
- Check 2-day window in reconciliation logic
- Review unmatched payouts/deposits manually

---

## 📁 File Reference

| File | Purpose |
|------|---------|
| `README.md` | Agent overview and mission |
| `INSTRUCTIONS.md` | Behavioral guidelines |
| `scripts/test-stripe.js` | Stripe API test |
| `scripts/test-mercury.js` | Mercury API test |
| `scripts/daily-run.js` | Daily orchestration |
| `scripts/reconcile.js` | Reconciliation engine |
| `scripts/generate-pl.js` | Monthly P&L |
| `output/daily-reconciliation/` | Daily reports |
| `output/monthly-pl/` | Monthly reports |

---

## 🚨 Escalation

**Escalate to Operations Agent when:**
- Discrepancies >$100 found
- Unknown transactions accumulate (>5)
- API failures persist
- Duplicate transactions detected

**Escalate to David (CEO) when:**
- Critical financial integrity issues
- Systemic reconciliation failures
- Month-end P&L review required

---

## 🔐 Security

- All credentials stored with `chmod 600`
- Never commit credentials to git
- Financial data handled with strict access
- All actions logged and auditable
