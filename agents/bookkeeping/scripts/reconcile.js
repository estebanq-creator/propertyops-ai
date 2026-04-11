#!/usr/bin/env node
/**
 * Daily Reconciliation Engine
 * 
 * Usage: node scripts/reconcile.js [date]
 * Date format: YYYY-MM-DD (default: yesterday)
 * 
 * Matches Stripe payouts to Mercury deposits and flags discrepancies.
 * Output: Reconciliation report to stdout and file
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_DIR = path.join(process.env.HOME, '.openclaw/workspace-hermes');
const OUTPUT_DIR = path.join(WORKSPACE_DIR, 'agents/bookkeeping/output/daily-reconciliation');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function runScript(scriptName, dateStr) {
  const scriptPath = path.join(__dirname, scriptName);
  const output = execSync(`node "${scriptPath}" ${dateStr}`, { encoding: 'utf8' });
  return JSON.parse(output);
}

function matchPayoutToDeposit(payout, transactions) {
  const payoutAmount = payout.amount;
  const payoutDate = new Date(payout.arrivalDate || payout.createdDate);
  
  // Look for matching credit transaction
  const matches = transactions.filter(t => {
    if (t.type !== 'credit') return false;
    
    // Amount match (within $1 for small discrepancies)
    const amountDiff = Math.abs(t.amount - payoutAmount);
    if (amountDiff > 100) return false; // More than $1 difference
    
    // Date match (within 2 business days)
    const txnDate = new Date(t.postedAt || t.createdAt);
    const daysDiff = Math.abs(payoutDate - txnDate) / (1000 * 60 * 60 * 24);
    if (daysDiff > 2) return false;
    
    return true;
  });
  
  if (matches.length === 0) {
    return { matched: false, reason: 'No matching deposit found' };
  }
  
  if (matches.length === 1) {
    return {
      matched: true,
      transaction: matches[0],
      discrepancy: payoutAmount - matches[0].amount
    };
  }
  
  // Multiple matches - pick closest amount
  const bestMatch = matches.reduce((best, curr) => {
    const currDiff = Math.abs(curr.amount - payoutAmount);
    const bestDiff = Math.abs(best.amount - payoutAmount);
    return currDiff < bestDiff ? curr : best;
  });
  
  return {
    matched: true,
    transaction: bestMatch,
    discrepancy: payoutAmount - bestMatch.amount,
    note: `${matches.length} potential matches, selected closest amount`
  };
}

function categorizeTransaction(txn) {
  const description = (txn.description + ' ' + (txn.counterpartyName || '')).toLowerCase();
  const amount = txn.amount;
  
  // Revenue
  if (description.includes('stripe') || description.includes('payout')) {
    return { category: 'Revenue', subcategory: 'SaaS Subscriptions', confidence: 0.95 };
  }
  
  // Infrastructure
  if (description.includes('vercel')) {
    return { category: 'Infrastructure', subcategory: 'Hosting', confidence: 0.98 };
  }
  if (description.includes('railway')) {
    return { category: 'Infrastructure', subcategory: 'Hosting', confidence: 0.98 };
  }
  if (description.includes('supabase')) {
    return { category: 'Infrastructure', subcategory: 'Database', confidence: 0.98 };
  }
  if (description.includes('sendgrid') || description.includes('postmark')) {
    return { category: 'Infrastructure', subcategory: 'Email', confidence: 0.95 };
  }
  if (description.includes('uptime') || description.includes('pingdom') || description.includes('statuspage')) {
    return { category: 'Infrastructure', subcategory: 'Monitoring', confidence: 0.90 };
  }
  
  // Sales & Marketing
  if (description.includes('hubspot')) {
    return { category: 'Sales & Marketing', subcategory: 'CRM', confidence: 0.98 };
  }
  if (description.includes('google ads') || description.includes('facebook ads')) {
    return { category: 'Sales & Marketing', subcategory: 'Advertising', confidence: 0.95 };
  }
  
  // Operations
  if (description.includes('quickbooks') || description.includes('xero')) {
    return { category: 'Operations', subcategory: 'Accounting Software', confidence: 0.98 };
  }
  if (description.includes('slack')) {
    return { category: 'Operations', subcategory: 'Communication', confidence: 0.95 };
  }
  if (description.includes('notion')) {
    return { category: 'Operations', subcategory: 'Productivity', confidence: 0.95 };
  }
  
  // Legal
  if (description.includes('registered agent') || description.includes('legalzoom') || description.includes('stripe atlas')) {
    return { category: 'Legal', subcategory: 'Entity Maintenance', confidence: 0.95 };
  }
  
  // Fees
  if (description.includes('fee') || description.includes('charge')) {
    return { category: 'Fees', subcategory: 'Processing Fees', confidence: 0.80 };
  }
  
  // Transfers
  if (description.includes('transfer') || description.includes('ach')) {
    return { category: 'Transfers', subcategory: 'Internal Transfer', confidence: 0.70 };
  }
  
  // Unknown - flag for review
  return { category: 'Unknown', subcategory: 'Requires Review', confidence: 0.0 };
}

async function reconcile(dateStr) {
  const date = dateStr || new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  console.log(`🔍 Daily Reconciliation for ${date}`);
  console.log('─'.repeat(60));
  
  try {
    // Fetch data
    console.log('\n📊 Fetching Stripe payouts...');
    const stripeData = runScript('fetch-stripe-payouts.js', date);
    console.log(`   ✅ ${stripeData.totalPayouts} payout(s), Total: $${stripeData.totalAmount / 100}`);
    
    console.log('\n📊 Fetching Mercury transactions...');
    const mercuryData = runScript('fetch-mercury-txns.js', date);
    console.log(`   ✅ ${mercuryData.transactions.length} transaction(s)`);
    console.log(`   ✅ Balance: $${mercuryData.balance.available / 100} available`);
    
    // Reconciliation
    console.log('\n🔄 Matching payouts to deposits...');
    const matches = [];
    const unmatchedPayouts = [];
    const unmatchedDeposits = [];
    
    // Match each Stripe payout
    stripeData.payouts.forEach(payout => {
      const match = matchPayoutToDeposit(payout, mercuryData.transactions);
      
      if (match.matched) {
        matches.push({
          payout: payout,
          deposit: match.transaction,
          discrepancy: match.discrepancy,
          note: match.note
        });
      } else {
        unmatchedPayouts.push({ payout, reason: match.reason });
      }
    });
    
    // Find unmatched credits (deposits without payout)
    const matchedTxnIds = matches.map(m => m.deposit.id);
    mercuryData.transactions.forEach(txn => {
      if (txn.type === 'credit' && !matchedTxnIds.includes(txn.id)) {
        unmatchedDeposits.push(txn);
      }
    });
    
    // Categorization
    console.log('\n🏷️  Categorizing transactions...');
    const categorized = mercuryData.transactions.map(txn => ({
      ...txn,
      ...categorizeTransaction(txn)
    }));
    
    const categorizedCount = categorized.filter(t => t.category !== 'Unknown').length;
    const unknownCount = categorized.filter(t => t.category === 'Unknown').length;
    const accuracy = (categorizedCount / categorized.length * 100).toFixed(1);
    console.log(`   ✅ Categorized: ${categorizedCount}/${categorized.length} (${accuracy}%)`);
    console.log(`   ⚠️  Unknown: ${unknownCount}`);
    
    // Discrepancy check
    console.log('\n⚠️  Discrepancy Check:');
    const significantDiscrepancies = matches.filter(m => Math.abs(m.discrepancy) > 10000); // >$100
    
    if (significantDiscrepancies.length > 0) {
      console.log(`   🚨 CRITICAL: ${significantDiscrepancies.length} discrepancy(ies) >$100`);
      significantDiscrepancies.forEach((m, i) => {
        console.log(`      ${i + 1}. Payout ${m.payout.id}: $${Math.abs(m.discrepancy) / 100} difference`);
      });
    } else {
      console.log('   ✅ No significant discrepancies (>$100)');
    }
    
    // Build report
    const report = {
      date: date,
      generatedAt: new Date().toISOString(),
      summary: {
        stripePayouts: stripeData.totalPayouts,
        stripeTotal: stripeData.totalAmount,
        mercuryTransactions: mercuryData.transactions.length,
        matchesFound: matches.length,
        unmatchedPayouts: unmatchedPayouts.length,
        unmatchedDeposits: unmatchedDeposits.length,
        categorizationAccuracy: parseFloat(accuracy),
        significantDiscrepancies: significantDiscrepancies.length
      },
      matches: matches.map(m => ({
        payoutId: m.payout.id,
        payoutAmount: m.payout.amount,
        depositId: m.deposit.id,
        depositAmount: m.deposit.amount,
        discrepancy: m.discrepancy,
        note: m.note
      })),
      unmatchedPayouts: unmatchedPayouts,
      unmatchedDeposits: unmatchedDeposits.map(t => ({
        id: t.id,
        amount: t.amount,
        description: t.description
      })),
      categorizedTransactions: categorized,
      unknownTransactions: categorized.filter(t => t.category === 'Unknown'),
      alerts: significantDiscrepancies.map(m => ({
        type: 'DISCREPANCY',
        severity: 'CRITICAL',
        amount: Math.abs(m.discrepancy),
        payoutId: m.payout.id,
        message: `Payout ${m.payout.id} has $${Math.abs(m.discrepancy) / 100} discrepancy`
      }))
    };
    
    // Save report
    const reportPath = path.join(OUTPUT_DIR, `${date}-reconciliation.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved: ${reportPath}`);
    
    // Output summary
    console.log('\n' + '─'.repeat(60));
    console.log('📊 RECONCILIATION SUMMARY');
    console.log('─'.repeat(60));
    console.log(`Stripe Payouts:      ${stripeData.totalPayouts} ($${stripeData.totalAmount / 100})`);
    console.log(`Mercury Transactions: ${mercuryData.transactions.length}`);
    console.log(`Matches Found:       ${matches.length}`);
    console.log(`Categorization:      ${accuracy}%`);
    console.log(`Discrepancies >$100: ${significantDiscrepancies.length}`);
    
    if (report.alerts.length > 0) {
      console.log('\n🚨 ALERTS - Immediate Review Required:');
      report.alerts.forEach(alert => {
        console.log(`   ${alert.message}`);
      });
    }
    
    // Output JSON for programmatic use
    console.log('\n--- JSON OUTPUT ---');
    console.log(JSON.stringify(report, null, 2));
    
    return report;
    
  } catch (err) {
    console.error('\n❌ Reconciliation failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Run if called directly
const dateArg = process.argv[2];
reconcile(dateArg);
