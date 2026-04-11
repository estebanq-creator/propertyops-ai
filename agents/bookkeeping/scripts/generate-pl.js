#!/usr/bin/env node
/**
 * Monthly P&L Generator
 * 
 * Usage: node scripts/generate-pl.js [year-month]
 * Year-month format: YYYY-MM (default: previous month)
 * 
 * Generates monthly P&L from reconciled data
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = path.join(process.env.HOME, '.openclaw/workspace-hermes');
const RECONCILIATION_DIR = path.join(WORKSPACE_DIR, 'agents/bookkeeping/output/daily-reconciliation');
const PL_OUTPUT_DIR = path.join(WORKSPACE_DIR, 'agents/bookkeeping/output/monthly-pl');

// Ensure output directory exists
if (!fs.existsSync(PL_OUTPUT_DIR)) {
  fs.mkdirSync(PL_OUTPUT_DIR, { recursive: true });
}

function getMonthRange(yearMonth) {
  let year, month;
  
  if (yearMonth) {
    [year, month] = yearMonth.split('-').map(Number);
  } else {
    // Default to previous month
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    year = now.getFullYear();
    month = now.getMonth() + 1; // 1-indexed
  }
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month
  
  return {
    yearMonth: `${year}-${String(month).padStart(2, '0')}`,
    startDate,
    endDate,
    year,
    month
  };
}

function loadReconciliationFiles(startDate, endDate) {
  const files = fs.readdirSync(RECONCILIATION_DIR);
  const reports = [];
  
  files.forEach(file => {
    if (!file.endsWith('-reconciliation.json')) return;
    
    const filePath = path.join(RECONCILIATION_DIR, file);
    const report = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const reportDate = new Date(report.date);
    
    // Include if within month range
    if (reportDate >= startDate && reportDate <= endDate) {
      reports.push(report);
    }
  });
  
  return reports;
}

function categorizeToPLCategory(category, subcategory) {
  const mapping = {
    'Revenue': 'revenue',
    'Infrastructure': 'expenses_infrastructure',
    'Sales & Marketing': 'expenses_sales_marketing',
    'Operations': 'expenses_operations',
    'Legal': 'expenses_legal',
    'Fees': 'expenses_fees',
    'Transfers': 'transfers', // Not in P&L
    'Unknown': 'expenses_other'
  };
  
  return mapping[category] || 'expenses_other';
}

function generatePL(yearMonth) {
  const { yearMonth: ym, startDate, endDate, year, month } = getMonthRange(yearMonth);
  const monthName = startDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  console.log(`📊 Monthly P&L Generator`);
  console.log('─'.repeat(60));
  console.log(`Period: ${monthName}`);
  console.log(`Date Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
  console.log('─'.repeat(60));
  
  try {
    // Load reconciliation reports
    console.log('\n📂 Loading daily reconciliation reports...');
    const reports = loadReconciliationFiles(startDate, endDate);
    
    if (reports.length === 0) {
      console.log('   ⚠️  No reconciliation reports found for this period');
      console.log('   Run daily reconciliation first: node scripts/reconcile.js [date]');
      process.exit(1);
    }
    
    console.log(`   ✅ Loaded ${reports.length} daily report(s)`);
    
    // Aggregate data
    let totalRevenue = 0;
    const expenses = {
      infrastructure: 0,
      sales_marketing: 0,
      operations: 0,
      legal: 0,
      fees: 0,
      other: 0
    };
    
    const transactionDetails = [];
    const unknownTransactions = [];
    
    reports.forEach(report => {
      report.categorizedTransactions.forEach(txn => {
        if (txn.category === 'Revenue' && txn.type === 'credit') {
          totalRevenue += txn.amount;
        } else if (txn.category !== 'Revenue' && txn.category !== 'Transfers' && txn.type === 'debit') {
          const plCategory = categorizeToPLCategory(txn.category, txn.subcategory);
          if (plCategory.startsWith('expenses_')) {
            const expenseKey = plCategory.replace('expenses_', '');
            expenses[expenseKey] += Math.abs(txn.amount);
          }
        }
        
        transactionDetails.push({
          date: txn.postedAt,
          description: txn.description,
          amount: txn.amount,
          category: txn.category,
          subcategory: txn.subcategory,
          confidence: txn.confidence
        });
        
        if (txn.category === 'Unknown') {
          unknownTransactions.push(txn);
        }
      });
    });
    
    // Calculate totals
    const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + val, 0);
    const grossProfit = totalRevenue - totalExpenses;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue * 100) : 0;
    
    // Get current balance (from most recent report)
    const latestReport = reports[reports.length - 1];
    const cashBalance = latestReport.mercuryBalance?.available || 0;
    
    // Estimate runway (simplified)
    const dailyBurn = totalExpenses / reports.length;
    const monthlyBurn = dailyBurn * 30;
    const runwayMonths = monthlyBurn > 0 ? cashBalance / monthlyBurn : null;
    
    // Build P&L report
    const plReport = {
      period: ym,
      monthName: monthName,
      generatedAt: new Date().toISOString(),
      revenue: {
        total: totalRevenue,
        breakdown: {
          mrr_subscriptions: totalRevenue // Simplified - all revenue is MRR for now
        }
      },
      expenses: {
        infrastructure: expenses.infrastructure,
        sales_marketing: expenses.sales_marketing,
        operations: expenses.operations,
        legal: expenses.legal,
        fees: expenses.fees,
        other: expenses.other,
        total: totalExpenses
      },
      profit: {
        gross_profit: grossProfit,
        gross_margin_percent: grossMargin
      },
      burn_analysis: {
        estimated_monthly_burn: monthlyBurn,
        target_burn_min: 43000, // $430
        target_burn_max: 68000, // $680
        status: monthlyBurn <= 68000 ? 'On Target' : `Over Target by $${(monthlyBurn - 68000) / 100}`
      },
      cash_position: {
        mercury_balance: cashBalance,
        estimated_runway_months: runwayMonths ? runwayMonths.toFixed(1) : 'N/A'
      },
      data_quality: {
        total_transactions: transactionDetails.length,
        unknown_transactions: unknownTransactions.length,
        categorization_accuracy: transactionDetails.length > 0 
          ? ((transactionDetails.length - unknownTransactions.length) / transactionDetails.length * 100).toFixed(1)
          : 0
      },
      transaction_details: transactionDetails,
      unknown_transactions: unknownTransactions
    };
    
    // Save JSON report
    const jsonPath = path.join(PL_OUTPUT_DIR, `${ym}-pl.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(plReport, null, 2));
    console.log(`\n💾 JSON report saved: ${jsonPath}`);
    
    // Generate text report
    const textReport = generateTextReport(plReport);
    const textPath = path.join(PL_OUTPUT_DIR, `${ym}-pl.txt`);
    fs.writeFileSync(textPath, textReport);
    console.log(`💾 Text report saved: ${textPath}`);
    
    // Output summary
    console.log('\n' + '─'.repeat(60));
    console.log(textReport);
    
    return plReport;
    
  } catch (err) {
    console.error('\n❌ P&L generation failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

function generateTextReport(report) {
  const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;
  
  let text = `
PROPERTYOPS AI — MONTHLY P&L
${report.monthName}
Generated: ${new Date(report.generatedAt).toLocaleDateString()}

═══════════════════════════════════════════════════════════

REVENUE
───────────────────────────────────────────────────────────
  Total Cash Collected:     ${formatMoney(report.revenue.total)}
  
  Breakdown:
    MRR Subscriptions:      ${formatMoney(report.revenue.breakdown.mrr_subscriptions)}

EXPENSES
───────────────────────────────────────────────────────────
  Infrastructure:           ${formatMoney(report.expenses.infrastructure)}
  Sales & Marketing:        ${formatMoney(report.expenses.sales_marketing)}
  Operations:               ${formatMoney(report.expenses.operations)}
  Legal:                    ${formatMoney(report.expenses.legal)}
  Fees:                     ${formatMoney(report.expenses.fees)}
  Other:                    ${formatMoney(report.expenses.other)}
  ─────────────────────────────────────────────────────────
  TOTAL EXPENSES:           ${formatMoney(report.expenses.total)}

NET
───────────────────────────────────────────────────────────
  Gross Profit:             ${formatMoney(report.profit.gross_profit)}
  Gross Margin:             ${report.profit.gross_margin_percent.toFixed(1)}%

BURN vs. TARGET
───────────────────────────────────────────────────────────
  Actual Burn:              ${formatMoney(report.burn_analysis.estimated_monthly_burn)}
  Target Burn:              ${formatMoney(report.burn_analysis.target_burn_min)}–${formatMoney(report.burn_analysis.target_burn_max)}
  Status:                   ${report.burn_analysis.status}

CASH POSITION
───────────────────────────────────────────────────────────
  Mercury Balance:          ${formatMoney(report.cash_position.mercury_balance)}
  Estimated Runway:         ${report.cash_position.estimated_runway_months} months

DATA QUALITY
───────────────────────────────────────────────────────────
  Total Transactions:       ${report.data_quality.total_transactions}
  Uncategorized:            ${report.data_quality.unknown_transactions}
  Accuracy:                 ${report.data_quality.categorization_accuracy}%

═══════════════════════════════════════════════════════════

NOTES:
- Generated from daily reconciliation reports
- Discrepancies >$100 flagged in daily reports
- Review unknown transactions before month-end close
- Route to David for review by 3rd business day

`;
  
  if (report.unknown_transactions.length > 0) {
    text += '\nUNCATEGORIZED TRANSACTIONS (Require Review):\n';
    text += '─'.repeat(60) + '\n';
    report.unknown_transactions.slice(0, 10).forEach(txn => {
      text += `  • ${txn.description || 'Unknown'}: $${Math.abs(txn.amount) / 100}\n`;
    });
    if (report.unknown_transactions.length > 10) {
      text += `  ... and ${report.unknown_transactions.length - 10} more\n`;
    }
    text += '\n';
  }
  
  return text;
}

// Run if called directly
const yearMonthArg = process.argv[2];
generatePL(yearMonthArg);
