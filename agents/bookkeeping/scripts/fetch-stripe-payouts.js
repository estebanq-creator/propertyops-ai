#!/usr/bin/env node
/**
 * Fetch Daily Stripe Payouts
 * 
 * Usage: node scripts/fetch-stripe-payouts.js [date]
 * Date format: YYYY-MM-DD (default: yesterday)
 * 
 * Output: JSON array of payouts to stdout
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CREDENTIAL_PATH = path.join(process.env.HOME, '.openclaw/credentials', 'stripe-prod.key');
const TEST_CREDENTIAL_PATH = path.join(process.env.HOME, '.openclaw/credentials', 'stripe-test.key');

// Use prod key if exists, otherwise test
const API_KEY_PATH = fs.existsSync(CREDENTIAL_PATH) ? CREDENTIAL_PATH : TEST_CREDENTIAL_PATH;
const MODE = API_KEY_PATH.includes('test') ? 'test' : 'prod';

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
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000),
    date: date.toISOString().split('T')[0]
  };
}

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const apiKey = fs.readFileSync(API_KEY_PATH, 'utf8').trim();
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

async function fetchPayouts(dateStr) {
  const { start, end, date } = getDateRange(dateStr);
  
  try {
    const payouts = await makeRequest(`/payouts?limit=100&created[gt]=${start}&created[lte]=${end}`);
    
    const result = {
      date: date,
      mode: MODE,
      totalPayouts: payouts.data.length,
      totalAmount: payouts.data.reduce((sum, p) => sum + p.amount, 0),
      currency: 'usd',
      payouts: payouts.data.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        created: p.created,
        createdDate: new Date(p.created * 1000).toISOString(),
        status: p.status,
        arrivalDate: p.arrival_date ? new Date(p.arrival_date * 1000).toISOString() : null,
        statementDescriptor: p.statement_descriptor,
        description: p.description
      }))
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
fetchPayouts(dateArg);
