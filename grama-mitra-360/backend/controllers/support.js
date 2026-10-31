import crypto from 'crypto';
import SupportTicket from '../models/SupportTicket.js';
import Feedback from '../models/Feedback.js';
const newId = () => 'GM-' + crypto.randomBytes(4).toString('hex').toUpperCase();
export async function createTicket(req, res) {
  const t = await SupportTicket.create({ ...req.body, ticketId: newId() });
  res.status(201).json({ ticketId: t.ticketId, status: t.status,
    message: 'Your request is saved. No support person has accepted it yet. Check status with your ticket ID.' });
}
// Public: citizen checks status with the unguessable ticket ID. Shows human replies only.
export async function track(req, res) {
  const t = await SupportTicket.findOne({ ticketId: req.params.ticketId.toUpperCase() });
  if (!t) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ ticketId: t.ticketId, status: t.status, humanConnected: t.status !== 'Pending',
    responses: t.responses.map(r => ({ text: r.text, at: r.at })) });
}
// Offline sync of tickets queued on the device (each carries its own consent).
export async function syncTickets(req, res) {
  const out = [];
  for (const item of req.body.tickets) { const t = await SupportTicket.create({ ...item, ticketId: newId() }); out.push({ localId: item.localId, ticketId: t.ticketId }); }
  res.status(201).json({ synced: out });
}
const FLOW = { Pending: ['Assigned'], Assigned: ['In Progress', 'Resolved'], 'In Progress': ['Resolved'], Resolved: [] };
export async function list(req, res) {
  const q = req.query.status ? { status: String(req.query.status) } : {};
  res.json(await SupportTicket.find(q).sort({ createdAt: -1 }).limit(200).populate('assignedTo', 'name'));
}
export async function get(req, res) {
  const t = await SupportTicket.findOne({ ticketId: req.params.ticketId }).populate('assignedTo', 'name');
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
}
export async function accept(req, res) {
  const t = await SupportTicket.findOne({ ticketId: req.params.ticketId });
  if (!t) return res.status(404).json({ error: 'Not found' });
  if (t.status !== 'Pending') return res.status(409).json({ error: 'Already taken' });
  t.status = 'Assigned'; t.assignedTo = req.user._id; await t.save(); res.json(t);
}
export async function setStatus(req, res) {
  const t = await SupportTicket.findOne({ ticketId: req.params.ticketId });
  if (!t) return res.status(404).json({ error: 'Not found' });
  if (!FLOW[t.status].includes(req.body.status)) return res.status(409).json({ error: `Cannot move from ${t.status} to ${req.body.status}` });
  t.status = req.body.status; if (t.status === 'Resolved') t.resolvedAt = new Date();
  if (!t.assignedTo) t.assignedTo = req.user._id;
  await t.save(); res.json(t);
}
export async function respond(req, res) {
  const t = await SupportTicket.findOne({ ticketId: req.params.ticketId });
  if (!t) return res.status(404).json({ error: 'Not found' });
  if (t.status === 'Pending') return res.status(409).json({ error: 'Accept the ticket first' });
  t.responses.push({ by: req.user._id, byName: req.user.name, text: req.body.text }); await t.save(); res.json(t);
}
export async function feedback(req, res) { await Feedback.create(req.body); res.status(201).json({ ok: true }); }
