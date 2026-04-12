'use client';

/**
 * Legal Disclaimer Footer - COMPLIANCE CRITICAL
 * 
 * This component MUST appear on every Laura Portal page.
 * It cannot be dismissed, hidden, or removed without explicit legal approval.
 * 
 * Purpose:
 * - Fair Housing Act compliance
 * - Forensic analysis disclosure (not screening/scoring)
 * - Eviction advice disclaimer
 * - Audit trail requirement notice
 */
export function DisclaimerFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4 py-4">
        {/* Primary Legal Disclaimer - Cannot be hidden */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-3 rounded mb-3">
          <p className="text-xs text-amber-900 dark:text-amber-100 font-medium">
            ⚖️ <strong>Legal Disclaimer:</strong> Laura provides forensic document integrity analysis ONLY. 
            This is NOT tenant screening, credit scoring, or eviction advice. All anomaly flags require 
            human review before any housing decision.
          </p>
        </div>

        {/* Compliance Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Fair Housing Compliance:
            </p>
            <p>
              This system does not produce scores, grades, or pass/fail verdicts. 
              All decisions must comply with the Fair Housing Act and applicable 
              state/local laws. Anomaly flags are evidence-based observations, 
              not recommendations for denial.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Forensic Analysis Scope:
            </p>
            <p>
              Laura analyzes document integrity (e.g., alterations, inconsistencies, 
              metadata anomalies). This is NOT a substitute for comprehensive 
              background checks, credit reports, or legal counsel.
            </p>
          </div>
        </div>

        {/* Audit Trail Notice */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500 text-center">
          <p>
            <strong>Audit Trail:</strong> All actions in this system are logged for compliance. 
            Review gate validation required for first 50 reports (0/50 validated).
          </p>
        </div>

        {/* Footer Branding */}
        <div className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
          <p>
            PropertyOps AI • Laura Portal • Forensic Document Integrity • Phase 0
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} PropertyOps AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

/**
 * Compact Disclaimer for embedded use (e.g., report cards)
 * Use only when full footer is present elsewhere on page
 */
export function CompactDisclaimer() {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-2 rounded my-3">
      <p className="text-xs text-amber-900 dark:text-amber-100">
        ⚖️ <strong>Forensic Analysis Only:</strong> Not tenant screening, scoring, or eviction advice. 
        Human review required. Fair Housing Act applies.
      </p>
    </div>
  );
}

export function TonyDisclaimerFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4 py-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-3 rounded mb-3">
          <p className="text-xs text-amber-900 dark:text-amber-100 font-medium">
            ⚖️ <strong>Draft-Only Communication:</strong> Tony lets tenants compose maintenance requests,
            but every message requires owner approval before anything is sent. For emergencies, contact
            your property manager directly by phone or call 911 for immediate life-safety issues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Fair Housing Compliance:
            </p>
            <p>
              PropertyOps AI complies with the Federal Fair Housing Act. This tool does not consider
              protected classes in any communication or action, and all tenant-facing messages are
              reviewed before release.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Maintenance Workflow:
            </p>
            <p>
              Habitability issues receive priority review, urgent requests are highlighted for immediate
              attention, and all draft, submit, approve, and reject actions are logged for auditability.
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500 text-center">
          <p>
            PropertyOps AI • Tony Portal • Draft-only maintenance workflow • All message actions are audited
          </p>
        </div>
      </div>
    </footer>
  );
}
