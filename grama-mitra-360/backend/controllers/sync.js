import GovernmentService from '../models/GovernmentService.js';
import { trustFor } from '../services/trust.js';
// Bundle cached by the PWA for offline use. Includes trust info so offline answers still show source + date.
export async function bundle(_req, res) {
  const all = await GovernmentService.find().populate('source');
  res.json({ generatedAt: new Date().toISOString(), services: all.map(s => ({
    slug: s.slug, name: s.name, category: s.category, description: s.description, eligibilityText: s.eligibilityText,
    documents: s.documents, procedure: s.procedure, keywords: s.keywords, trust: trustFor(s) })) });
}
