#!/usr/bin/env node
/**
 * Mercury API Connectivity Test
 * 
 * Usage: node scripts/test-mercury.js
 * 
 * Note: Mercury API requires organization ID and API key.
 * Contact Mercury support or check Settings → API Access in dashboard.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CREDENTIAL_DIR = path.join(process.env.HOME, '.openclaw/credentials');
const API_KEY_PATH = path.join(CREDENTIAL_DIR, 'mercury.key');
const ORG_CONFIG_PATH = path.join(CREDENTIAL_DIR, 'mercury-org.json');

console.log('🔍 Mercury API Test');
console.log('─'.repeat(50));

// Load credentials
let apiKey, orgConfig, isMock = false;

try {
  apiKey = fs.readFileSync(API_KEY_PATH, 'utf8').trim();
  console.log(`✅ API key loaded: ${API_KEY_PATH}`);
} catch (err) {
  console.error(`❌ API key not found: ${API_KEY_PATH}`);
  console.error('\n📝 Setup required:');
  console.error('   1. Log into Mercury dashboard');
  console.error('   2. Navigate to Settings → API Access (or contact support)');
  console.error('   3. Generate API key');
  console.error(`   4. Save to: ${API_KEY_PATH}`);
  console.error('   5. Run: chmod 600 ' + API_KEY_PATH);
  process.exit(1);
}

try {
  orgConfig = JSON.parse(fs.readFileSync(ORG_CONFIG_PATH, 'utf8'));
  console.log(`✅ Organization config loaded: ${ORG_CONFIG_PATH}`);
  
  // Check if mock mode
  if (orgConfig.mockMode) {
    isMock = true;
    console.log('🧪 MOCK MODE ENABLED - Using simulated Mercury data');
  }
} catch (err) {
  console.error(`❌ Organization config not found: ${ORG_CONFIG_PATH}`);
  console.error('\n📝 Create mercury-org.json with:');
  console.error('   {');
  console.error('     "organizationId": "your-org-id",');
  console.error('     "accountId": "your-primary-account-id"');
  console.error('   }');
  console.error('\n💡 Find these in Mercury dashboard URL or API response');
  process.exit(1);
}

// Test API connectivity
function makeRequest(endpoint) {
  // Mock mode - use simulated data
  if (isMock) {
    const mockMercury = require('./mock-mercury');
    
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Parse endpoint to determine what to return
          if (endpoint.includes('/organizations/')) {
            const orgId = endpoint.match(/\/organizations\/([^\/]+)/)?.[1];
            if (endpoint.includes('/accounts/')) {
              if (endpoint.includes('/balance')) {
                const accountId = endpoint.match(/\/accounts\/([^\/]+)/)?.[1];
                resolve(await mockMercury.getBalance(orgId, accountId));
              } else if (endpoint.includes('/transactions')) {
                const accountId = endpoint.match(/\/accounts\/([^\/]+)/)?.[1];
                const url = new URL('https://mock.local' + endpoint);
                const limit = parseInt(url.searchParams.get('limit') || '50');
                resolve(await mockMercury.getTransactions(orgId, accountId, { limit }));
              } else {
                resolve({ id: mockMercury.ACCOUNT_DATA.id, ...mockMercury.ACCOUNT_DATA });
              }
            } else {
              resolve(await mockMercury.getOrganization(orgId));
            }
          } else if (endpoint.includes('/accounts')) {
            const orgId = endpoint.match(/\/organizations\/([^\/]+)/)?.[1];
            resolve(await mockMercury.getAccounts(orgId));
          } else {
            reject(new Error('Unknown endpoint: ' + endpoint));
          }
        } catch (err) {
          reject(err);
        }
      }, 100); // Simulate network latency
    });
  }
  
  // Real API mode
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.mercury.com',
      port: 443,
      path: `/api/v1${endpoint}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
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
    // Test 1: Organization info
    console.log('\n📌 Test 1: Organization Information');
    const org = await makeRequest(`/organizations/${orgConfig.organizationId}`);
    console.log(`   ✅ Organization: ${org.name}`);
    console.log(`   ✅ ID: ${org.id}`);

    // Test 2: Account list
    console.log('\n📌 Test 2: Account List');
    const accounts = await makeRequest(`/organizations/${orgConfig.organizationId}/accounts`);
    
    if (!accounts.data || accounts.data.length === 0) {
      console.log('   ⚠️  No accounts found');
    } else {
      console.log(`   ✅ Found ${accounts.data.length} account(s):`);
      accounts.data.forEach((acct, i) => {
        const isPrimary = acct.id === orgConfig.accountId ? ' (PRIMARY)' : '';
        console.log(`      ${i + 1}. ${acct.name}${isPrimary}`);
        console.log(`          ID: ${acct.id}`);
        console.log(`          Type: ${acct.accountType}`);
      });
    }

    // Test 3: Account balance
    console.log('\n📌 Test 3: Account Balance');
    const balance = await makeRequest(
      `/organizations/${orgConfig.organizationId}/accounts/${orgConfig.accountId}/balance`
    );
    console.log(`   ✅ Available: $${balance.available}`);
    console.log(`   ✅ Current: $${balance.current}`);
    console.log(`   ✅ Currency: ${balance.currency}`);

    // Test 4: Recent transactions (last 7 days)
    console.log('\n📌 Test 4: Recent Transactions (Last 7 Days)');
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const transactions = await makeRequest(
      `/organizations/${orgConfig.organizationId}/accounts/${orgConfig.accountId}/transactions?after=${sevenDaysAgo.toISOString()}&limit=10`
    );
    
    if (!transactions.data || transactions.data.length === 0) {
      console.log('   ⚠️  No transactions found in last 7 days');
    } else {
      console.log(`   ✅ Found ${transactions.data.length} transaction(s):`);
      transactions.data.slice(0, 5).forEach((txn, i) => {
        const date = new Date(txn.postedAt).toLocaleDateString();
        const amount = txn.amount / 100;
        const type = txn.type === 'debit' ? '−' : '+';
        console.log(`      ${i + 1}. ${date}: ${type}$${Math.abs(amount)} - ${txn.counterpartyName || txn.description}`);
      });
      if (transactions.data.length > 5) {
        console.log(`      ... and ${transactions.data.length - 5} more`);
      }
    }

    console.log('\n' + '─'.repeat(50));
    if (isMock) {
      console.log('✅ All Mercury API tests passed! (MOCK MODE)');
      console.log('\n💡 Ready for production: Replace mock credentials with real Mercury API access');
    } else {
      console.log('✅ All Mercury API tests passed!');
    }

  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    if (err.message.includes('401')) {
      console.error('\n🔑 Authentication failed. Check API key validity.');
    } else if (err.message.includes('403')) {
      console.error('\n🚫 Permission denied. API key may lack required scopes.');
    } else if (err.message.includes('404')) {
      console.error('\n❓ Resource not found. Check organization/account IDs.');
    }
    process.exit(1);
  }
}

runTests();
