#!/usr/bin/env node
/**
 * Daily Bookkeeping Runner
 * 
 * Usage: node scripts/daily-run.js [date]
 * Date format: YYYY-MM-DD (default: yesterday)
 * 
 * Orchestrates daily reconciliation workflow:
 * 1. Fetch Stripe payouts
 * 2. Fetch Mercury transactions
 * 3. Reconcile and categorize
 * 4. Generate alerts for discrepancies
 * 5. Output daily report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = path.join(process.env.HOME, '.openclaw/workspace-hermes');
const OUTPUT_DIR = path.join(WORKSPACE_DIR, 'agents/bookkeeping/output/daily-reconciliation');

function checkCredentials() {
  const credentialDir = path.join(process.env.HOME, '.openclaw/credentials');
  const required = ['stripe-test.key', 'mercury.key', 'mercury-org.json'];
  
  const missing = required.filter(file => !fs.existsSync(path.join(credentialDir, file)));
  
  if (missing.length > 0) {
    console.error('❌ Missing credentials:');
    missing.forEach(f => console.error(`   • ${f}`));
    console.error('\n📝 Run setup script first:');
    console.error('   bash scripts/credential-template.sh');
    console.error('\nOr manually create credential files.');
    process.exit(1);
  }
  
  console.log('✅ Credentials verified');
}

function runScript(scriptName, args = '') {
  const scriptPath = path.join(__dirname, scriptName);
  const cmd = `node "${scriptPath}" ${args}`;
  return execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
}

function dailyRun(dateStr) {
  const date = dateStr || new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  console.log('🚀 PropertyOps AI Bookkeeping Agent');
  console.log('─'.repeat(60));
  console.log(`Daily Reconciliation Run: ${date}`);
  console.log('─'.repeat(60));
  
  // Check credentials
  checkCredentials();
  
  try {
    // Step 1: Fetch Stripe payouts
    console.log('\n📊 Step 1: Fetching Stripe payouts...');
    const stripeOutput = runScript('fetch-stripe-payouts.js', date);
    const stripeData = JSON.parse(stripeOutput);
    console.log(`   ✅ ${stripeData.totalPayouts} payout(s), Total: $${stripeData.totalAmount / 100}`);
    
    // Step 2: Fetch Mercury transactions
    console.log('\n📊 Step 2: Fetching Mercury transactions...');
    const mercuryOutput = runScript('fetch-mercury-txns.js', date);
    const mercuryData = JSON.parse(mercuryOutput);
    console.log(`   ✅ ${mercuryData.transactions.length} transaction(s)`);
    
    // Step 3: Run reconciliation
    console.log('\n🔄 Step 3: Running reconciliation...');
    const reconcileOutput = runScript('reconcile.js', date);
    
    // Parse reconciliation result
    const jsonStart = reconcileOutput.indexOf('--- JSON OUTPUT ---');
    const jsonStr = jsonStart > 0 
      ? reconcileOutput.substring(jsonStart + 19)
      : reconcileOutput;
    
    const report = JSON.parse(jsonStr.trim());
    
    // Step 4: Check for alerts
    console.log('\n⚠️  Step 4: Alert Check');
    if (report.alerts && report.alerts.length > 0) {
      console.log(`   🚨 CRITICAL: ${report.alerts.length} alert(s) require immediate attention`);
      report.alerts.forEach(alert => {
        console.log(`      • [${alert.severity}] ${alert.message}`);
      });
      
      // Save alerts for external notification
      const alertPath = path.join(OUTPUT_DIR, `${date}-alerts.json`);
      fs.writeFileSync(alertPath, JSON.stringify(report.alerts, null, 2));
      console.log(`   💾 Alerts saved: ${alertPath}`);
    } else {
      console.log('   ✅ No critical alerts');
    }
    
    // Step 5: Summary
    console.log('\n' + '─'.repeat(60));
    console.log('📊 DAILY SUMMARY');
    console.log('─'.repeat(60));
    console.log(`Date:                  ${date}`);
    console.log(`Stripe Payouts:        ${report.summary.stripePayouts} ($${report.summary.stripeTotal / 100})`);
    console.log(`Mercury Transactions:  ${report.summary.mercuryTransactions}`);
    console.log(`Matches Found:         ${report.summary.matchesFound}`);
    console.log(`Categorization:        ${report.summary.categorizationAccuracy}%`);
    console.log(`Discrepancies >$100:   ${report.summary.significantDiscrepancies}`);
    console.log(`Unknown Transactions:  ${report.unknownTransactions?.length || 0}`);
    
    // Status determination
    let status = '✅ COMPLETE';
    if (report.summary.significantDiscrepancies > 0) {
      status = '🚨 REQUIRES REVIEW';
    } else if ((report.unknownTransactions?.length || 0) > 0) {
      status = '⚠️  PARTIAL - Unknown transactions';
    }
    
    console.log(`\nStatus: ${status}`);
    console.log('─'.repeat(60));
    
    return {
      success: true,
      date: date,
      status: status,
      report: report,
      alertsCount: report.alerts?.length || 0
    };
    
  } catch (err) {
    console.error('\n❌ Daily run failed:', err.message);
    console.error('\nStack trace:', err.stack);
    
    // Save error report
    const errorReport = {
      date: date,
      error: err.message,
      timestamp: new Date().toISOString()
    };
    
    const errorPath = path.join(OUTPUT_DIR, `${date}-error.json`);
    fs.writeFileSync(errorPath, JSON.stringify(errorReport, null, 2));
    
    process.exit(1);
  }
}

// Run if called directly
const dateArg = process.argv[2];
dailyRun(dateArg);
