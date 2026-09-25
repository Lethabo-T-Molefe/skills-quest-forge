export interface AuditEvent {
  id: string;
  when: string;
  actor: string;
  action: string;
  resource: string;
  detail: string;
}
