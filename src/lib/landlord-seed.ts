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
