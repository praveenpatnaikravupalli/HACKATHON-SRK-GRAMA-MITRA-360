import GovernmentService from '../models/GovernmentService.js';
import { trustFor } from '../services/trust.js';
const pub = (s) => ({ slug: s.slug, name: s.name, category: s.category, description: s.description, eligibilityText: s.eligibilityText,
  documents: s.documents, procedure: s.procedure, trust: trustFor(s) });
export async function list(req, res) {
  const q = req.query.category ? { category: String(req.query.category) } : {};
  const all = await GovernmentService.find(q).populate('source');
  res.json(all.map(pub));
}
export async function one(req, res) {
  const s = await GovernmentService.findOne({ slug: req.params.slug }).populate('source');
  if (!s) return res.status(404).json({ error: 'Not found', unverified: true });
  res.json(pub(s));
}
export async function documents(req, res) {
  const s = await GovernmentService.findOne({ slug: req.params.slug }).populate('source');
  if (!s) return res.status(404).json({ error: 'Not found', unverified: true });
  res.json({ slug: s.slug, name: s.name, trust: trustFor(s), documents: s.documents });
}
// Stateless: nothing stored. Client sends keys of documents the user has.
export async function checkDocuments(req, res) {
  const s = await GovernmentService.findOne({ slug: req.params.slug }).populate('source');
  if (!s) return res.status(404).json({ error: 'Not found' });
  const have = new Set(req.body.have);
  res.json({ trust: trustFor(s), available: s.documents.filter(d => have.has(d.key)), missing: s.documents.filter(d => !have.has(d.key)) });
}
