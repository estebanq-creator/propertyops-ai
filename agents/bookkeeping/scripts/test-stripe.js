#!/usr/bin/env node
/**
 * Stripe API Connectivity Test
 * 
 * Usage: node scripts/test-stripe.js [test|prod]
 * Default: test mode
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODE = process.argv[2] || 'test';
const CREDENTIAL_PATH = path.join(
  process.env.HOME,
  '.openclaw/credentials',
  MODE === 'test' ? 'stripe-test.key' : 'stripe-prod.key'
);

console.log(`🔍 Stripe API Test (${MODE.toUpperCase()} mode)`);
console.log('─'.repeat(50));

// Load API key
let apiKey;
try {
  apiKey = fs.readFileSync(CREDENTIAL_PATH, 'utf8').trim();
  console.log(`✅ Credential loaded: ${CREDENTIAL_PATH}`);
} catch (err) {
  console.error(`❌ Credential not found: ${CREDENTIAL_PATH}`);
  console.error('\n📝 Setup required:');
  console.error(`   1. Get API key from Stripe Dashboard → Developers → API keys`);
  console.error(`   2. Save to: ${CREDENTIAL_PATH}`);
  console.error('   3. Run: chmod 600 ' + CREDENTIAL_PATH);
  process.exit(1);
}

// Test API connectivity
function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path: `/v1${endpoint}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Stripe-Version': '2024-12-18.acacia',
        'User-Agent': 'PropertyOpsAI-BookkeepingAgent/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Timeout')));
    req.end();
  });
}

async function runTests() {
  try {
    // Test 1: Account info
    console.log('\n📌 Test 1: Account Information');
    const account = await makeRequest('/account');
    console.log(`   ✅ Connected to: ${account.business_profile?.name || account.settings?.dashboard?.display_name || 'Stripe Account'}`);
    console.log(`   ✅ Account ID: ${account.id}`);
    console.log(`   ✅ Country: ${account.country}`);
    console.log(`   ✅ Charges enabled: ${account.charges_enabled}`);
    console.log(`   ✅ Payouts enabled: ${account.payouts_enabled}`);

    // Test 2: Balance
    console.log('\n📌 Test 2: Account Balance');
    const balance = await makeRequest('/balance');
    const available = balance.available.find(b => b.currency === 'usd');
    const pending = balance.pending.find(b => b.currency === 'usd');
    console.log(`   ✅ Available: $${(available?.amount || 0) / 100}`);
    console.log(`   ✅ Pending: $${(pending?.amount || 0) / 100}`);

    // Test 3: Recent payouts (last 7 days)
    console.log('\n📌 Test 3: Recent Payouts (Last 7 Days)');
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60);
    const payouts = await makeRequest(`/payouts?limit=5&created[gt]=${sevenDaysAgo}`);
    
    if (payouts.data.length === 0) {
      console.log('   ⚠️  No payouts found in last 7 days');
    } else {
      console.log(`   ✅ Found ${payouts.data.length} payout(s):`);
      payouts.data.forEach((payout, i) => {
        const date = new Date(payout.created * 1000).toLocaleDateString();
        console.log(`      ${i + 1}. ${date}: $${payout.amount / 100} → ${payout.statement_descriptor || 'Payout'}`);
      });
    }

    // Test 4: Balance transactions (for reconciliation)
    console.log('\n📌 Test 4: Balance Transactions (Last 7 Days)');
    const transactions = await makeRequest(`/balance/history?limit=5&created[gt]=${sevenDaysAgo}&type=payout`);
    
    if (transactions.data.length === 0) {
      console.log('   ⚠️  No payout transactions found');
    } else {
      console.log(`   ✅ Found ${transactions.data.length} transaction(s)`);
    }

    console.log('\n' + '─'.repeat(50));
    console.log('✅ All Stripe API tests passed!');
    console.log('\n📊 API Key Type:', apiKey.startsWith('sk_test_') ? 'TEST' : 'LIVE');
    if (apiKey.startsWith('sk_test_')) {
      console.log('⚠️  Running in TEST mode - no real money involved');
    } else {
      console.log('⚠️  Running in LIVE mode - real financial data');
    }

  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    if (err.message.includes('401')) {
      console.error('\n🔑 Authentication failed. Check API key validity.');
    } else if (err.message.includes('403')) {
      console.error('\n🚫 Permission denied. API key may lack required scopes.');
    }
    process.exit(1);
  }
}

runTests();
