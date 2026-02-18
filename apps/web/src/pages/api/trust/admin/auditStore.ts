export type AuditEntry = {
  timestamp: string;
  actorId: string;
  action: string;
  targetId?: string;
  message?: string;
  details?: any;
};

const entries: AuditEntry[] = [];

export function addAuditEntry(entry: Omit<AuditEntry, 'timestamp'>) {
  const row: AuditEntry = { timestamp: new Date().toISOString(), ...entry };
  entries.unshift(row);
  // keep the store bounded for local dev
  if (entries.length > 200) entries.pop();
  return row;
}

export function getAuditEntries() {
  return entries.slice();
}
