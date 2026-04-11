#!/usr/bin/env node
/**
 * Fetch Daily Mercury Transactions
 * 
 * Usage: node scripts/fetch-mercury-txns.js [date]
 * Date format: YYYY-MM-DD (default: yesterday)
 * 
 * Output: JSON array of transactions to stdout
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CREDENTIAL_DIR = path.join(process.env.HOME, '.openclaw/credentials');
const API_KEY_PATH = path.join(CREDENTIAL_DIR, 'mercury.key');
const ORG_CONFIG_PATH = path.join(CREDENTIAL_DIR, 'mercury-org.json');

function getDateRange(dateStr) {
  let date;
  if (dateStr) {
    date = new Date(dateStr);
  } else {
    // Default to yesterday
    date = new Date();
    date.setDate(date.getDate() - 1);
  }
  
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    date: date.toISOString().split('T')[0]
  };
}

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const apiKey = fs.readFileSync(API_KEY_PATH, 'utf8').trim();
    const orgConfig = JSON.parse(fs.readFileSync(ORG_CONFIG_PATH, 'utf8'));
    
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

async function fetchTransactions(dateStr) {
  const { start, end, date } = getDateRange(dateStr);
  const orgConfig = JSON.parse(fs.readFileSync(ORG_CONFIG_PATH, 'utf8'));
  
  try {
    // Fetch transactions
    const response = await makeRequest(
      `/organizations/${orgConfig.organizationId}/accounts/${orgConfig.accountId}/transactions?after=${encodeURIComponent(start)}&before=${encodeURIComponent(end)}&limit=100`
    );
    
    // Fetch balance
    const balance = await makeRequest(
      `/organizations/${orgConfig.organizationId}/accounts/${orgConfig.accountId}/balance`
    );
    
    const result = {
      date: date,
      accountId: orgConfig.accountId,
      transactions: (response.data || []).map(t => ({
        id: t.id,
        amount: t.amount,
        currency: t.currency,
        type: t.type, // 'credit' or 'debit'
        status: t.status,
        description: t.description,
        counterpartyName: t.counterpartyName,
        counterpartyAccountNumber: t.counterpartyAccountNumberLast4 
          ? `****${t.counterpartyAccountNumberLast4}` : null,
        postedAt: t.postedAt,
        createdAt: t.createdAt,
        category: t.category
      })),
      balance: {
        available: balance.available,
        current: balance.current,
        currency: balance.currency
      }
    };
    
    console.log(JSON.stringify(result, null, 2));
    return result;
    
  } catch (err) {
    console.error(JSON.stringify({ error: err.message, date: dateStr }));
    process.exit(1);
  }
}

// Run if called directly
const dateArg = process.argv[2];
fetchTransactions(dateArg);
