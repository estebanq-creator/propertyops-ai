/**
 * PII Redaction Unit Tests
 * PRO-28: Shadow Mode Security Implementation
 * 
 * Tests for redaction accuracy, edge cases, and compliance validation
 */

import { describe, it, expect } from '@jest/globals';
import {
  redactPII,
  detectPII,
  validateNoPII,
  redactDocument,
  batchRedactDocuments,
  generateComplianceReport,
} from '../lib/pii-redaction';

describe('PII Redaction Engine', () => {
  describe('SSN Detection and Redaction', () => {
    it('should redact SSN in XXX-XX-XXXX format', () => {
      const input = 'My SSN is 123-45-6789 for verification.';
      const result = redactPII(input);
      
      expect(result.redactedText).toContain('[SSN_REDACTED]');
      expect(result.redactedText).not.toContain('123-45-6789');
      expect(result.piiDetected.ssn).toHaveLength(1);
      expect(result.piiDetected.ssn[0]).toBe('123-45-6789');
    });
    
    it('should redact SSN in XXXXXXXXX format (no dashes)', () => {
      const input = 'SSN: 987654321 is required.';
      const result = redactPII(input);
      
      expect(result.redactedText).toContain('[SSN_REDACTED]');
      expect(result.piiDetected.ssn).toHaveLength(1);
    });
    
    it('should redact multiple SSNs', () => {
      const input = 'SSN1: 111-22-3333, SSN2: 444-55-6666';
      const result = redactPII(input);
      
      expect(result.piiDetected.ssn).toHaveLength(2);
      expect(result.redactionsMade.filter((r) => r.type === 'ssns')).toHaveLength(2);
    });
  });
  
  describe('Email Detection and Redaction', () => {
    it('should redact standard email addresses', () => {
      const input = 'Contact me at john.doe@example.com for details.';
      const result = redactPII(input);
      
      expect(result.redactedText).toContain('[EMAIL_REDACTED]');
      expect(result.redactedText).not.toContain('john.doe@example.com');
      expect(result.piiDetected.emails).toHaveLength(1);
    });
    
    it('should redact email with subdomain', () => {
      const input = 'Email: user@mail.subdomain.company.co.uk';
      const result = redactPII(input);
      
      expect(result.piiDetected.emails).toHaveLength(1);
    });
    
    it('should redact multiple emails', () => {
      const input = 'Primary: alice@test.com, Secondary: bob@test.com';
      const result = redactPII(input);
      
      expect(result.piiDetected.emails).toHaveLength(2);
    });
  });
  
  describe('Phone Number Detection and Redaction', () => {
    it('should redact phone in (XXX) XXX-XXXX format', () => {
      const input = 'Call me at (555) 123-4567 anytime.';
      const result = redactPII(input);
      
      expect(result.redactedText).toContain('[PHONE_REDACTED]');
      expect(result.piiDetected.phones).toHaveLength(1);
    });
    
    it('should redact phone in XXX-XXX-XXXX format', () => {
      const input = 'Phone: 555-987-6543';
      const result = redactPII(input);
      
      expect(result.piiDetected.phones).toHaveLength(1);
    });
    
    it('should redact phone in XXXXXXXXXX format', () => {
      const input = 'Mobile: 5551234567';
      const result = redactPII(input);
      
      expect(result.piiDetected.phones).toHaveLength(1);
    });
    
    it('should redact phone with country code', () => {
      const input = 'International: +1-555-123-4567';
      const result = redactPII(input);
      
      expect(result.piiDetected.phones).toHaveLength(1);
    });
  });
  
  describe('Financial Account Detection and Redaction', () => {
    it('should redact credit card number', () => {
      const input = 'Card: 4532-1234-5678-9012';
      const result = redactPII(input);
      
      expect(result.redactedText).toContain('[ACCOUNT_REDACTED]');
      expect(result.piiDetected.financialAccounts).toHaveLength(1);
    });
    
    it('should redact credit card without dashes', () => {
      const input = 'Account number: 4532123456789012';
      const result = redactPII(input);
      
      expect(result.piiDetected.financialAccounts).toHaveLength(1);
    });
    
    it('should redact routing number', () => {
      const input = 'Routing: 123456789';
      const result = redactPII(input);
      
      expect(result.piiDetected.financialAccounts).toHaveLength(1);
    });
    
    it('should redact bank account number', () => {
      const input = 'Account: 123456789012';
      const result = redactPII(input);
      
      expect(result.piiDetected.financialAccounts).toHaveLength(1);
    });
  });
  
  describe('Address Detection and Redaction', () => {
    it('should redact street address with Street', () => {
      const input = 'Live at 123 Main Street, Apt 4B';
      const result = redactPII(input);
      
      expect(result.redactedText).toContain('[ADDRESS_REDACTED]');
      expect(result.piiDetected.addresses).toHaveLength(1);
    });
    
    it('should redact address with Avenue', () => {
      const input = 'Address: 456 Oak Avenue';
      const result = redactPII(input);
      
      expect(result.piiDetected.addresses).toHaveLength(1);
    });
    
    it('should redact address with Boulevard', () => {
      const input = 'Residence: 789 Pine Boulevard, Suite 100';
      const result = redactPII(input);
      
      expect(result.piiDetected.addresses).toHaveLength(1);
    });
  });
  
  describe('Date of Birth Detection and Redaction', () => {
    it('should redact DOB in MM/DD/YYYY format', () => {
      const input = 'DOB: 03/15/1985';
      const result = redactPII(input);
      
      expect(result.redactedText).toContain('[DOB_REDACTED]');
      expect(result.piiDetected.datesOfBirth).toHaveLength(1);
    });
    
    it('should redact DOB in YYYY-MM-DD format', () => {
      const input = 'Birth date: 1990-12-25';
      const result = redactPII(input);
      
      expect(result.piiDetected.datesOfBirth).toHaveLength(1);
    });
  });
  
  describe('Name Detection and Redaction', () => {
    it('should redact full name (first + last)', () => {
      const input = 'Tenant name: John Smith';
      const result = redactPII(input);
      
      expect(result.redactedText).toContain('[NAME_REDACTED]');
      expect(result.piiDetected.names.length).toBeGreaterThan(0);
    });
    
    it('should redact name with middle name', () => {
      const input = 'Full name: Jane Marie Doe';
      const result = redactPII(input);
      
      expect(result.piiDetected.names.length).toBeGreaterThan(0);
    });
    
    it('should mark names as low confidence', () => {
      const input = 'Contact: Robert Johnson';
      const result = redactPII(input);
      
      const nameRedactions = result.redactionsMade.filter((r) => r.type === 'names');
      nameRedactions.forEach((r) => {
        expect(r.confidence).toBe('low');
      });
    });
  });
  
  describe('Multiple PII Types', () => {
    it('should redact multiple PII types in same text', () => {
      const input = `
        Tenant: John Smith
        SSN: 123-45-6789
        Email: john.smith@email.com
        Phone: (555) 123-4567
        Address: 456 Oak Avenue, Apt 2C
        DOB: 01/15/1990
      `;
      
      const result = redactPII(input);
      
      expect(result.piiDetected.ssn).toHaveLength(1);
      expect(result.piiDetected.emails).toHaveLength(1);
      expect(result.piiDetected.phones).toHaveLength(1);
      expect(result.piiDetected.addresses).toHaveLength(1);
      expect(result.piiDetected.datesOfBirth).toHaveLength(1);
      expect(result.piiDetected.names.length).toBeGreaterThan(0);
      
      // Verify nothing leaked
      expect(result.redactedText).not.toContain('123-45-6789');
      expect(result.redactedText).not.toContain('john.smith@email.com');
      expect(result.redactedText).not.toContain('(555) 123-4567');
    });
  });
  
  describe('Detection Without Redaction', () => {
    it('should detect PII without modifying text', () => {
      const input = 'SSN: 111-22-3333, Email: test@example.com';
      const detected = detectPII(input);
      
      expect(detected.ssn).toHaveLength(1);
      expect(detected.emails).toHaveLength(1);
      expect(input).toBe('SSN: 111-22-3333, Email: test@example.com'); // Unchanged
    });
  });
  
  describe('Validation', () => {
    it('should return safe=true when no high-confidence PII', () => {
      const input = 'This is a safe message with no PII.';
      const validation = validateNoPII(input);
      
      expect(validation.safe).toBe(true);
      expect(Object.keys(validation.violations)).toHaveLength(0);
    });
    
    it('should return safe=false when SSN present', () => {
      const input = 'SSN: 123-45-6789';
      const validation = validateNoPII(input);
      
      expect(validation.safe).toBe(false);
      expect(validation.violations.ssn).toBeDefined();
    });
    
    it('should return safe=false when email present', () => {
      const input = 'Contact: user@example.com';
      const validation = validateNoPII(input);
      
      expect(validation.safe).toBe(false);
      expect(validation.violations.emails).toBeDefined();
    });
    
    it('should allow names (low confidence) in validation', () => {
      const input = 'Hello John Smith';
      const validation = validateNoPII(input);
      
      // Names are low confidence, so should be safe
      expect(validation.safe).toBe(true);
    });
  });
  
  describe('Document Redaction', () => {
    it('should redact document content and return audit trail', () => {
      const doc = {
        id: 'doc-123',
        content: 'Tenant SSN: 123-45-6789',
        type: 'lease_application',
      };
      
      const result = redactDocument(doc);
      
      expect(result.document.content).toContain('[SSN_REDACTED]');
      expect(result.redactionAudit.redactionId).toBeDefined();
      expect(result.redactionAudit.timestamp).toBeDefined();
    });
    
    it('should preserve document metadata', () => {
      const doc = {
        id: 'doc-456',
        content: 'Email: test@test.com',
        type: 'application',
      };
      
      const result = redactDocument(doc);
      
      expect(result.document.id).toBe('doc-456');
      expect(result.document.type).toBe('application');
    });
  });
  
  describe('Batch Redaction', () => {
    it('should redact multiple documents independently', () => {
      const docs = [
        { id: 'doc-1', content: 'SSN: 111-22-3333', type: 'app' },
        { id: 'doc-2', content: 'Email: a@b.com', type: 'app' },
        { id: 'doc-3', content: 'Phone: 555-123-4567', type: 'app' },
      ];
      
      const results = batchRedactDocuments(docs);
      
      expect(results).toHaveLength(3);
      expect(results[0].redactionAudit.piiDetected.ssn).toHaveLength(1);
      expect(results[1].redactionAudit.piiDetected.emails).toHaveLength(1);
      expect(results[2].redactionAudit.piiDetected.phones).toHaveLength(1);
    });
    
    it('should assign unique redaction IDs to each document', () => {
      const docs = [
        { id: 'doc-1', content: 'SSN: 111-22-3333', type: 'app' },
        { id: 'doc-2', content: 'SSN: 444-55-6666', type: 'app' },
      ];
      
      const results = batchRedactDocuments(docs);
      
      expect(results[0].redactionAudit.redactionId).not.toBe(
        results[1].redactionAudit.redactionId
      );
    });
  });
  
  describe('Compliance Report', () => {
    it('should generate compliance report with correct counts', () => {
      const results = [
        redactPII('SSN: 123-45-6789'),
        redactPII('Email: test@example.com, Phone: 555-123-4567'),
      ];
      
      const report = generateComplianceReport(results, {
        userId: 'user-123',
        sessionId: 'session-456',
        action: 'document_upload',
      });
      
      expect(report.reportId).toBeDefined();
      expect(report.timestamp).toBeDefined();
      expect(report.totalRedactions).toBe(3);
      expect(report.piiByType.ssn).toBe(1);
      expect(report.piiByType.emails).toBe(1);
      expect(report.piiByType.phones).toBe(1);
    });
    
    it('should mark as COMPLIANT when only low-confidence PII', () => {
      const results = [redactPII('Name: John Smith')];
      const report = generateComplianceReport(results, {
        userId: 'user-123',
        sessionId: 'session-456',
        action: 'test',
      });
      
      expect(report.complianceStatus).toBe('COMPLIANT');
    });
    
    it('should mark as NON_COMPLIANT when high-confidence PII detected', () => {
      const results = [redactPII('SSN: 123-45-6789')];
      const report = generateComplianceReport(results, {
        userId: 'user-123',
        sessionId: 'session-456',
        action: 'test',
      });
      
      expect(report.complianceStatus).toBe('NON_COMPLIANT');
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const result = redactPII('');
      
      expect(result.redactedText).toBe('');
      expect(result.piiDetected.ssn).toHaveLength(0);
    });
    
    it('should handle text with no PII', () => {
      const input = 'This is a normal message without any sensitive data.';
      const result = redactPII(input);
      
      expect(result.redactedText).toBe(input);
      expect(Object.values(result.piiDetected).every((arr) => arr.length === 0)).toBe(true);
    });
    
    it('should not double-redact already redacted text', () => {
      const input = '[SSN_REDACTED_0] is already redacted';
      const result = redactPII(input);
      
      // Should not create new redaction for already redacted placeholder
      expect(result.redactedText).toBe(input);
    });
    
    it('should handle very long text efficiently', () => {
      const longText = 'Normal text. '.repeat(1000) + 'SSN: 123-45-6789' + ' More text.'.repeat(1000);
      const result = redactPII(longText);
      
      expect(result.piiDetected.ssn).toHaveLength(1);
      expect(result.redactedText).toContain('[SSN_REDACTED]');
    });
    
    it('should preserve special characters and formatting', () => {
      const input = 'Contact: john@example.com! Call (555) 123-4567 NOW!!!';
      const result = redactPII(input);
      
      expect(result.redactedText).toContain('!');
      expect(result.redactedText).toContain('!!!');
    });
  });
  
  describe('Confidence Levels', () => {
    it('should assign high confidence to SSN', () => {
      const result = redactPII('SSN: 123-45-6789');
      const ssnRedactions = result.redactionsMade.filter((r) => r.type === 'ssns');
      
      ssnRedactions.forEach((r) => expect(r.confidence).toBe('high'));
    });
    
    it('should assign high confidence to financial accounts', () => {
      const result = redactPII('Account: 4532-1234-5678-9012');
      const accountRedactions = result.redactionsMade.filter(
        (r) => r.type === 'financialAccounts'
      );
      
      accountRedactions.forEach((r) => expect(r.confidence).toBe('high'));
    });
    
    it('should assign medium confidence to addresses', () => {
      const result = redactPII('Address: 123 Main Street');
      const addressRedactions = result.redactionsMade.filter((r) => r.type === 'addresses');
      
      addressRedactions.forEach((r) => expect(r.confidence).toBe('medium'));
    });
    
    it('should assign low confidence to names', () => {
      const result = redactPII('Name: John Smith');
      const nameRedactions = result.redactionsMade.filter((r) => r.type === 'names');
      
      nameRedactions.forEach((r) => expect(r.confidence).toBe('low'));
    });
  });
});
