/**
 * PII Redaction Engine - Server-Side Security Layer
 * PRO-28: Shadow Mode Security Implementation
 * 
 * Zero-trust architecture: LLM agents NEVER see raw PII
 * Compliance: FTC FCRA, Fair Housing, data minimization
 * 
 * Redacts BEFORE documents reach LLM sub-agents
 */

/**
 * PII types that must be redacted
 */
export interface PIIData {
  names: string[];
  addresses: string[];
  phones: string[];
  emails: string[];
  ssns: string[];
  datesOfBirth: string[];
  financialAccounts: string[];
  driverLicenses: string[];
  passportNumbers: string[];
}

/**
 * Redaction result with metadata for audit trail
 */
export interface RedactionResult {
  originalText: string;
  redactedText: string;
  redactionsMade: RedactionEntry[];
  piiDetected: PIIData;
  timestamp: string;
  redactionId: string;
}

/**
 * Individual redaction entry for audit trail
 */
export interface RedactionEntry {
  type: keyof PIIData;
  originalValue: string;
  redactedValue: string;
  position: { start: number; end: number };
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Redaction patterns organized by PII type
 * Order matters: more specific patterns first
 */
const REDACTION_PATTERNS: Record<keyof PIIData, { pattern: RegExp; label: string }> = {
  // SSN: XXX-XX-XXXX or XXXXXXXXX format
  ssns: {
    pattern: /\b(\d{3}-\d{2}-\d{4}|\d{9})\b/g,
    label: 'SSN',
  },
  
  // Financial accounts: routing numbers, account numbers, credit cards
  financialAccounts: {
    pattern: /\b((?:\d{4}[- ]?){3,4}\d{4}|\d{9}|\d{12,19})\b/g,
    label: 'Financial Account',
  },
  
  // Driver's license: varies by state, common formats
  driverLicenses: {
    pattern: /\b([A-Z]{1,2}\d{6,8}|\d{7,9}[A-Z]?)\b/g,
    label: 'Driver License',
  },
  
  // Passport numbers: various formats
  passportNumbers: {
    pattern: /\b([A-Z0-9]{6,9})\b/g,
    label: 'Passport',
  },
  
  // Phone numbers: multiple formats
  phones: {
    pattern: /(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})\b/g,
    label: 'Phone',
  },
  
  // Email addresses
  emails: {
    pattern: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
    label: 'Email',
  },
  
  // Dates of birth (context-dependent, but catch common formats)
  datesOfBirth: {
    pattern: /\b((?:0?[1-9]|1[0-2])[-\/](?:0?[1-9]|[12]\d|3[01])[-\/](?:19|20)\d{2}|(?:19|20)\d{2}[-\/](?:0?[1-9]|1[0-2])[-\/](?:0?[1-9]|[12]\d|3[01]))\b/g,
    label: 'DOB',
  },
  
  // Street addresses (complex pattern)
  addresses: {
    pattern: /\b(\d{1,5}\s+[A-Za-z]+(?:\s+[A-Za-z]+)*(?:\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Way|Place|Pl))[.,]?(?:\s+(?:Apt|Apartment|Unit|Suite|#)\s*\d+[A-Z]?)?)\b/gi,
    label: 'Address',
  },
  
  // Full names: Capitalized words (heuristic, lower confidence)
  names: {
    pattern: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
    label: 'Name',
  },
};

/**
 * Generate unique redaction ID for audit trail
 */
function generateRedactionId(): string {
  return `red_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create redacted placeholder value
 */
function createRedactedPlaceholder(type: keyof PIIData, index: number): string {
  const placeholders: Record<keyof PIIData, string> = {
    ssns: '[SSN_REDACTED]',
    financialAccounts: '[ACCOUNT_REDACTED]',
    driverLicenses: '[LICENSE_REDACTED]',
    passportNumbers: '[PASSPORT_REDACTED]',
    phones: '[PHONE_REDACTED]',
    emails: '[EMAIL_REDACTED]',
    datesOfBirth: '[DOB_REDACTED]',
    addresses: '[ADDRESS_REDACTED]',
    names: '[NAME_REDACTED]',
  };
  
  return `${placeholders[type]}_${index}`;
}

/**
 * Detect and extract PII from text without redacting
 * Used for pre-scanning and compliance validation
 */
export function detectPII(text: string): PIIData {
  const piiData: PIIData = {
    names: [],
    addresses: [],
    phones: [],
    emails: [],
    ssns: [],
    datesOfBirth: [],
    financialAccounts: [],
    driverLicenses: [],
    passportNumbers: [],
  };
  
  // Scan for each PII type
  (Object.keys(REDACTION_PATTERNS) as Array<keyof PIIData>).forEach((type) => {
    const { pattern } = REDACTION_PATTERNS[type];
    // Reset regex lastIndex
    pattern.lastIndex = 0;
    
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const value = match[0];
      // Avoid duplicates
      if (!piiData[type].includes(value)) {
        piiData[type].push(value);
      }
    }
  });
  
  return piiData;
}

/**
 * Redact PII from text with full audit trail
 * This is the main function called before sending to LLM agents
 */
export function redactPII(text: string): RedactionResult {
  const redactionId = generateRedactionId();
  const timestamp = new Date().toISOString();
  
  let redactedText = text;
  const redactionsMade: RedactionEntry[] = [];
  const piiDetected: PIIData = {
    names: [],
    addresses: [],
    phones: [],
    emails: [],
    ssns: [],
    datesOfBirth: [],
    financialAccounts: [],
    driverLicenses: [],
    passportNumbers: [],
  };
  
  // Process patterns in order of specificity (high-confidence first)
  const processingOrder: Array<keyof PIIData> = [
    'ssns',
    'financialAccounts',
    'driverLicenses',
    'passportNumbers',
    'phones',
    'emails',
    'datesOfBirth',
    'addresses',
    'names', // Names last due to lower confidence
  ];
  
  processingOrder.forEach((type) => {
    const { pattern, label } = REDACTION_PATTERNS[type];
    pattern.lastIndex = 0;
    
    let match;
    let typeIndex = 0;
    
    // Find all matches first to avoid position shifts
    const matches: Array<{ value: string; start: number; end: number }> = [];
    while ((match = pattern.exec(redactedText)) !== null) {
      matches.push({
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    
    // Process matches in reverse order to preserve positions
    for (let i = matches.length - 1; i >= 0; i--) {
      const { value, start, end } = matches[i];
      
      // Skip if already redacted
      if (value.includes('[REDACTED]')) {
        continue;
      }
      
      const redactedValue = createRedactedPlaceholder(type, typeIndex++);
      
      // Determine confidence level
      let confidence: 'high' | 'medium' | 'low' = 'high';
      if (type === 'names') {
        confidence = 'low'; // Names are heuristic
      } else if (type === 'addresses' || type === 'datesOfBirth') {
        confidence = 'medium';
      }
      
      // Record redaction
      redactionsMade.unshift({
        type,
        originalValue: value,
        redactedValue,
        position: { start, end },
        confidence,
      });
      
      // Add to detected PII
      if (!piiDetected[type].includes(value)) {
        piiDetected[type].push(value);
      }
      
      // Replace in text
      redactedText = 
        redactedText.substring(0, start) + 
        redactedValue + 
        redactedText.substring(end);
    }
  });
  
  return {
    originalText: text,
    redactedText,
    redactionsMade,
    piiDetected,
    timestamp,
    redactionId,
  };
}

/**
 * Validate that text contains no unredacted PII
 * Returns true if safe to send to LLM
 */
export function validateNoPII(text: string): { safe: boolean; violations: PIIData } {
  const detectedPII = detectPII(text);
  
  // Check if any high-confidence PII remains
  const highConfidenceTypes: Array<keyof PIIData> = [
    'ssns',
    'financialAccounts',
    'phones',
    'emails',
  ];
  
  const violations: Partial<PIIData> = {};
  let hasViolations = false;
  
  highConfidenceTypes.forEach((type) => {
    if (detectedPII[type].length > 0) {
      violations[type] = detectedPII[type];
      hasViolations = true;
    }
  });
  
  return {
    safe: !hasViolations,
    violations: violations as PIIData,
  };
}

/**
 * Middleware-compatible PII redaction wrapper
 * For use in Next.js API routes
 */
export function redactDocument(document: {
  id: string;
  content: string;
  type: string;
}): { document: typeof document; redactionAudit: RedactionResult } {
  const redactionResult = redactPII(document.content);
  
  const redactedDocument = {
    ...document,
    content: redactionResult.redactedText,
  };
  
  return {
    document: redactedDocument,
    redactionAudit: redactionResult,
  };
}

/**
 * Batch redaction for multiple documents
 * Maintains separate audit trails for each
 */
export function batchRedactDocuments(
  documents: Array<{ id: string; content: string; type: string }>
): Array<{ document: { id: string; content: string; type: string }; redactionAudit: RedactionResult }> {
  return documents.map((doc) => redactDocument(doc));
}

/**
 * Compliance report generator
 * For audit trail and regulatory compliance
 */
export function generateComplianceReport(
  redactionResults: RedactionResult[],
  context: {
    userId: string;
    sessionId: string;
    action: string;
  }
): {
  reportId: string;
  timestamp: string;
  totalRedactions: number;
  piiByType: Record<keyof PIIData, number>;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT';
  details: Array<{
    redactionId: string;
    piiType: keyof PIIData;
    count: number;
  }>;
} {
  const piiByType: Record<keyof PIIData, number> = {
    names: 0,
    addresses: 0,
    phones: 0,
    emails: 0,
    ssns: 0,
    datesOfBirth: 0,
    financialAccounts: 0,
    driverLicenses: 0,
    passportNumbers: 0,
  };
  
  const details: Array<{
    redactionId: string;
    piiType: keyof PIIData;
    count: number;
  }> = [];
  
  let totalRedactions = 0;
  
  redactionResults.forEach((result) => {
    Object.entries(result.piiDetected).forEach(([type, values]) => {
      const count = values.length;
      if (count > 0) {
        piiByType[type as keyof PIIData] += count;
        totalRedactions += count;
        
        details.push({
          redactionId: result.redactionId,
          piiType: type as keyof PIIData,
          count,
        });
      }
    });
  });
  
  // Compliance status: non-compliant if high-confidence PII leaked
  const hasHighConfidenceLeak = 
    piiByType.ssns > 0 ||
    piiByType.financialAccounts > 0 ||
    piiByType.phones > 0 ||
    piiByType.emails > 0;
  
  return {
    reportId: `compliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    totalRedactions,
    piiByType,
    complianceStatus: hasHighConfidenceLeak ? 'NON_COMPLIANT' : 'COMPLIANT',
    details,
  };
}

// Export for middleware
export default {
  redactPII,
  detectPII,
  validateNoPII,
  redactDocument,
  batchRedactDocuments,
  generateComplianceReport,
};
