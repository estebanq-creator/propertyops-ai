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

/**
 * Enhanced Transaction Categorization Engine
 * v2.0 - Extended vendor patterns, improved accuracy
 * 
 * Categories:
 *   - Revenue: SaaS, consulting, refunds
 *   - Infrastructure: Hosting, database, email, CDN, monitoring
 *   - Sales & Marketing: CRM, ads, analytics, content
 *   - Product & Engineering: Tools, dev services, version control
 *   - Operations: Accounting, comms, productivity, legal
 *   - Payroll: Salaries, benefits, contractors
 *   - Fees: Processing, bank, platform fees
 *   - Transfers: Internal movements
 */
function categorizeTransaction(txn) {
  const description = (txn.description + ' ' + (txn.counterpartyName || '')).toLowerCase();
  const amount = txn.amount;
  
  // Vendor patterns with confidence levels
  // Higher confidence patterns should be checked first
  
  // ==================== REVENUE ====================
  
  // Stripe payouts (primary revenue)
  if (description.includes('stripe') && description.includes('payout')) {
    return { category: 'Revenue', subcategory: 'SaaS Subscriptions', confidence: 0.98 };
  }
  if (description.includes('stripe') && !description.includes('atlas') && !description.includes('fee')) {
    return { category: 'Revenue', subcategory: 'SaaS Subscriptions', confidence: 0.92 };
  }
  
  // Other payment processors
  if (description.includes('paddle') || description.includes('lemon squeezy')) {
    return { category: 'Revenue', subcategory: 'SaaS Subscriptions', confidence: 0.95 };
  }
  if (description.includes('paypal') && description.includes('payment')) {
    return { category: 'Revenue', subcategory: 'SaaS Subscriptions', confidence: 0.88 };
  }
  
  // Refunds
  if (description.includes('refund')) {
    return { category: 'Revenue', subcategory: 'Refunds', confidence: 0.95, isRefund: true };
  }
  
  // ==================== LEGAL ====================
  
  // Entity maintenance (check before Stripe to avoid misclassification)
  if (description.includes('registered agent') || description.includes('stripe atlas') || 
      description.includes('legalzoom') || description.includes('zenbusiness') ||
      description.includes('delaware') || description.includes('incfile')) {
    return { category: 'Legal', subcategory: 'Entity Maintenance', confidence: 0.95 };
  }
  
  // Legal services
  if (description.includes('counsel') || description.includes('attorney') || 
      description.includes('legal service')) {
    return { category: 'Legal', subcategory: 'Legal Services', confidence: 0.90 };
  }
  
  // ==================== INFRASTRUCTURE ====================
  
  // Hosting & Cloud
  if (description.includes('vercel')) {
    return { category: 'Infrastructure', subcategory: 'Hosting', confidence: 0.99 };
  }
  if (description.includes('railway')) {
    return { category: 'Infrastructure', subcategory: 'Hosting', confidence: 0.99 };
  }
  if (description.includes('render')) {
    return { category: 'Infrastructure', subcategory: 'Hosting', confidence: 0.98 };
  }
  if (description.includes('fly.io') || description.includes('flyio')) {
    return { category: 'Infrastructure', subcategory: 'Hosting', confidence: 0.98 };
  }
  if (description.includes('heroku')) {
    return { category: 'Infrastructure', subcategory: 'Hosting', confidence: 0.98 };
  }
  if (description.includes('digitalocean') || description.includes('digital ocean')) {
    return { category: 'Infrastructure', subcategory: 'Hosting', confidence: 0.98 };
  }
  if (description.includes('aws') || description.includes('amazon web service')) {
    return { category: 'Infrastructure', subcategory: 'Hosting', confidence: 0.95 };
  }
  if (description.includes('gcp') || description.includes('google cloud') || description.includes('google compute')) {
    return { category: 'Infrastructure', subcategory: 'Hosting', confidence: 0.95 };
  }
  if (description.includes('azure') || description.includes('microsoft azure')) {
    return { category: 'Infrastructure', subcategory: 'Hosting', confidence: 0.95 };
  }
  
  // Database & Storage
  if (description.includes('supabase')) {
    return { category: 'Infrastructure', subcategory: 'Database', confidence: 0.99 };
  }
  if (description.includes('planetscale') || description.includes('planet scale')) {
    return { category: 'Infrastructure', subcategory: 'Database', confidence: 0.98 };
  }
  if (description.includes('neon') && (description.includes('postgres') || description.includes('database'))) {
    return { category: 'Infrastructure', subcategory: 'Database', confidence: 0.98 };
  }
  if (description.includes('mongo') || description.includes('atlas')) {
    return { category: 'Infrastructure', subcategory: 'Database', confidence: 0.95 };
  }
  if (description.includes('redis') || description.includes('upstash')) {
    return { category: 'Infrastructure', subcategory: 'Database', confidence: 0.95 };
  }
  if (description.includes('s3') || description.includes('cloudstorage') || description.includes('cloud storage')) {
    return { category: 'Infrastructure', subcategory: 'Storage', confidence: 0.90 };
  }
  
  // Email Services
  if (description.includes('sendgrid')) {
    return { category: 'Infrastructure', subcategory: 'Email', confidence: 0.98 };
  }
  if (description.includes('postmark')) {
    return { category: 'Infrastructure', subcategory: 'Email', confidence: 0.98 };
  }
  if (description.includes('mailgun')) {
    return { category: 'Infrastructure', subcategory: 'Email', confidence: 0.98 };
  }
  if (description.includes('resend')) {
    return { category: 'Infrastructure', subcategory: 'Email', confidence: 0.98 };
  }
  if (description.includes('amazon ses') || description.includes('aws ses')) {
    return { category: 'Infrastructure', subcategory: 'Email', confidence: 0.95 };
  }
  
  // CDN & Security
  if (description.includes('cloudflare')) {
    return { category: 'Infrastructure', subcategory: 'CDN & Security', confidence: 0.99 };
  }
  if (description.includes('fastly')) {
    return { category: 'Infrastructure', subcategory: 'CDN & Security', confidence: 0.98 };
  }
  if (description.includes('bunny.net') || description.includes('bunnycdn')) {
    return { category: 'Infrastructure', subcategory: 'CDN & Security', confidence: 0.95 };
  }
  
  // Monitoring & Observability
  if (description.includes('sentry')) {
    return { category: 'Infrastructure', subcategory: 'Monitoring', confidence: 0.98 };
  }
  if (description.includes('datadog')) {
    return { category: 'Infrastructure', subcategory: 'Monitoring', confidence: 0.98 };
  }
  if (description.includes('pingdom')) {
    return { category: 'Infrastructure', subcategory: 'Monitoring', confidence: 0.98 };
  }
  if (description.includes('statuspage') || description.includes('status page')) {
    return { category: 'Infrastructure', subcategory: 'Monitoring', confidence: 0.98 };
  }
  if (description.includes('uptime robot') || description.includes('uptimerobot')) {
    return { category: 'Infrastructure', subcategory: 'Monitoring', confidence: 0.95 };
  }
  if (description.includes('pagerduty') || description.includes('pager duty')) {
    return { category: 'Infrastructure', subcategory: 'Monitoring', confidence: 0.98 };
  }
  
  // ==================== SALES & MARKETING ====================
  
  // CRM
  if (description.includes('hubspot')) {
    return { category: 'Sales & Marketing', subcategory: 'CRM', confidence: 0.99 };
  }
  if (description.includes('salesforce')) {
    return { category: 'Sales & Marketing', subcategory: 'CRM', confidence: 0.98 };
  }
  if (description.includes('pipedrive')) {
    return { category: 'Sales & Marketing', subcategory: 'CRM', confidence: 0.98 };
  }
  if (description.includes('close') && description.includes('crm')) {
    return { category: 'Sales & Marketing', subcategory: 'CRM', confidence: 0.95 };
  }
  
  // Advertising
  if (description.includes('google ads')) {
    return { category: 'Sales & Marketing', subcategory: 'Advertising', confidence: 0.99 };
  }
  if (description.includes('facebook ads') || description.includes('meta ads')) {
    return { category: 'Sales & Marketing', subcategory: 'Advertising', confidence: 0.99 };
  }
  if (description.includes('linkedin ads') || description.includes('linkedin advertising')) {
    return { category: 'Sales & Marketing', subcategory: 'Advertising', confidence: 0.98 };
  }
  if (description.includes('twitter ads') || description.includes('x ads')) {
    return { category: 'Sales & Marketing', subcategory: 'Advertising', confidence: 0.95 };
  }
  if (description.includes('reddit ads')) {
    return { category: 'Sales & Marketing', subcategory: 'Advertising', confidence: 0.95 };
  }
  
  // Analytics
  if (description.includes('amplitude')) {
    return { category: 'Sales & Marketing', subcategory: 'Analytics', confidence: 0.98 };
  }
  if (description.includes('mixpanel')) {
    return { category: 'Sales & Marketing', subcategory: 'Analytics', confidence: 0.98 };
  }
  if (description.includes('posthog')) {
    return { category: 'Sales & Marketing', subcategory: 'Analytics', confidence: 0.98 };
  }
  
  // Content & SEO
  if (description.includes('buzzsprout') || description.includes('transistor')) {
    return { category: 'Sales & Marketing', subcategory: 'Content', confidence: 0.95 };
  }
  if (description.includes('ahrefs') || description.includes('semrush')) {
    return { category: 'Sales & Marketing', subcategory: 'SEO Tools', confidence: 0.95 };
  }
  
  // ==================== PRODUCT & ENGINEERING ====================
  
  // Project Management
  if (description.includes('linear')) {
    return { category: 'Product & Engineering', subcategory: 'Project Management', confidence: 0.99 };
  }
  if (description.includes('jira')) {
    return { category: 'Product & Engineering', subcategory: 'Project Management', confidence: 0.98 };
  }
  if (description.includes('asana')) {
    return { category: 'Product & Engineering', subcategory: 'Project Management', confidence: 0.98 };
  }
  if (description.includes('monday.com') || description.includes('monday com')) {
    return { category: 'Product & Engineering', subcategory: 'Project Management', confidence: 0.98 };
  }
  
  // Version Control
  if (description.includes('github')) {
    return { category: 'Product & Engineering', subcategory: 'Version Control', confidence: 0.99 };
  }
  if (description.includes('gitlab')) {
    return { category: 'Product & Engineering', subcategory: 'Version Control', confidence: 0.98 };
  }
  if (description.includes('bitbucket')) {
    return { category: 'Product & Engineering', subcategory: 'Version Control', confidence: 0.98 };
  }
  
  // CI/CD
  if (description.includes('circleci')) {
    return { category: 'Product & Engineering', subcategory: 'CI/CD', confidence: 0.98 };
  }
  if (description.includes('travis ci')) {
    return { category: 'Product & Engineering', subcategory: 'CI/CD', confidence: 0.95 };
  }
  
  // Design
  if (description.includes('figma')) {
    return { category: 'Product & Engineering', subcategory: 'Design', confidence: 0.99 };
  }
  if (description.includes('canva')) {
    return { category: 'Product & Engineering', subcategory: 'Design', confidence: 0.95 };
  }
  
  // ==================== OPERATIONS ====================
  
  // Accounting
  if (description.includes('quickbooks')) {
    return { category: 'Operations', subcategory: 'Accounting Software', confidence: 0.99 };
  }
  if (description.includes('xero')) {
    return { category: 'Operations', subcategory: 'Accounting Software', confidence: 0.98 };
  }
  if (description.includes('freshbooks')) {
    return { category: 'Operations', subcategory: 'Accounting Software', confidence: 0.98 };
  }
  if (description.includes('wave accounting')) {
    return { category: 'Operations', subcategory: 'Accounting Software', confidence: 0.95 };
  }
  
  // Communication
  if (description.includes('slack')) {
    return { category: 'Operations', subcategory: 'Communication', confidence: 0.99 };
  }
  if (description.includes('discord') && description.includes('nitro')) {
    return { category: 'Operations', subcategory: 'Communication', confidence: 0.95 };
  }
  if (description.includes('zoom')) {
    return { category: 'Operations', subcategory: 'Communication', confidence: 0.98 };
  }
  if (description.includes('google workspace') || description.includes('g suite')) {
    return { category: 'Operations', subcategory: 'Communication', confidence: 0.95 };
  }
  if (description.includes('microsoft 365') || description.includes('office 365')) {
    return { category: 'Operations', subcategory: 'Communication', confidence: 0.95 };
  }
  
  // Productivity
  if (description.includes('notion')) {
    return { category: 'Operations', subcategory: 'Productivity', confidence: 0.99 };
  }
  if (description.includes('airtable')) {
    return { category: 'Operations', subcategory: 'Productivity', confidence: 0.98 };
  }
  if (description.includes('coda')) {
    return { category: 'Operations', subcategory: 'Productivity', confidence: 0.95 };
  }
  if (description.includes('loom')) {
    return { category: 'Operations', subcategory: 'Productivity', confidence: 0.95 };
  }
  
  // ==================== PAYROLL ====================
  
  if (description.includes('gusto')) {
    return { category: 'Payroll', subcategory: 'Salary & Wages', confidence: 0.99 };
  }
  if (description.includes('payroll')) {
    return { category: 'Payroll', subcategory: 'Salary & Wages', confidence: 0.95 };
  }
  if (description.includes('deel')) {
    return { category: 'Payroll', subcategory: 'Contractor Payments', confidence: 0.98 };
  }
  if (description.includes('remote') && description.includes('team')) {
    return { category: 'Payroll', subcategory: 'Contractor Payments', confidence: 0.95 };
  }
  if (description.includes('ripcurl') || description.includes('rip curl')) {
    return { category: 'Payroll', subcategory: 'Contractor Payments', confidence: 0.95 };
  }
  if (description.includes('adp') && description.includes('payroll')) {
    return { category: 'Payroll', subcategory: 'Salary & Wages', confidence: 0.95 };
  }
  
  // ==================== FEES ====================
  
  // Stripe fees
  if (description.includes('stripe') && description.includes('fee')) {
    return { category: 'Fees', subcategory: 'Payment Processing', confidence: 0.98 };
  }
  
  // Bank fees
  if (description.includes('bank fee') || description.includes('wire fee') || 
      description.includes('ach fee') || description.includes('monthly fee')) {
    return { category: 'Fees', subcategory: 'Bank Fees', confidence: 0.90 };
  }
  
  // Generic processing fees
  if (description.includes('processing fee') || description.includes('transaction fee')) {
    return { category: 'Fees', subcategory: 'Processing Fees', confidence: 0.85 };
  }
  
  // ==================== TRANSFERS ====================
  
  if (description.includes('transfer')) {
    return { category: 'Transfers', subcategory: 'Internal Transfer', confidence: 0.80 };
  }
  if (description.includes('ach') && !description.includes('fee')) {
    return { category: 'Transfers', subcategory: 'Internal Transfer', confidence: 0.75 };
  }
  
  // ==================== INSURANCE ====================
  
  if (description.includes('insurance') && (description.includes('premium') || description.includes('policy'))) {
    return { category: 'Operations', subcategory: 'Insurance', confidence: 0.90 };
  }
  
  // ==================== TAXES ====================
  
  if (description.includes('tax payment') || description.includes('irs') || 
      description.includes('state tax') || description.includes('sales tax')) {
    return { category: 'Operations', subcategory: 'Tax Payments', confidence: 0.92 };
  }
  
  // ==================== SUBSCRIPTION SERVICES ====================
  
  // Catch-all for known SaaS patterns
  if (description.match(/\b(subscription|monthly|annual|renewal)\b/i)) {
    return { category: 'Operations', subcategory: 'Subscriptions', confidence: 0.70 };
  }
  
  // ==================== UNKNOWN ====================
  
  // Flag for manual review
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
