/**
 * Landlord Seed Data - Phase 0 First 5 Landlords
 * 
 * This file creates seed data for the first 5 landlords in the Laura Portal.
 * Each landlord has:
 * - User account with 'landlord' role
 * - Sample properties (1-3 each)
 * - Linked to RBAC user schema
 * 
 * COMPLIANCE: These landlords are subject to the 50-report review gate.
 * All forensic reports require manual validation by David (Mission Control)
 * before appearing in their portal.
 */

export interface LandlordSeed {
  id: string;
  email: string;
  name: string;
  role: 'landlord';
  propertyIds: string[];
  company?: string;
  phone?: string;
  createdAt: string;
}

export interface PropertySeed {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  units: number;
  landlordId: string;
  type: 'single-family' | 'multi-family' | 'condo' | 'townhouse';
}

/**
 * First 5 Landlords - Phase 0 Pilot Customers
 */
export const landlords: LandlordSeed[] = [
  {
    id: 'landlord-001',
    email: 'sarah.chen@email.com',
    name: 'Sarah Chen',
    role: 'landlord',
    propertyIds: ['prop-001', 'prop-002'],
    company: 'Chen Properties LLC',
    phone: '(415) 555-0101',
    createdAt: '2026-04-01T08:00:00Z',
  },
  {
    id: 'landlord-002',
    email: 'marcus.johnson@email.com',
    name: 'Marcus Johnson',
    role: 'landlord',
    propertyIds: ['prop-003'],
    company: 'Johnson Rentals',
    phone: '(510) 555-0202',
    createdAt: '2026-04-01T09:00:00Z',
  },
  {
    id: 'landlord-003',
    email: 'elena.rodriguez@email.com',
    name: 'Elena Rodriguez',
    role: 'landlord',
    propertyIds: ['prop-004', 'prop-005', 'prop-006'],
    company: 'Rodriguez Housing Group',
    phone: '(408) 555-0303',
    createdAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'landlord-004',
    email: 'david.kim@email.com',
    name: 'David Kim',
    role: 'landlord',
    propertyIds: ['prop-007'],
    company: 'Kim Investment Properties',
    phone: '(650) 555-0404',
    createdAt: '2026-04-03T11:00:00Z',
  },
  {
    id: 'landlord-005',
    email: 'jennifer.walsh@email.com',
    name: 'Jennifer Walsh',
    role: 'landlord',
    propertyIds: ['prop-008', 'prop-009'],
    company: 'Walsh Residential',
    phone: '(925) 555-0505',
    createdAt: '2026-04-04T12:00:00Z',
  },
];

/**
 * Sample Properties for First 5 Landlords
 */
export const properties: PropertySeed[] = [
  // Sarah Chen - 2 properties
  {
    id: 'prop-001',
    address: '1234 Valencia Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94110',
    units: 4,
    landlordId: 'landlord-001',
    type: 'multi-family',
  },
  {
    id: 'prop-002',
    address: '567 Mission Bay Blvd',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94158',
    units: 2,
    landlordId: 'landlord-001',
    type: 'condo',
  },
  // Marcus Johnson - 1 property
  {
    id: 'prop-003',
    address: '890 Broadway',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94607',
    units: 6,
    landlordId: 'landlord-002',
    type: 'multi-family',
  },
  // Elena Rodriguez - 3 properties
  {
    id: 'prop-004',
    address: '2345 Almaden Expressway',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95125',
    units: 8,
    landlordId: 'landlord-003',
    type: 'multi-family',
  },
  {
    id: 'prop-005',
    address: '678 Santana Row',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95128',
    units: 1,
    landlordId: 'landlord-003',
    type: 'single-family',
  },
  {
    id: 'prop-006',
    address: '901 Park Avenue',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95126',
    units: 3,
    landlordId: 'landlord-003',
    type: 'townhouse',
  },
  // David Kim - 1 property
  {
    id: 'prop-007',
    address: '3456 University Ave',
    city: 'Palo Alto',
    state: 'CA',
    zipCode: '94303',
    units: 2,
    landlordId: 'landlord-004',
    type: 'multi-family',
  },
  // Jennifer Walsh - 2 properties
  {
    id: 'prop-008',
    address: '789 Main Street',
    city: 'Pleasanton',
    state: 'CA',
    zipCode: '94566',
    units: 5,
    landlordId: 'landlord-005',
    type: 'multi-family',
  },
  {
    id: 'prop-009',
    address: '456 Hackett Avenue',
    city: 'Livermore',
    state: 'CA',
    zipCode: '94551',
    units: 1,
    landlordId: 'landlord-005',
    type: 'single-family',
  },
];

/**
 * Review Gate State - Track validation progress
 * 
 * First 50 forensic reports across all 5 landlords require manual validation.
 * Status: pending_review | approved | rejected
 */
export interface ReviewGateState {
  totalRequired: 50;
  validated: number;
  pending: number;
  approved: number;
  rejected: number;
  bypassEnabled: boolean;
}

export const initialReviewGateState: ReviewGateState = {
  totalRequired: 50,
  validated: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  bypassEnabled: false,
};

/**
 * Sample Forensic Document Integrity Reports
 * 
 * These are EXAMPLE reports showing the forensic-only format.
 * NO scores, NO pass/fail, NO recommendations.
 * ONLY anomaly flags with evidence citations.
 */
export interface ForensicReport {
  id: string;
  landlordId: string;
  propertyId: string;
  tenantName: string;
  documentType: 'lease' | 'id' | 'paystub' | 'bank_statement' | 'employment_letter';
  status: 'pending_review' | 'approved' | 'rejected';
  anomalies: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    evidence: string;
    location: string;
  }[];
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

/**
 * Sample Reports for Testing - All start as pending_review
 * Reports 1-5: Initial test batch (validated by CEO)
 * Reports 6-25: Batches 2-5 for expedited review session
 */
export const sampleReports: ForensicReport[] = [
  {
    id: 'report-001',
    landlordId: 'landlord-001',
    propertyId: 'prop-001',
    tenantName: 'John Doe',
    documentType: 'paystub',
    status: 'pending_review',
    anomalies: [
      {
        type: 'metadata_inconsistency',
        severity: 'medium',
        evidence: 'PDF creation date (2026-03-15) differs from document date (2026-02-01)',
        location: 'Document metadata',
      },
      {
        type: 'font_variation',
        severity: 'low',
        evidence: 'Two different font families detected in salary field',
        location: 'Page 1, Section 2',
      },
    ],
    createdAt: '2026-04-05T14:30:00Z',
  },
  {
    id: 'report-002',
    landlordId: 'landlord-001',
    propertyId: 'prop-002',
    tenantName: 'Jane Smith',
    documentType: 'id',
    status: 'pending_review',
    anomalies: [
      {
        type: 'image_manipulation_detected',
        severity: 'high',
        evidence: 'ELA analysis reveals inconsistent compression patterns in photo region',
        location: 'Photo area, top-right quadrant',
      },
    ],
    createdAt: '2026-04-05T15:00:00Z',
  },
  {
    id: 'report-003',
    landlordId: 'landlord-002',
    propertyId: 'prop-003',
    tenantName: 'Robert Wilson',
    documentType: 'bank_statement',
    status: 'pending_review',
    anomalies: [], // Clean report - no anomalies
    createdAt: '2026-04-06T09:00:00Z',
  },
  {
    id: 'report-004',
    landlordId: 'landlord-003',
    propertyId: 'prop-004',
    tenantName: 'Maria Garcia',
    documentType: 'employment_letter',
    status: 'pending_review',
    anomalies: [
      {
        type: 'template_mismatch',
        severity: 'medium',
        evidence: 'Letterhead does not match known company template (verified via public records)',
        location: 'Header section',
      },
    ],
    createdAt: '2026-04-06T11:30:00Z',
  },
  {
    id: 'report-005',
    landlordId: 'landlord-004',
    propertyId: 'prop-007',
    tenantName: 'James Lee',
    documentType: 'lease',
    status: 'pending_review',
    anomalies: [
      {
        type: 'signature_anomaly',
        severity: 'high',
        evidence: 'Digital signature certificate expired at time of signing',
        location: 'Signature block, Page 3',
      },
      {
        type: 'text_alteration',
        severity: 'high',
        evidence: 'Rent amount field shows evidence of digital alteration (pixel-level analysis)',
        location: 'Section 4.2, Page 2',
      },
    ],
    createdAt: '2026-04-06T16:00:00Z',
  },
  // Batch 2 (Reports 6-10)
  {
    id: 'report-006',
    landlordId: 'landlord-005',
    propertyId: 'prop-008',
    tenantName: 'Patricia Nguyen',
    documentType: 'lease',
    status: 'pending_review',
    anomalies: [
      {
        type: 'template_mismatch',
        severity: 'medium',
        evidence: 'Lease clauses do not match California BAR standard form; missing required disclosure sections',
        location: 'Sections 7-9, Pages 2-3',
      },
    ],
    createdAt: '2026-04-07T08:00:00Z',
  },
  {
    id: 'report-007',
    landlordId: 'landlord-005',
    propertyId: 'prop-009',
    tenantName: 'Michael Torres',
    documentType: 'id',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-07T09:00:00Z',
  },
  {
    id: 'report-008',
    landlordId: 'landlord-001',
    propertyId: 'prop-001',
    tenantName: 'Susan Park',
    documentType: 'bank_statement',
    status: 'pending_review',
    anomalies: [
      {
        type: 'text_alteration',
        severity: 'high',
        evidence: 'Account balance field shows pixel-level evidence of digital editing',
        location: 'Balance summary section, Page 1',
      },
    ],
    createdAt: '2026-04-07T10:00:00Z',
  },
  {
    id: 'report-009',
    landlordId: 'landlord-003',
    propertyId: 'prop-005',
    tenantName: 'Carlos Mendez',
    documentType: 'paystub',
    status: 'pending_review',
    anomalies: [
      {
        type: 'metadata_inconsistency',
        severity: 'low',
        evidence: 'PDF creation timestamp 2 hours after document date (explainable by end-of-day processing)',
        location: 'Document metadata',
      },
    ],
    createdAt: '2026-04-07T11:00:00Z',
  },
  {
    id: 'report-010',
    landlordId: 'landlord-002',
    propertyId: 'prop-003',
    tenantName: 'Angela White',
    documentType: 'employment_letter',
    status: 'pending_review',
    anomalies: [
      {
        type: 'signature_anomaly',
        severity: 'medium',
        evidence: 'Digital signature present but certificate chain incomplete',
        location: 'Signature block, bottom of letter',
      },
    ],
    createdAt: '2026-04-07T12:00:00Z',
  },
  // Batch 3 (Reports 11-15)
  {
    id: 'report-011',
    landlordId: 'landlord-004',
    propertyId: 'prop-007',
    tenantName: 'Kevin Brown',
    documentType: 'id',
    status: 'pending_review',
    anomalies: [
      {
        type: 'image_manipulation_detected',
        severity: 'high',
        evidence: 'ELA analysis reveals photo region has different compression history than document background',
        location: 'Photo area, entire quadrant',
      },
    ],
    createdAt: '2026-04-07T13:00:00Z',
  },
  {
    id: 'report-012',
    landlordId: 'landlord-002',
    propertyId: 'prop-003',
    tenantName: 'Rachel Green',
    documentType: 'lease',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-07T14:00:00Z',
  },
  {
    id: 'report-013',
    landlordId: 'landlord-001',
    propertyId: 'prop-002',
    tenantName: 'Daniel Martinez',
    documentType: 'employment_letter',
    status: 'pending_review',
    anomalies: [
      {
        type: 'template_mismatch',
        severity: 'medium',
        evidence: 'Company letterhead format differs from public records; font and logo placement inconsistent',
        location: 'Header section, entire page',
      },
    ],
    createdAt: '2026-04-07T15:00:00Z',
  },
  {
    id: 'report-014',
    landlordId: 'landlord-005',
    propertyId: 'prop-008',
    tenantName: 'Lisa Anderson',
    documentType: 'paystub',
    status: 'pending_review',
    anomalies: [
      {
        type: 'font_variation',
        severity: 'low',
        evidence: 'Two similar but not identical font renderings in earnings section',
        location: 'Earnings breakdown, Page 1',
      },
    ],
    createdAt: '2026-04-07T16:00:00Z',
  },
  {
    id: 'report-015',
    landlordId: 'landlord-003',
    propertyId: 'prop-006',
    tenantName: 'Thomas Wright',
    documentType: 'bank_statement',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-07T17:00:00Z',
  },
  // Batch 4 (Reports 16-20)
  {
    id: 'report-016',
    landlordId: 'landlord-002',
    propertyId: 'prop-003',
    tenantName: 'Nancy Clark',
    documentType: 'id',
    status: 'pending_review',
    anomalies: [
      {
        type: 'qr_code_invalid',
        severity: 'medium',
        evidence: '2D barcode on ID fails validation check; does not decode to expected data',
        location: 'Back of ID, QR code region',
      },
    ],
    createdAt: '2026-04-08T08:00:00Z',
  },
  {
    id: 'report-017',
    landlordId: 'landlord-004',
    propertyId: 'prop-007',
    tenantName: 'Steven Hall',
    documentType: 'paystub',
    status: 'pending_review',
    anomalies: [
      {
        type: 'text_alteration',
        severity: 'high',
        evidence: 'Gross pay field shows evidence of digital modification',
        location: 'Pay summary section, Page 1',
      },
      {
        type: 'metadata_inconsistency',
        severity: 'medium',
        evidence: 'PDF properties indicate different source application than claimed payroll provider',
        location: 'Document metadata',
      },
    ],
    createdAt: '2026-04-08T09:00:00Z',
  },
  {
    id: 'report-018',
    landlordId: 'landlord-005',
    propertyId: 'prop-009',
    tenantName: 'Karen Lewis',
    documentType: 'lease',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-08T10:00:00Z',
  },
  {
    id: 'report-019',
    landlordId: 'landlord-001',
    propertyId: 'prop-001',
    tenantName: 'Brian Young',
    documentType: 'bank_statement',
    status: 'pending_review',
    anomalies: [
      {
        type: 'microprint_degraded',
        severity: 'low',
        evidence: 'Microprint text shows reproduction artifacts consistent with scanning',
        location: 'Security border, Page 1',
      },
    ],
    createdAt: '2026-04-08T11:00:00Z',
  },
  {
    id: 'report-020',
    landlordId: 'landlord-003',
    propertyId: 'prop-004',
    tenantName: 'Michelle King',
    documentType: 'id',
    status: 'pending_review',
    anomalies: [
      {
        type: 'shadow_inconsistency',
        severity: 'medium',
        evidence: 'Lighting analysis suggests photo region has different light source angle than document',
        location: 'Photo area and surrounding laminate',
      },
    ],
    createdAt: '2026-04-08T12:00:00Z',
  },
  // Batch 5 (Reports 21-25)
  {
    id: 'report-021',
    landlordId: 'landlord-004',
    propertyId: 'prop-007',
    tenantName: 'Christopher Scott',
    documentType: 'employment_letter',
    status: 'pending_review',
    anomalies: [
      {
        type: 'signature_anomaly',
        severity: 'high',
        evidence: 'Digital signature certificate expired 6 months before document date',
        location: 'Signature block',
      },
      {
        type: 'template_mismatch',
        severity: 'medium',
        evidence: 'Letterhead format does not match employer\'s verified template',
        location: 'Header section',
      },
    ],
    createdAt: '2026-04-08T13:00:00Z',
  },
  {
    id: 'report-022',
    landlordId: 'landlord-002',
    propertyId: 'prop-003',
    tenantName: 'Amanda Adams',
    documentType: 'paystub',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-08T14:00:00Z',
  },
  {
    id: 'report-023',
    landlordId: 'landlord-005',
    propertyId: 'prop-008',
    tenantName: 'Joshua Baker',
    documentType: 'bank_statement',
    status: 'pending_review',
    anomalies: [
      {
        type: 'edge_artifacts',
        severity: 'medium',
        evidence: 'Cut/paste detection around account number and balance fields',
        location: 'Account summary section, Page 1',
      },
    ],
    createdAt: '2026-04-08T15:00:00Z',
  },
  {
    id: 'report-024',
    landlordId: 'landlord-001',
    propertyId: 'prop-002',
    tenantName: 'Stephanie Nelson',
    documentType: 'lease',
    status: 'pending_review',
    anomalies: [
      {
        type: 'font_variation',
        severity: 'low',
        evidence: 'Minor font rendering differences in standard clauses',
        location: 'Pages 2-3, boilerplate sections',
      },
    ],
    createdAt: '2026-04-08T16:00:00Z',
  },
  {
    id: 'report-025',
    landlordId: 'landlord-003',
    propertyId: 'prop-005',
    tenantName: 'Andrew Carter',
    documentType: 'paystub',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-08T17:00:00Z',
  },
  // Batch 6 (Reports 26-30)
  {
    id: 'report-026',
    landlordId: 'landlord-004',
    propertyId: 'prop-007',
    tenantName: 'Elizabeth Turner',
    documentType: 'lease',
    status: 'pending_review',
    anomalies: [
      {
        type: 'template_mismatch',
        severity: 'medium',
        evidence: 'Lease terms deviate from standard California BAR form; unusual clause structure',
        location: 'Sections 3-5, Pages 1-2',
      },
    ],
    createdAt: '2026-04-09T08:00:00Z',
  },
  {
    id: 'report-027',
    landlordId: 'landlord-005',
    propertyId: 'prop-008',
    tenantName: 'William Harris',
    documentType: 'id',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-09T09:00:00Z',
  },
  {
    id: 'report-028',
    landlordId: 'landlord-001',
    propertyId: 'prop-001',
    tenantName: 'Sophia Martinez',
    documentType: 'paystub',
    status: 'pending_review',
    anomalies: [
      {
        type: 'text_alteration',
        severity: 'high',
        evidence: 'Hourly rate field shows pixel-level evidence of digital modification',
        location: 'Rate section, Page 1',
      },
    ],
    createdAt: '2026-04-09T10:00:00Z',
  },
  {
    id: 'report-029',
    landlordId: 'landlord-003',
    propertyId: 'prop-006',
    tenantName: 'Oliver Thompson',
    documentType: 'bank_statement',
    status: 'pending_review',
    anomalies: [
      {
        type: 'metadata_inconsistency',
        severity: 'low',
        evidence: 'Statement generation time inconsistent with bank processing schedule',
        location: 'Document metadata',
      },
    ],
    createdAt: '2026-04-09T11:00:00Z',
  },
  {
    id: 'report-030',
    landlordId: 'landlord-002',
    propertyId: 'prop-003',
    tenantName: 'Emma Robinson',
    documentType: 'employment_letter',
    status: 'pending_review',
    anomalies: [
      {
        type: 'signature_anomaly',
        severity: 'medium',
        evidence: 'Signature timestamp predates certificate validity period',
        location: 'Signature block, bottom of letter',
      },
    ],
    createdAt: '2026-04-09T12:00:00Z',
  },
  // Batch 7 (Reports 31-35)
  {
    id: 'report-031',
    landlordId: 'landlord-004',
    propertyId: 'prop-007',
    tenantName: 'Liam Walker',
    documentType: 'id',
    status: 'pending_review',
    anomalies: [
      {
        type: 'image_manipulation_detected',
        severity: 'high',
        evidence: 'Photo region shows different noise pattern than document background',
        location: 'Photo area, top-left quadrant',
      },
    ],
    createdAt: '2026-04-09T13:00:00Z',
  },
  {
    id: 'report-032',
    landlordId: 'landlord-002',
    propertyId: 'prop-003',
    tenantName: 'Ava Phillips',
    documentType: 'lease',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-09T14:00:00Z',
  },
  {
    id: 'report-033',
    landlordId: 'landlord-001',
    propertyId: 'prop-002',
    tenantName: 'Noah Campbell',
    documentType: 'paystub',
    status: 'pending_review',
    anomalies: [
      {
        type: 'font_variation',
        severity: 'low',
        evidence: 'Deductions section uses different font rendering than earnings section',
        location: 'Page 1, lower half',
      },
    ],
    createdAt: '2026-04-09T15:00:00Z',
  },
  {
    id: 'report-034',
    landlordId: 'landlord-005',
    propertyId: 'prop-009',
    tenantName: 'Isabella Evans',
    documentType: 'bank_statement',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-09T16:00:00Z',
  },
  {
    id: 'report-035',
    landlordId: 'landlord-003',
    propertyId: 'prop-004',
    tenantName: 'Ethan Edwards',
    documentType: 'employment_letter',
    status: 'pending_review',
    anomalies: [
      {
        type: 'template_mismatch',
        severity: 'medium',
        evidence: 'Company logo resolution and positioning inconsistent with verified materials',
        location: 'Header section',
      },
    ],
    createdAt: '2026-04-09T17:00:00Z',
  },
  // Batch 8 (Reports 36-40)
  {
    id: 'report-036',
    landlordId: 'landlord-004',
    propertyId: 'prop-007',
    tenantName: 'Mia Collins',
    documentType: 'lease',
    status: 'pending_review',
    anomalies: [
      {
        type: 'signature_anomaly',
        severity: 'high',
        evidence: 'Digital signature certificate revoked before lease execution date',
        location: 'Signature block, Page 3',
      },
    ],
    createdAt: '2026-04-10T08:00:00Z',
  },
  {
    id: 'report-037',
    landlordId: 'landlord-002',
    propertyId: 'prop-003',
    tenantName: 'Alexander Stewart',
    documentType: 'id',
    status: 'pending_review',
    anomalies: [
      {
        type: 'qr_code_invalid',
        severity: 'medium',
        evidence: 'Barcode data structure malformed; fails checksum validation',
        location: 'Back of ID, barcode region',
      },
    ],
    createdAt: '2026-04-10T09:00:00Z',
  },
  {
    id: 'report-038',
    landlordId: 'landlord-001',
    propertyId: 'prop-001',
    tenantName: 'Charlotte Morris',
    documentType: 'paystub',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'report-039',
    landlordId: 'landlord-005',
    propertyId: 'prop-008',
    tenantName: 'James Rogers',
    documentType: 'bank_statement',
    status: 'pending_review',
    anomalies: [
      {
        type: 'microprint_degraded',
        severity: 'low',
        evidence: 'Security microprint shows scanning artifacts; consistent with legitimate copy',
        location: 'Document border, Page 1',
      },
    ],
    createdAt: '2026-04-10T11:00:00Z',
  },
  {
    id: 'report-040',
    landlordId: 'landlord-003',
    propertyId: 'prop-005',
    tenantName: 'Benjamin Reed',
    documentType: 'employment_letter',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-10T12:00:00Z',
  },
  // Batch 9 (Reports 41-45)
  {
    id: 'report-041',
    landlordId: 'landlord-004',
    propertyId: 'prop-007',
    tenantName: 'Amelia Cook',
    documentType: 'id',
    status: 'pending_review',
    anomalies: [
      {
        type: 'shadow_inconsistency',
        severity: 'medium',
        evidence: 'Lighting direction on photo differs from document laminate shadows',
        location: 'Photo area and surrounding regions',
      },
    ],
    createdAt: '2026-04-10T13:00:00Z',
  },
  {
    id: 'report-042',
    landlordId: 'landlord-002',
    propertyId: 'prop-003',
    tenantName: 'Henry Bailey',
    documentType: 'lease',
    status: 'pending_review',
    anomalies: [
      {
        type: 'text_alteration',
        severity: 'high',
        evidence: 'Security deposit amount shows evidence of digital alteration',
        location: 'Section 2.1, Page 1',
      },
    ],
    createdAt: '2026-04-10T14:00:00Z',
  },
  {
    id: 'report-043',
    landlordId: 'landlord-001',
    propertyId: 'prop-002',
    tenantName: 'Evelyn Rivera',
    documentType: 'paystub',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-10T15:00:00Z',
  },
  {
    id: 'report-044',
    landlordId: 'landlord-005',
    propertyId: 'prop-009',
    tenantName: 'Sebastian Cooper',
    documentType: 'bank_statement',
    status: 'pending_review',
    anomalies: [
      {
        type: 'edge_artifacts',
        severity: 'medium',
        evidence: 'Edge detection reveals potential region replacement in transaction history',
        location: 'Transaction table, Page 2',
      },
    ],
    createdAt: '2026-04-10T16:00:00Z',
  },
  {
    id: 'report-045',
    landlordId: 'landlord-003',
    propertyId: 'prop-006',
    tenantName: 'Harper Morgan',
    documentType: 'employment_letter',
    status: 'pending_review',
    anomalies: [
      {
        type: 'font_variation',
        severity: 'low',
        evidence: 'Body text shows minor font rendering inconsistencies',
        location: 'Pages 1-2, paragraphs 3-5',
      },
    ],
    createdAt: '2026-04-10T17:00:00Z',
  },
  // Batch 10 (Reports 46-50) — Final Validation
  {
    id: 'report-046',
    landlordId: 'landlord-004',
    propertyId: 'prop-007',
    tenantName: 'Lucas Bennett',
    documentType: 'lease',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-11T08:00:00Z',
  },
  {
    id: 'report-047',
    landlordId: 'landlord-002',
    propertyId: 'prop-003',
    tenantName: 'Abigail Powell',
    documentType: 'id',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-11T09:00:00Z',
  },
  {
    id: 'report-048',
    landlordId: 'landlord-001',
    propertyId: 'prop-001',
    tenantName: 'Jackson Hughes',
    documentType: 'paystub',
    status: 'pending_review',
    anomalies: [
      {
        type: 'metadata_inconsistency',
        severity: 'medium',
        evidence: 'PDF producer application differs from claimed payroll system',
        location: 'Document metadata',
      },
    ],
    createdAt: '2026-04-11T10:00:00Z',
  },
  {
    id: 'report-049',
    landlordId: 'landlord-005',
    propertyId: 'prop-008',
    tenantName: 'Ella Foster',
    documentType: 'bank_statement',
    status: 'pending_review',
    anomalies: [], // Clean
    createdAt: '2026-04-11T11:00:00Z',
  },
  {
    id: 'report-050',
    landlordId: 'landlord-003',
    propertyId: 'prop-004',
    tenantName: 'Caleb Russell',
    documentType: 'employment_letter',
    status: 'pending_review',
    anomalies: [
      {
        type: 'signature_anomaly',
        severity: 'high',
        evidence: 'Signature certificate chain incomplete; issuer not in trust store',
        location: 'Signature block, bottom of letter',
      },
    ],
    createdAt: '2026-04-11T12:00:00Z',
  },
];

/**
 * Get landlords with their properties
 */
export function getLandlordWithProperties(landlordId: string) {
  const landlord = landlords.find(l => l.id === landlordId);
  if (!landlord) return null;

  const landlordProperties = properties.filter(p => p.landlordId === landlordId);
  
  return {
    ...landlord,
    properties: landlordProperties,
  };
}

/**
 * Get all landlords with properties
 */
export function getAllLandlordsWithProperties() {
  return landlords.map(landlord => ({
    ...landlord,
    properties: properties.filter(p => p.landlordId === landlord.id),
  }));
}

/**
 * Get properties for a specific landlord
 */
export function getPropertiesForLandlord(landlordId: string) {
  return properties.filter(p => p.landlordId === landlordId);
}
