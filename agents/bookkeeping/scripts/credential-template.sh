#!/bin/bash
# Credential Setup Script for Bookkeeping Agent
# Run this to create credential files with proper permissions

CREDENTIAL_DIR="$HOME/.openclaw/credentials"

echo "🔐 Bookkeeping Agent Credential Setup"
echo "─".repeat(50)
echo ""

# Create directory if needed
mkdir -p "$CREDENTIAL_DIR"

# Stripe Test Key
echo "📝 Stripe Test API Key:"
echo "   1. Go to https://dashboard.stripe.com/test/apikeys"
echo "   2. Copy 'Secret key' (starts with sk_test_)"
echo "   3. Paste below (will be hidden):"
read -s STRIPE_TEST_KEY
echo "$STRIPE_TEST_KEY" > "$CREDENTIAL_DIR/stripe-test.key"
chmod 600 "$CREDENTIAL_DIR/stripe-test.key"
echo "   ✅ Saved to $CREDENTIAL_DIR/stripe-test.key"
echo ""

# Stripe Production Key (optional for now)
echo "📝 Stripe Production API Key (optional, press Enter to skip):"
echo "   1. Go to https://dashboard.stripe.com/apikeys"
echo "   2. Copy 'Secret key' (starts with sk_live_)"
read -s STRIPE_PROD_KEY
if [ -n "$STRIPE_PROD_KEY" ]; then
  echo "$STRIPE_PROD_KEY" > "$CREDENTIAL_DIR/stripe-prod.key"
  chmod 600 "$CREDENTIAL_DIR/stripe-prod.key"
  echo "   ✅ Saved to $CREDENTIAL_DIR/stripe-prod.key"
else
  echo "   ⏭️  Skipped (can add later)"
fi
echo ""

# Mercury API Key
echo "📝 Mercury API Key:"
echo "   1. Log into Mercury dashboard"
echo "   2. Navigate to Settings → API Access"
echo "   3. Generate API key (or contact support)"
echo "   4. Paste below:"
read -s MERCURY_KEY
echo "$MERCURY_KEY" > "$CREDENTIAL_DIR/mercury.key"
chmod 600 "$CREDENTIAL_DIR/mercury.key"
echo "   ✅ Saved to $CREDENTIAL_DIR/mercury.key"
echo ""

# Mercury Organization Config
echo "📝 Mercury Organization Configuration:"
echo "   Find these in your Mercury dashboard URL or API response"
echo "   Example URL: https://mercury.com/api/v1/organizations/ORG_ID/accounts/ACCT_ID"
read -p "   Organization ID: " ORG_ID
read -p "   Primary Account ID: " ACCT_ID

cat > "$CREDENTIAL_DIR/mercury-org.json" << EOF
{
  "organizationId": "$ORG_ID",
  "accountId": "$ACCT_ID"
}
EOF
chmod 600 "$CREDENTIAL_DIR/mercury-org.json"
echo "   ✅ Saved to $CREDENTIAL_DIR/mercury-org.json"
echo ""

echo "─".repeat(50)
echo "✅ Credential setup complete!"
echo ""
echo "🧪 Next steps:"
echo "   1. Test Stripe:  node scripts/test-stripe.js test"
echo "   2. Test Mercury: node scripts/test-mercury.js"
echo ""
