import { env } from '../config/env.js';
// TrustScore = FACTUAL verification status of a record. It is NOT an AI confidence number.
// HIGH   : approved source + admin-verified + verified within VERIFICATION_STALE_DAYS
// MEDIUM : approved source, but not verified yet or verification is stale
// LOW    : no record, unapproved/missing source, or marked outdated
export function trustFor(svc) {
  if (!svc) return { level: 'LOW', reason: 'No record found' };
  const src = svc.source;
  const base = {
    sourceName: src?.name, authority: src?.authority, sourceUrl: svc.sourceUrl || src?.url,
    lastVerified: svc.lastVerified || null, status: svc.status,
  };
  if (!src || !src.approved || svc.status === 'outdated') return { level: 'LOW', ...base, reason: 'Source missing, unapproved or outdated' };
  const fresh = svc.lastVerified && (Date.now() - new Date(svc.lastVerified)) / 864e5 <= env.staleDays;
  if (svc.status === 'verified' && fresh) return { level: 'HIGH', ...base, reason: 'Verified against approved official source' };
  return { level: 'MEDIUM', ...base, reason: 'Approved source, needs additional verification' };
}
