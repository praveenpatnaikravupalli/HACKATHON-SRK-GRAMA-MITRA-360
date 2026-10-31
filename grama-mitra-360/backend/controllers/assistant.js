import { z } from 'zod';
import crypto from 'crypto';
import Conversation from '../models/Conversation.js';
import GovernmentService from '../models/GovernmentService.js';
import { generate, geminiEnabled } from '../services/gemini.js';
import { SYSTEM_PROMPT, CLASSIFY_SYSTEM } from '../services/prompts.js';
import { findService, forPrompt } from '../services/knowledge.js';
import { trustFor } from '../services/trust.js';
import { looksLikeScam } from '../services/safety.js';
import { MSG, LANGS, lang } from '../services/messages.js';

export const messageSchema = z.object({
  text: z.string().trim().min(1).max(500),
  language: z.enum(['en', 'hi', 'te']).default('en'),
  sessionId: z.string().max(80).optional(),
  consentToSave: z.boolean().default(false),
  recognitionConfidence: z.number().min(0).max(1).optional(), // from speech-to-text, if provided
});

async function classify(text, language, services) {
  const list = services.map(s => `${s.slug}: ${s.name.en}`).join('\n');
  return generate({ system: CLASSIFY_SYSTEM, json: true, prompt: `Selected language: ${language}\nServices:\n${list}\nUser message: """${text}"""` });
}
// Used only when Gemini is unavailable (no key / offline). Clearly reported as aiMode "keyword-fallback".
function keywordIntent(text, services) {
  const q = text.toLowerCase();
  let intent = 'service_info';
  if (/document|పత్రాలు|కాగితాలు|दस्तावेज|कागज/.test(q)) intent = 'documents';
  else if (/eligib|అర్హత|पात्र/.test(q)) intent = 'eligibility';
  else if (/human|agent|మనిషి|इंसान|सहायता/.test(q)) intent = 'human_help';
  const svc = services.map(s => ({ s, n: (s.keywords || []).filter(k => q.includes(k.toLowerCase())).length })).sort((a, b) => b.n - a.n)[0];
  return { intent: svc?.n ? intent : 'unknown', serviceSlug: svc?.n ? svc.s.slug : null, confidence: svc?.n ? 0.6 : 0.2, normalizedQuery: text };
}

async function answerFromRecord({ text, language, svc, trust }) {
  const prompt = `Language: ${LANGS[language]}\nUser question: """${text}"""\nTrust level: ${trust.level}\nVERIFIED RECORD (only source of facts):\n${JSON.stringify(forPrompt(svc))}`;
  return generate({ system: SYSTEM_PROMPT, prompt });
}

export async function message(req, res) {
  const { text, consentToSave, sessionId, recognitionConfidence } = req.body;
  const language = lang(req.body.language);
  const started = Date.now();
  const respond = async (payload) => {
    payload.language = language; payload.ms = Date.now() - started;
    if (consentToSave && sessionId) {
      await Conversation.findOneAndUpdate({ sessionId }, { $set: { language }, $push: { messages: { $each: [
        { role: 'user', text }, { role: 'assistant', text: payload.reply, intent: payload.intent, trust: payload.trust?.level }] } } }, { upsert: true });
    }
    return res.json(payload);
  };
  // Low speech-recognition confidence => ask user to repeat/confirm (no guessing).
  if (recognitionConfidence !== undefined && recognitionConfidence < 0.5)
    return respond({ reply: MSG.confirm[language](text), intent: 'confirm', action: 'confirm_text', aiMode: 'none' });

  const services = await GovernmentService.find().populate('source');
  let c, aiMode = 'gemini';
  try { if (!geminiEnabled()) throw new Error('no key'); c = await classify(text, language, services); }
  catch { c = keywordIntent(text, services); aiMode = 'keyword-fallback'; }
  if (looksLikeScam(text) && c.intent !== 'human_help') { c.intent = 'scam_safety'; c.serviceSlug = 'scam-safety'; }

  if (c.intent === 'human_help') return respond({ reply: MSG.unverified[language], intent: c.intent, action: 'offer_handoff', aiMode });
  if (c.intent === 'greeting') return respond({ reply: { en: 'Hello! How can I help you today?', hi: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?', te: 'నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?' }[language], intent: c.intent, aiMode });
  if (c.intent === 'unknown' || (c.confidence ?? 0) < 0.5) return respond({ reply: MSG.repeat[language], intent: 'unknown', action: 'repeat', aiMode });

  const svc = await findService({ slug: c.serviceSlug, text: c.normalizedQuery || text });
  const trust = trustFor(svc);
  if (!svc || trust.level === 'LOW') {
    const reply = c.intent === 'scam_safety' ? MSG.safetyBase[language] : MSG.unverified[language];
    return respond({ reply, intent: c.intent, action: c.intent === 'scam_safety' ? null : 'offer_handoff', trust, aiMode });
  }
  const service = { slug: svc.slug, name: svc.name, category: svc.category };
  const action = c.intent === 'eligibility' ? 'start_eligibility' : c.intent === 'documents' ? 'show_documents' : null;
  let reply, mode = aiMode;
  try { reply = await answerFromRecord({ text, language, svc, trust }); }
  catch { reply = null; mode = 'record-only'; }
  if (!reply) reply = c.intent === 'scam_safety' ? MSG.safetyBase[language] : `${svc.description}${language !== 'en' ? ' (English)' : ''}`;
  if (trust.level === 'MEDIUM' && mode === 'record-only') reply += `\n${MSG.mediumNote[language]}`;
  return respond({ reply, intent: c.intent, service, trust, action, aiMode: mode });
}
export const newSession = (_req, res) => res.json({ sessionId: crypto.randomUUID() });
