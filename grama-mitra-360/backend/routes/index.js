import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { ah, validate } from '../middleware/common.js';
import { requireAuth } from '../middleware/auth.js';
import * as assistant from '../controllers/assistant.js';
import * as kb from '../controllers/knowledge.js';
import * as elig from '../controllers/eligibility.js';
import * as sup from '../controllers/support.js';
import * as auth from '../controllers/auth.js';
import * as admin from '../controllers/admin.js';
import * as sync from '../controllers/sync.js';

const r = Router();
const L = z.enum(['en', 'hi', 'te']);
const staff = requireAuth(['agent', 'admin']);
const adminOnly = requireAuth(['admin']);
const aiLimit = rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: true, message: { error: 'Too many requests. Please wait a minute.' } });
const loginLimit = rateLimit({ windowMs: 15 * 60_000, limit: 10, message: { error: 'Too many login attempts.' } });

const ticketBody = z.object({ question: z.string().min(1).max(1000), language: L, category: z.string().max(40).default('other'),
  summary: z.string().max(2000).optional(), reason: z.string().min(1).max(300), priority: z.enum(['low', 'normal', 'high']).default('normal'),
  contact: z.string().max(40).optional(), consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required to save a request' }) }) });
const serviceBody = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/), name: z.object({ en: z.string(), hi: z.string().optional(), te: z.string().optional() }),
  category: z.enum(['pension', 'ration', 'scholarship', 'health', 'safety', 'other']), description: z.string().min(5), eligibilityText: z.array(z.string()).default([]),
  eligibilityRules: z.array(z.any()).default([]), documents: z.array(z.any()).default([]), procedure: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]), source: z.string().optional(), sourceUrl: z.string().url().optional(), faq: z.boolean().default(false) });

r.get('/health', (_q, s) => s.json({ ok: true }));
// Voice / AI
r.post('/assistant/session', assistant.newSession);
r.post('/assistant/message', aiLimit, validate(assistant.messageSchema), ah(assistant.message));
// Verified knowledge + documents
r.get('/services', ah(kb.list));
r.get('/services/:slug', ah(kb.one));
r.get('/documents/:slug', ah(kb.documents));
r.post('/documents/:slug/check', validate(z.object({ have: z.array(z.string()).max(50) })), ah(kb.checkDocuments));
// Eligibility
r.get('/eligibility/:slug/questions', ah(elig.questions));
r.post('/eligibility/:slug/check', validate(z.object({ answers: z.record(z.union([z.string(), z.number(), z.boolean()])), consentToSave: z.boolean().default(false) })), ah(elig.check));
// Support (citizen)
r.post('/support/tickets', validate(ticketBody), ah(sup.createTicket));
r.get('/support/track/:ticketId', ah(sup.track));
r.post('/support/sync', validate(z.object({ tickets: z.array(ticketBody.extend({ localId: z.string().max(60) })).max(20) })), ah(sup.syncTickets));
r.post('/feedback', validate(z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(500).optional(), language: L.optional(), ticketId: z.string().optional() })), ah(sup.feedback));
r.get('/sync/bundle', ah(sync.bundle));
// Auth
r.post('/auth/login', loginLimit, validate(z.object({ email: z.string().email(), password: z.string().min(1).max(100) })), ah(auth.login));
r.get('/auth/me', staff, auth.me);
// Support agents
r.get('/agent/tickets', staff, ah(sup.list));
r.get('/agent/tickets/:ticketId', staff, ah(sup.get));
r.post('/agent/tickets/:ticketId/accept', staff, ah(sup.accept));
r.patch('/agent/tickets/:ticketId/status', staff, validate(z.object({ status: z.enum(['Assigned', 'In Progress', 'Resolved']) })), ah(sup.setStatus));
r.post('/agent/tickets/:ticketId/respond', staff, validate(z.object({ text: z.string().min(1).max(2000) })), ah(sup.respond));
// Admin
r.get('/admin/services', adminOnly, ah(admin.listServices));
r.post('/admin/services', adminOnly, validate(serviceBody), ah(admin.createService));
r.put('/admin/services/:slug', adminOnly, validate(serviceBody), ah(admin.updateService));
r.post('/admin/services/:slug/verify', adminOnly, ah(admin.verifyService));
r.post('/admin/services/:slug/outdated', adminOnly, ah(admin.markOutdated));
r.get('/admin/sources', adminOnly, ah(admin.listSources));
r.post('/admin/sources', adminOnly, validate(z.object({ name: z.string().min(2), authority: z.string().min(2), url: z.string().url().startsWith('https://') })), ah(admin.createSource));
r.patch('/admin/sources/:id/approve', adminOnly, validate(z.object({ approved: z.boolean() })), ah(admin.approveSource));
r.get('/admin/agents', adminOnly, ah(admin.listAgents));
r.post('/admin/agents', adminOnly, validate(z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(10) })), ah(admin.createAgent));
r.patch('/admin/agents/:id', adminOnly, validate(z.object({ active: z.boolean() })), ah(admin.setAgentActive));
r.get('/admin/analytics', adminOnly, ah(admin.analytics));
export default r;
