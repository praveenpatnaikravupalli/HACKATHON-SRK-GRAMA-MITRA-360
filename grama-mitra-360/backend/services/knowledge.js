import GovernmentService from '../models/GovernmentService.js';
const norm = s => (s || '').toLowerCase();
// Simple keyword retrieval over curated records (small corpus). Returns best record or null.
export async function findService({ slug, text }) {
  if (slug) {
    const s = await GovernmentService.findOne({ slug }).populate('source');
    if (s) return s;
  }
  const all = await GovernmentService.find().populate('source');
  const q = norm(text);
  let best = null, score = 0;
  for (const s of all) {
    const sc = (s.keywords || []).reduce((n, k) => n + (q.includes(norm(k)) ? 1 : 0), 0);
    if (sc > score) { best = s; score = sc; }
  }
  return best;
}
export const forPrompt = (s) => ({
  name: s.name?.en, description: s.description, eligibility: s.eligibilityText,
  documents: s.documents.map(d => ({ name: d.name?.en, explain: d.explain, howToObtain: d.howToObtain })),
  procedure: s.procedure, source: s.source?.name, sourceUrl: s.sourceUrl || s.source?.url, lastVerified: s.lastVerified,
});
