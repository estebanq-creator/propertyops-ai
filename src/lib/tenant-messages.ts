import { v4 as uuidv4 } from 'uuid';

export interface TenantMessage {
  id: string;
  tenantId: string;
  subject?: string;
  body: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  habitability?: 'red' | 'yellow' | 'green';
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectReason?: string;
}

// In-memory store (for demo). Replace with persistent store in production.
const messages = new Map<string, TenantMessage>();

export function addMessage(msg: TenantMessage) {
  messages.set(msg.id, msg);
}

export function getMessage(id: string) {
  return messages.get(id);
}

export function getAllMessagesForTenant(tenantId: string) {
  return Array.from(messages.values()).filter(m => m.tenantId === tenantId);
}

export function getAllSubmittedMessages() {
  return Array.from(messages.values()).filter(m => m.status === 'submitted');
}

export function updateMessage(id: string, update: Partial<TenantMessage>) {
  const msg = messages.get(id);
  if (!msg) return;
  const newMsg = { ...msg, ...update };
  messages.set(id, newMsg as TenantMessage);
}
