# Bookkeeping Agent

**PropertyOps AI | Internal Agent | Reports to: Operations Agent**

Daily Stripe/Mercury reconciliation with transaction categorization and monthly P&L generation.

## Mission

1. Connect to Stripe API (payouts, transactions)
2. Connect to Mercury API (bank transactions, balances)
3. Build daily reconciliation logic (match payouts to deposits)
4. Implement transaction categorization (revenue, expenses, fees, transfers)
5. Set up discrepancy flagging (>$100 → immediate alert)
6. Prepare monthly P&L summary template

## Exit Criteria

- [ ] Stripe + Mercury APIs connected and tested
- [ ] Daily reconciliation running autonomously
- [ ] Transaction categorization >95% accurate
- [ ] Monthly P&L template ready for David review

## Credentials Required

| Credential | Storage Location | Status |
|------------|------------------|--------|
| Stripe API Key (Test) | `~/.openclaw/credentials/stripe-test.key` | ❌ Missing |
| Stripe API Key (Prod) | `~/.openclaw/credentials/stripe-prod.key` | ❌ Missing |
| Mercury API Key | `~/.openclaw/credentials/mercury.key` | ❌ Missing |
| Mercury Organization ID | `~/.openclaw/credentials/mercury-org.json` | ❌ Missing |

## Setup Steps

1. **Obtain Credentials** (David required)
   - Stripe: Dashboard → Developers → API Keys
   - Mercury: Settings → API Access (or contact Mercury support)

2. **Configure Stripe CLI**
   ```bash
   stripe login
   stripe config --list
   ```

3. **Test API Connectivity**
   ```bash
   node scripts/test-stripe.js
   node scripts/test-mercury.js
   ```

## File Structure

```
agents/bookkeeping/
├── README.md                 # This file
├── INSTRUCTIONS.md           # Agent behavioral instructions
├── scripts/
│   ├── test-stripe.js        # Stripe API connectivity test
│   ├── test-mercury.js       # Mercury API connectivity test
│   ├── fetch-stripe-payouts.js   # Daily payout fetcher
│   ├── fetch-mercury-txns.js     # Daily transaction fetcher
│   ├── reconcile.js          # Reconciliation logic
│   ├── categorize.js         # Transaction categorization
│   └── generate-pl.js        # Monthly P&L generator
└── output/
    ├── daily-reconciliation/   # Daily logs
    └── monthly-pl/            # Monthly P&L reports
```

## Governance

- Financial data handled with strict security
- Discrepancies >$100 flagged immediately to David
- Monthly P&L routed for review before month-end close
- All actions must be auditable

## Next Steps

1. Obtain API credentials from David
2. Create credential files with proper permissions (chmod 600)
3. Run connectivity tests
4. Build and test reconciliation pipeline
