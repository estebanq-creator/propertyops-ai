import { PaperclipIssue, PaperclipIssueUpdate, getIssues, paperclipRequest, updateIssue } from '@/lib/paperclip';

const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || 'edea9103-a49f-487f-901f-05b2753b965d';

const META_START = '<!--TONY_MESSAGE_META';
const META_END = 'TONY_MESSAGE_META-->';
const TITLE_PREFIX = 'Tony maintenance request: ';

export type TenantMessageStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface TenantMessage {
  id: string;
  identifier?: string;
  issueNumber?: number;
  tenantId: string;
  tenantName?: string;
  propertyId?: string;
  propertyLabel?: string;
  unitId?: string;
  unitLabel?: string;
  subject: string;
  body: string;
  status: TenantMessageStatus;
  isHabitability: boolean;
  habitabilityMatches: string[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

interface TenantMessageMeta {
  tenantId: string;
  tenantName?: string;
  propertyId?: string;
  propertyLabel?: string;
  unitId?: string;
  unitLabel?: string;
  subject: string;
  body: string;
  status: TenantMessageStatus;
  isHabitability: boolean;
  habitabilityMatches: string[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

interface CreateTenantMessageInput {
  tenantId: string;
  tenantName?: string;
  propertyId?: string;
  propertyLabel?: string;
  unitId?: string;
  unitLabel?: string;
  subject?: string;
  body: string;
}

export const HABITABILITY_RULES: Array<{ label: string; pattern: RegExp }> = [
  {
    label: 'no heat / heating failure',
    pattern: /\b(no heat|heat(?:ing)?(?:\s+\w+){0,3}\s+(?:out|off|broken|not working|stopped working|failed)|heater(?:\s+\w+){0,3}\s+(?:out|off|broken|not working)|furnace(?:\s+\w+){0,3}\s+(?:out|off|broken|not working)|boiler(?:\s+\w+){0,3}\s+(?:out|off|broken|not working)|cold|freezing|thermostat|nooooo heat|its so coldd)\b/i,
  },
  {
    label: 'no water / plumbing failure',
    pattern: /\b(no water|no hot water|water(?:\s+\w+){0,3}\s+(?:off|out|not working)|water leak|leak(?:ing)?|burst pipe|pipe burst|plumbing|sewage|flood(?:ing)?|toilet overflow|overflowing toilet|water everywhere|clogged|clogg|sink.*clogg|clogg.*sink|brown water|water pressure.*weird)\b/i,
  },
  {
    label: 'electrical hazard',
    pattern: /\b(no electricity|power outage|electrical|exposed wiring|sparks?|sparking|smoking outlet|outlet(?:\s+\w+){0,3}\s+(?:burning|hot)|breaker(?:\s+\w+){0,3}\s+tripping|short(?:ed)? circuit|lights.*flicker|outlet.*hot)\b/i,
  },
  {
    label: 'gas leak / gas odor',
    pattern: /\b(gas leak|gas smell|smell(?:s|ing)? gas|smell of gas|gas odor|rotten egg smell|carbon monoxide|co leak|gas smel)\b/i,
  },
  {
    label: 'structural damage',
    pattern: /\b(structural(?: damage)?|ceiling(?:\s+\w+){0,3}\s+(?:collapse|collapsed|caving|falling|leaking|damage(?:d)?)|roof(?:\s+\w+){0,3}\s+(?:collapse|collapsed|leaking|damage(?:d)?)|\bcrack\b.*\bwall\b|\bwall\b.*\bcrack\b|wall(?:\s+\w+){0,3}\s+(?:crack|cracked|collapse|collapsed|damage(?:d)?)|foundation(?:\s+\w+){0,3}\s+(?:crack|cracked|damage(?:d)?)|floor(?:\s+\w+){0,3}\s+(?:collapse|collapsed|soft|spongy|damage(?:d)?)|stairs?(?:\s+\w+){0,3}\s+(?:broken|collapse|collapsed|unsafe))\b/i,
  },
  {
    label: 'pest infestation',
    pattern: /\b(pest|infestation|rodent|rodents|mouse|mice|rat|rats|roach|roaches|cockroach|cockroaches|bed bug|bed bugs|bedbug|bedbugs|termite|termites|bugs|ratsss)\b/i,
  },
  {
    label: 'mold / mildew',
    pattern: /\b(mold|mildew|black mold|fungus|musty)\b/i,
  },
  {
    label: 'security breach',
    pattern: /\b(broken lock|lock(?:\s+\w+){0,3}\s+(?:broken|stuck|jammed|won't lock|cannot lock|can't lock|not locking|won't turn|can't turn)|door(?:\s+\w+){0,3}\s+(?:broken|won't close|cannot close|can't close|won't lock|forced open)|window(?:\s+\w+){0,3}\s+(?:broken|won't close|cannot close|can't close|won't lock)|security breach|deadbolt)\b/i,
  },
  {
    label: 'health / safety hazard',
    pattern: /\b(unsafe|dangerous|hazard|health hazard|safety hazard|emergency|urgent|immediately|asap|fire|smoke|smell smoke|life safety|uninhabitable|can't breathe|smell.*off)\b/i,
  },
];

export function detectHabitability(text: string): { isHabitability: boolean; matches: string[] } {
  const matches = HABITABILITY_RULES.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label);
  return {
    isHabitability: matches.length > 0,
    matches,
  };
}

function extractMeta(description?: string): TenantMessageMeta | null {
  if (!description) {
    return null;
  }

  const start = description.indexOf(META_START);
  const end = description.indexOf(META_END);

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(description.slice(start + META_START.length, end).trim()) as TenantMessageMeta;
  } catch {
    return null;
  }
}

function serializeDescription(meta: TenantMessageMeta): string {
  return [
    'Tony draft-only tenant maintenance message.',
    '',
    `Subject: ${meta.subject}`,
    ...(meta.propertyLabel ? [`Property: ${meta.propertyLabel}`] : []),
    ...(meta.unitLabel ? [`Unit: ${meta.unitLabel}`] : []),
    '',
    'Message body:',
    meta.body,
    '',
    META_START,
    JSON.stringify(meta, null, 2),
    META_END,
  ].join('\n');
}

function toTenantMessage(issue: PaperclipIssue): TenantMessage | null {
  if (!issue.title.startsWith(TITLE_PREFIX)) {
    return null;
  }

  const meta = extractMeta(issue.description);
  if (!meta) {
    return null;
  }

  return {
    id: issue.id,
    identifier: issue.identifier,
    issueNumber: issue.issueNumber,
    ...meta,
  };
}

function buildTitle(subject: string, body: string): string {
  const trimmedSubject = subject.trim();
  if (trimmedSubject) {
    return `${TITLE_PREFIX}${trimmedSubject}`;
  }

  const excerpt = body.replace(/\s+/g, ' ').trim().slice(0, 48);
  return `${TITLE_PREFIX}${excerpt || 'New request'}`;
}

function priorityForMessage(isHabitability: boolean): string {
  return isHabitability ? 'critical' : 'medium';
}

async function createAuditLog(action: string, target: string, details: Record<string, unknown>) {
  await paperclipRequest(`/companies/${COMPANY_ID}/audit-logs`, {
    method: 'POST',
    body: JSON.stringify({
      action,
      target,
      details,
    }),
  }).catch(() => {
    console.warn(`Failed to create audit log for ${action}`);
  });
}

async function getIssueById(id: string): Promise<PaperclipIssue> {
  return paperclipRequest<PaperclipIssue>(`/issues/${id}`);
}

async function updateTenantMessageMeta(
  issue: PaperclipIssue,
  metaUpdate: Partial<TenantMessageMeta>,
  issueUpdate: PaperclipIssueUpdate
): Promise<TenantMessage> {
  const currentMeta = extractMeta(issue.description);
  if (!currentMeta) {
    throw new Error('Tony message metadata is missing');
  }

  const nextMeta: TenantMessageMeta = {
    ...currentMeta,
    ...metaUpdate,
    updatedAt: metaUpdate.updatedAt || new Date().toISOString(),
  };

  const updatedIssue = await updateIssue(issue.id, {
    ...issueUpdate,
    title: buildTitle(nextMeta.subject, nextMeta.body),
    description: serializeDescription(nextMeta),
  });

  const parsed = toTenantMessage(updatedIssue);
  if (!parsed) {
    throw new Error('Updated Tony message could not be parsed');
  }

  return parsed;
}

export async function listTenantMessages(options?: { tenantId?: string }): Promise<TenantMessage[]> {
  const issues = await getIssues({ limit: 200 });
  const messages = issues.map(toTenantMessage).filter((message): message is TenantMessage => Boolean(message));
  const filtered = options?.tenantId
    ? messages.filter((message) => message.tenantId === options.tenantId)
    : messages;

  return filtered.sort((left, right) => {
    const leftTime = new Date(left.submittedAt || left.updatedAt || left.createdAt).getTime();
    const rightTime = new Date(right.submittedAt || right.updatedAt || right.createdAt).getTime();

    if (left.status === 'submitted' && right.status !== 'submitted') {
      return -1;
    }
    if (left.status !== 'submitted' && right.status === 'submitted') {
      return 1;
    }
    if (left.isHabitability !== right.isHabitability) {
      return left.isHabitability ? -1 : 1;
    }
    return rightTime - leftTime;
  });
}

export async function getTenantMessage(id: string): Promise<TenantMessage | null> {
  const issue = await getIssueById(id);
  return toTenantMessage(issue);
}

export async function createTenantMessage(input: CreateTenantMessageInput): Promise<TenantMessage> {
  const now = new Date().toISOString();
  const subject = input.subject?.trim() || 'Maintenance request';
  const habitability = detectHabitability(`${subject}\n${input.body}`);
  const meta: TenantMessageMeta = {
    tenantId: input.tenantId,
    tenantName: input.tenantName,
    propertyId: input.propertyId,
    propertyLabel: input.propertyLabel,
    unitId: input.unitId,
    unitLabel: input.unitLabel,
    subject,
    body: input.body,
    status: 'draft',
    isHabitability: habitability.isHabitability,
    habitabilityMatches: habitability.matches,
    createdAt: now,
    updatedAt: now,
  };

  const issue = await paperclipRequest<PaperclipIssue>(`/companies/${COMPANY_ID}/issues`, {
    method: 'POST',
    body: JSON.stringify({
      title: buildTitle(meta.subject, meta.body),
      description: serializeDescription(meta),
      priority: priorityForMessage(meta.isHabitability),
      status: 'backlog',
    }),
  });

  await createAuditLog('TONY_MESSAGE_CREATED', issue.id, {
    tenantId: meta.tenantId,
    createdAt: now,
    isHabitability: meta.isHabitability,
  });

  const parsed = toTenantMessage(issue);
  if (!parsed) {
    throw new Error('Created Tony message could not be parsed');
  }

  return parsed;
}

export async function submitTenantMessage(id: string, submittedBy: string): Promise<TenantMessage> {
  const issue = await getIssueById(id);
  const submittedAt = new Date().toISOString();
  const message = await updateTenantMessageMeta(
    issue,
    {
      status: 'submitted',
      submittedAt,
      updatedAt: submittedAt,
    },
    {
      status: 'backlog',
      priority: priorityForMessage(Boolean(extractMeta(issue.description)?.isHabitability)),
      comment: `Submitted for approval by ${submittedBy} at ${submittedAt}`,
    }
  );

  await createAuditLog('TONY_MESSAGE_SUBMITTED', id, {
    submittedBy,
    submittedAt,
    isHabitability: message.isHabitability,
  });

  return message;
}

export async function approveTenantMessage(id: string, approvedBy: string): Promise<TenantMessage> {
  const issue = await getIssueById(id);
  const approvedAt = new Date().toISOString();
  const message = await updateTenantMessageMeta(
    issue,
    {
      status: 'approved',
      approvedAt,
      approvedBy,
      updatedAt: approvedAt,
    },
    {
      status: 'done',
      comment: `Approved by ${approvedBy} at ${approvedAt}`,
    }
  );

  await createAuditLog('TONY_MESSAGE_APPROVED', id, {
    approvedBy,
    approvedAt,
    isHabitability: message.isHabitability,
  });

  return message;
}

export async function rejectTenantMessage(id: string, rejectedBy: string, reason?: string): Promise<TenantMessage> {
  const issue = await getIssueById(id);
  const rejectedAt = new Date().toISOString();
  const message = await updateTenantMessageMeta(
    issue,
    {
      status: 'rejected',
      rejectionReason: reason || 'No reason provided',
      updatedAt: rejectedAt,
    },
    {
      status: 'cancelled',
      comment: `Rejected by ${rejectedBy} at ${rejectedAt}${reason ? `: ${reason}` : ''}`,
    }
  );

  await createAuditLog('TONY_MESSAGE_REJECTED', id, {
    rejectedBy,
    rejectedAt,
    reason: reason || null,
  });

  return message;
}
