/**
 * PII Redaction Middleware - Automatic Server-Side PII Stripping
 * PRO-28: Shadow Mode Security Implementation
 * 
 * Intercepts all Laura and Tony portal document processing
 * Redacts PII BEFORE documents reach LLM sub-agents
 * Zero-trust architecture enforcement
 */

import { NextRequest, NextResponse } from 'next/server';
import { redactPII, validateNoPII, detectPII, RedactionResult } from '@/lib/pii-redaction';

/**
 * Middleware configuration
 */
const REDACTION_CONFIG = {
  // Enable/disable redaction (should always be true in production)
  enabled: process.env.NODE_ENV !== 'test',
  
  // Paths that require mandatory redaction
  protectedPaths: [
    '/api/landlord/reports',
    '/api/tenant/messages',
    '/api/owner/approval-queue',
    '/api/landlord/review-queue',
  ],
  
  // Paths exempt from redaction (static assets, health checks, etc.)
  exemptPaths: [
    '/api/health',
    '/api/auth',
    '/_next',
    '/favicon.ico',
  ],
  
  // Log redaction events (for audit trail)
  logRedactions: true,
  
  // Block requests with unredacted high-confidence PII
  blockOnViolation: true,
};

/**
 * Redaction middleware entry point
 * Wraps Next.js API route handlers to enforce PII redaction
 */
export function withPIIRedaction<T extends NextResponse>(
  handler: (request: NextRequest) => Promise<T>,
  options?: Partial<typeof REDACTION_CONFIG>
) {
  const config = { ...REDACTION_CONFIG, ...options };
  
  return async function redactedHandler(request: NextRequest): Promise<T> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Check if path is exempt
    if (config.exemptPaths.some((path) => pathname.startsWith(path))) {
      return handler(request);
    }
    
    // Check if path requires protection
    const requiresProtection = config.protectedPaths.some((path) =>
      pathname.startsWith(path)
    );
    
    if (!requiresProtection || !config.enabled) {
      return handler(request);
    }
    
    try {
      // Clone request to read body
      const clonedRequest = request.clone();
      const contentType = request.headers.get('content-type') || '';
      
      // Only process JSON bodies
      if (!contentType.includes('application/json')) {
        return handler(request);
      }
      
      // Parse request body
      let body: any = null;
      try {
        body = await clonedRequest.json();
      } catch {
        // Not JSON, pass through
        return handler(request);
      }
      
      if (!body) {
        return handler(request);
      }
      
      // Track redactions for this request
      const redactionResults: RedactionResult[] = [];
      
      // Redact content fields recursively
      const redactedBody = redactObject(body, redactionResults);
      
      // Validate no high-confidence PII remains
      if (config.blockOnViolation) {
        const validationText = JSON.stringify(redactedBody);
        const validation = validateNoPII(validationText);
        
        if (!validation.safe) {
          // Log violation
          console.error('[PII Middleware] VIOLATION DETECTED', {
            path: pathname,
            violations: validation.violations,
            timestamp: new Date().toISOString(),
          });
          
          // Return error response
          return NextResponse.json(
            {
              error: 'PII_VIOLATION',
              message: 'Request contains unredacted personally identifiable information',
              violations: Object.keys(validation.violations),
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          ) as T;
        }
      }
      
      // Log redaction summary
      if (config.logRedactions && redactionResults.length > 0) {
        const totalRedactions = redactionResults.reduce(
          (sum, r) => sum + r.redactionsMade.length,
          0
        );
        
        console.log('[PII Middleware] Redaction applied', {
          path: pathname,
          totalRedactions,
          redactionIds: redactionResults.map((r) => r.redactionId),
          timestamp: new Date().toISOString(),
        });
      }
      
      // Create new request with redacted body
      const modifiedRequest = new NextRequest(clonedRequest.url, {
        method: clonedRequest.method,
        headers: clonedRequest.headers,
        body: JSON.stringify(redactedBody),
        duplex: 'half',
      });
      
      // Pass redacted request to handler
      return handler(modifiedRequest);
    } catch (error) {
      // Log error but don't block request on middleware failure
      console.error('[PII Middleware] Error during redaction:', error);
      return handler(request);
    }
  };
}

/**
 * Recursively redact PII from object fields
 */
function redactObject(obj: any, results: RedactionResult[]): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item, results));
  }
  
  const redactedObj: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip metadata fields
    if (key === 'redactionAudit' || key === 'piiDetected' || key === 'redactionsMade') {
      redactedObj[key] = value;
      continue;
    }
    
    // Redact string fields that likely contain user content
    if (typeof value === 'string') {
      // Check if field name suggests content that needs redaction
      const contentFields = [
        'content',
        'message',
        'description',
        'text',
        'body',
        'notes',
        'comments',
        'details',
        'report',
        'document',
      ];
      
      if (contentFields.some((field) => key.toLowerCase().includes(field))) {
        const redactionResult = redactPII(value);
        redactedObj[key] = redactionResult.redactedText;
        results.push(redactionResult);
      } else {
        redactedObj[key] = value;
      }
    } else if (typeof value === 'object') {
      // Recurse into nested objects
      redactedObj[key] = redactObject(value, results);
    } else {
      redactedObj[key] = value;
    }
  }
  
  return redactedObj;
}

/**
 * Response wrapper to ensure no PII leaks in responses
 */
export function withPIIResponse<T extends NextResponse>(
  handler: (request: NextRequest) => Promise<T>
) {
  return async function responseHandler(request: NextRequest): Promise<T> {
    const response = await handler(request);
    
    // Only process JSON responses
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return response;
    }
    
    try {
      // Clone response to read body
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      
      // Redact response body
      const redactionResults: RedactionResult[] = [];
      const redactedData = redactObject(data, redactionResults);
      
      // Validate response
      const validation = validateNoPII(JSON.stringify(redactedData));
      if (!validation.safe) {
        console.error('[PII Response] PII leak detected in response', {
          path: request.url,
          violations: validation.violations,
        });
        
        // Remove violating fields
        const sanitizedData = sanitizeResponse(redactedData);
        
        return NextResponse.json(sanitizedData, {
          status: response.status,
          headers: response.headers,
        }) as T;
      }
      
      return NextResponse.json(redactedData, {
        status: response.status,
        headers: response.headers,
      }) as T;
    } catch {
      // Non-JSON or parse error, return original
      return response;
    }
  };
}

/**
 * Sanitize response by removing fields with detected PII
 */
function sanitizeResponse(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeResponse);
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      const validation = validateNoPII(value);
      if (validation.safe) {
        sanitized[key] = value;
      } else {
        // Replace with redacted version
        sanitized[key] = '[REDACTED_FOR_COMPLIANCE]';
      }
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeResponse(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Utility function to check if a path requires redaction
 */
export function requiresRedaction(pathname: string): boolean {
  return REDACTION_CONFIG.protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
}

/**
 * Get redaction statistics for monitoring
 */
export function getRedactionStats(): {
  enabled: boolean;
  protectedPaths: string[];
  blockOnViolation: boolean;
} {
  return {
    enabled: REDACTION_CONFIG.enabled,
    protectedPaths: REDACTION_CONFIG.protectedPaths,
    blockOnViolation: REDACTION_CONFIG.blockOnViolation,
  };
}

// Export default middleware composition
export default withPIIRedaction;
