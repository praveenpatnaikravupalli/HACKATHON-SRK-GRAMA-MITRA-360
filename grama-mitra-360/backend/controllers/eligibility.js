import GovernmentService from '../models/GovernmentService.js';
import EligibilityAssessment from '../models/EligibilityAssessment.js';
import { evaluate } from '../services/eligibility.js';
import { trustFor } from '../services/trust.js';
import { lang } from '../services/messages.js';
export async function questions(req, res) {
  const s = await GovernmentService.findOne({ slug: req.params.slug }).populate('source');
  if (!s || !s.eligibilityRules.length) return res.status(404).json({ error: 'No eligibility rules available', unverified: true });
  const l = lang(req.query.lang);
  res.json({ slug: s.slug, trust: trustFor(s), eligibilityText: s.eligibilityText,
    questions: s.eligibilityRules.map(r => ({ key: r.key, type: r.type, text: r.question[l] || r.question.en })) });
}
export async function check(req, res) {
  const s = await GovernmentService.findOne({ slug: req.params.slug }).populate('source');
  if (!s) return res.status(404).json({ error: 'Not found' });
  const { answers, consentToSave } = req.body;
  const out = evaluate(s.eligibilityRules, answers);
  if (consentToSave) await EligibilityAssessment.create({ serviceSlug: s.slug, answers, result: out.result });
  res.json({ ...out, trust: trustFor(s), disclaimer: 'Preliminary result only. Final approval is decided by the government department.' });
}
