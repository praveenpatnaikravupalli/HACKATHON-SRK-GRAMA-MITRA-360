import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import GovernmentService from '../models/GovernmentService.js';
import KnowledgeSource from '../models/KnowledgeSource.js';
import SupportTicket from '../models/SupportTicket.js';
import Feedback from '../models/Feedback.js';
import EligibilityAssessment from '../models/EligibilityAssessment.js';
import { trustFor } from '../services/trust.js';
export const listServices = async (_q, res) => { const a = await GovernmentService.find().populate('source'); res.json(a.map(s => ({ ...s.toObject(), trust: trustFor(s) }))); };
export const createService = async (req, res) => res.status(201).json(await GovernmentService.create({ ...req.body, status: 'needs_verification', lastVerified: undefined }));
export async function updateService(req, res) {
  // Any content edit resets verification: edited content must be re-verified.
  const s = await GovernmentService.findOneAndUpdate({ slug: req.params.slug }, { ...req.body, status: 'needs_verification', lastVerified: null }, { new: true });
  s ? res.json(s) : res.status(404).json({ error: 'Not found' });
}
export async function verifyService(req, res) {
  const s = await GovernmentService.findOne({ slug: req.params.slug }).populate('source');
  if (!s) return res.status(404).json({ error: 'Not found' });
  if (!s.source?.approved) return res.status(409).json({ error: 'Link an approved source first.' });
  s.status = 'verified'; s.lastVerified = new Date(); s.verifiedBy = req.user._id; await s.save(); res.json({ ...s.toObject(), trust: trustFor(s) });
}
export const markOutdated = async (req, res) => res.json(await GovernmentService.findOneAndUpdate({ slug: req.params.slug }, { status: 'outdated' }, { new: true }));
export const listSources = async (_q, res) => res.json(await KnowledgeSource.find());
export const createSource = async (req, res) => res.status(201).json(await KnowledgeSource.create({ ...req.body, approved: false }));
export const approveSource = async (req, res) => res.json(await KnowledgeSource.findByIdAndUpdate(req.params.id, { approved: req.body.approved, approvedBy: req.user._id }, { new: true }));
export const listAgents = async (_q, res) => res.json(await User.find({ role: 'agent' }).select('-passwordHash'));
export async function createAgent(req, res) {
  const u = await User.create({ name: req.body.name, email: req.body.email, role: 'agent', passwordHash: await bcrypt.hash(req.body.password, 10) });
  res.status(201).json({ id: u.id, name: u.name, email: u.email });
}
export const setAgentActive = async (req, res) => res.json(await User.findOneAndUpdate({ _id: req.params.id, role: 'agent' }, { active: req.body.active }, { new: true }).select('-passwordHash'));
export async function analytics(_q, res) {
  const services = await GovernmentService.find().populate('source');
  const trust = { HIGH: 0, MEDIUM: 0, LOW: 0 }; services.forEach(s => trust[trustFor(s).level]++);
  const tickets = await SupportTicket.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
  const byLang = await SupportTicket.aggregate([{ $group: { _id: '$language', n: { $sum: 1 } } }]);
  const fb = await Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
  res.json({ services: services.length, trust, ticketsByStatus: tickets, ticketsByLanguage: byLang,
    feedback: fb[0] || { avg: null, n: 0 }, assessments: await EligibilityAssessment.countDocuments() });
}
