#!/usr/bin/env node
/**
 * Mock Mercury API - Test Mode
 * 
 * Simulates Mercury bank account data for PRO-14 testing.
 * Replace with real Mercury API when production credentials are available.
 * 
 * Usage: 
 *   const mockMercury = require('./mock-mercury');
 *   const data = await mockMercury.getTransactions({ days: 7 });
 */

const crypto = require('crypto');

// Mock organization data
const ORG_DATA = {
  id: 'mock-org-propops-ai',
  name: 'PropertyOps AI (Test)',
  createdAt: '2026-01-15T00:00:00Z'
};

// Mock account data
const ACCOUNT_DATA = {
  id: 'mock-acct-operating',
  name: 'Operating Account',
  accountType: 'checking',
  currency: 'USD'
};

// Mock transaction generator - realistic patterns for SaaS business
function generateMockTransactions(options = {}) {
  const days = options.days || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const transactions = [];
  
  // Base transaction templates for a SaaS company
  const templates = [
    // Revenue (Stripe payouts)
    { type: 'credit', category: 'revenue', amount: () => rand(50000, 250000), description: () => 'Stripe Payout', counterparty: 'Stripe, Inc.' },
    
    // Infrastructure
    { type: 'debit', category: 'infrastructure', amount: () => rand(5000, 50000), description: () => 'Vercel Hosting', counterparty: 'Vercel Inc.' },
    { type: 'debit', category: 'infrastructure', amount: () => rand(2000, 15000), description: () => 'Supabase Database', counterparty: 'Supabase, Inc.' },
    { type: 'debit', category: 'infrastructure', amount: () => rand(1000, 5000), description: () => 'Cloudflare', counterparty: 'Cloudflare, Inc.' },
    
    // SaaS Tools
    { type: 'debit', category: 'software', amount: () => rand(2000, 8000), description: () => 'HubSpot CRM', counterparty: 'HubSpot, Inc.' },
    { type: 'debit', category: 'software', amount: () => rand(1000, 3000), description: () => 'SendGrid Email', counterparty: 'SendGrid' },
    { type: 'debit', category: 'software', amount: () => rand(1500, 4000), description: () => 'Linear', counterparty: 'Linear Orbit, Inc.' },
    
    // Operations
    { type: 'debit', category: 'operations', amount: () => rand(5000, 20000), description: () => 'QuickBooks Online', counterparty: 'Intuit' },
    { type: 'debit', category: 'legal', amount: () => rand(10000, 50000), description: () => 'Registered Agent', counterparty: 'Stripe Atlas' },
    
    // Payroll (if applicable)
    { type: 'debit', category: 'payroll', amount: () => rand(500000, 2000000), description: () => 'Payroll Processing', counterparty: 'Gusto' },
  ];
  
  // Generate transactions over the date range
  const now = new Date();
  let transactionCount = 0;
  
  for (let day = 0; day < days; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    // Skip weekends for business transactions
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Generate 1-5 transactions per business day
    const dailyTxns = rand(1, 5);
    
    for (let i = 0; i < dailyTxns; i++) {
      const template = templates[rand(0, templates.length - 1)];
      const hour = rand(8, 18);
      const minute = rand(0, 59);
      
      const txnDate = new Date(date);
      txnDate.setHours(hour, minute, 0, 0);
      
      transactions.push({
        id: `mock-txn-${crypto.randomBytes(8).toString('hex')}`,
        accountId: ACCOUNT_DATA.id,
        postedAt: txnDate.toISOString(),
        amount: typeof template.amount === 'function' ? template.amount() : template.amount,
        type: template.type,
        description: typeof template.description === 'function' ? template.description() : template.description,
        counterpartyName: typeof template.counterparty === 'function' ? template.counterparty() : template.counterparty,
        category: template.category,
        status: 'posted',
        runningBalance: null // Will be calculated
      });
      
      transactionCount++;
    }
  }
  
  // Sort by date (newest first, like real API)
  transactions.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  
  // Calculate running balance
  let balance = 5000000; // Start with $50,000 mock balance
  for (const txn of transactions) {
    if (txn.type === 'debit') {
      balance -= txn.amount;
    } else {
      balance += txn.amount;
    }
    txn.runningBalance = balance;
  }
  
  return transactions;
}

// Helper: random integer between min and max (inclusive)
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Mock API functions (mirror real Mercury API structure)
async function getOrganization(orgId) {
  return {
    id: ORG_DATA.id,
    name: ORG_DATA.name,
    createdAt: ORG_DATA.createdAt
  };
}

async function getAccounts(orgId) {
  return {
    data: [{
      id: ACCOUNT_DATA.id,
      name: ACCOUNT_DATA.name,
      accountType: ACCOUNT_DATA.accountType,
      currency: ACCOUNT_DATA.currency,
      createdAt: '2026-01-15T00:00:00Z'
    }]
  };
}

async function getBalance(orgId, accountId) {
  // Calculate current balance from mock transactions
  const txns = generateMockTransactions({ days: 30 });
  let balance = 5000000; // Base $50,000
  
  for (const txn of txns) {
    if (txn.type === 'debit') {
      balance -= txn.amount;
    } else {
      balance += txn.amount;
    }
  }
  
  return {
    available: balance,
    current: balance,
    currency: 'USD'
  };
}

async function getTransactions(orgId, accountId, options = {}) {
  const days = options.days || 7;
  const limit = options.limit || 50;
  
  const txns = generateMockTransactions({ days });
  
  return {
    data: txns.slice(0, limit),
    hasMore: txns.length > limit
  };
}

// Mock Stripe payout matching (for reconciliation testing)
function generateMockStripePayouts(options = {}) {
  const days = options.days || 7;
  const payouts = [];
  
  const now = new Date();
  
  for (let day = 1; day <= days; day++) {
    // Stripe payouts typically arrive 2-7 days after transaction
    // Simulate every 2-3 days for testing
    if (day % 2 === 0) {
      const payoutDate = new Date(now);
      payoutDate.setDate(payoutDate.getDate() - day);
      
      payouts.push({
        id: `mock-payout-${crypto.randomBytes(8).toString('hex')}`,
        amount: rand(50000, 250000), // $500-$2,500
        currency: 'usd',
        status: 'paid',
        arrivalDate: payoutDate.toISOString(),
        createdAt: new Date(payoutDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Stripe Payout'
      });
    }
  }
  
  return payouts;
}

module.exports = {
  // Core API functions
  getOrganization,
  getAccounts,
  getBalance,
  getTransactions,
  
  // Test helpers
  generateMockTransactions,
  generateMockStripePayouts,
  
  // Config
  ORG_DATA,
  ACCOUNT_DATA,
  
  // Mock mode flag
  isMock: true
};
