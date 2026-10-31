import { api } from './api.js';
import { saveBundle, listQueue, removeQueued } from '../utils/offlineDb.js';
export async function downloadBundle() { const b = await api.bundle(); await saveBundle(b); return b; }
// Sends requests that were queued offline (each carries the consent given when it was written).
export async function syncQueue() {
  const q = (await listQueue()).slice(0, 20);
  if (!q.length) return [];
  const r = await api.syncTickets(q);
  for (const s of r.synced) await removeQueued(s.localId);
  return r.synced;
}
