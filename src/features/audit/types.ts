export interface AuditEvent {
  id: string;
  /** A short time for today, or a relative day for older entries. */
  when: string;
  occurredAt: string;
  actor: string;
  actorId: string | null;
  action: string;
  resource: string;
  resourceType: string;
  resourceId: string | null;
  detail: string;
  requestId: string | null;
}

export interface AuditPage {
  total: number;
  items: AuditEvent[];
}

export interface AuditFilters {
  /** Free text over the action, resource and detail. */
  q?: string;
  actorId?: string;
  limit?: number;
}
