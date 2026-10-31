// DEMO DATA for the hackathon presentation. Run AFTER `npm run seed`:  npm run seed:demo
// - creates a demo support agent
// - makes one record HIGH (scam-safety), leaves pension/ration/etc. at MEDIUM, adds one LOW record
// - adds sample tickets in every status
// Demo-only: do not use these credentials or data in production.
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import KnowledgeSource from '../models/KnowledgeSource.js';
import GovernmentService from '../models/GovernmentService.js';
import SupportTicket from '../models/SupportTicket.js';

export const DEMO_AGENT = { email: 'agent@gramamitra.local', password: process.env.DEMO_AGENT_PASSWORD || 'DemoAgent@123456' };
await connectDB();
const agent = await User.findOneAndUpdate({ email: DEMO_AGENT.email }, { name: 'Demo Agent', role: 'agent', active: true, passwordHash: await bcrypt.hash(DEMO_AGENT.password, 10) }, { upsert: true, new: true });

// HIGH demo: a human (you) should confirm 1930 / cybercrime.gov.in on the official portal before presenting.
const scam = await GovernmentService.findOne({ slug: 'scam-safety' });
if (scam) { scam.status = 'verified'; scam.lastVerified = new Date(); scam.verifiedBy = (await User.findOne({ role: 'admin' }))?._id; await scam.save(); }

// LOW demo: a record whose source is NOT approved -> assistant must refuse to answer and offer a human.
const bad = await KnowledgeSource.findOneAndUpdate({ name: 'Forwarded WhatsApp message (demo, unapproved)' },
  { authority: 'Unknown sender', url: 'https://example.org/forwarded-message', approved: false }, { upsert: true, new: true });
await GovernmentService.findOneAndUpdate({ slug: 'demo-unverified-scheme' }, {
  name: { en: 'DEMO: "Free Scooter" scheme (forwarded message)', hi: 'डेमो: "मुफ्त स्कूटर" योजना', te: 'డెమో: "ఉచిత స్కూటర్" పథకం' },
  category: 'other', description: 'DEMO ONLY. Claim from an unapproved forwarded message. Must never be answered.',
  keywords: ['free scooter', 'scooter scheme', 'ఉచిత స్కూటర్', 'मुफ्त स्कूटर'], source: bad._id, sourceUrl: bad.url, status: 'needs_verification',
}, { upsert: true });

await SupportTicket.deleteMany({ question: /^\[DEMO\]/ });
const mk = (n, o) => SupportTicket.create({ ticketId: `GM-DEMO000${n}`, language: 'te', category: 'pension', consent: true, ...o });
await mk(1, { question: '[DEMO] నా పింఛన్ ఆగిపోయింది, ఎందుకు?', summary: 'Citizen says pension payment stopped last month. Assistant had no verified record for payment stoppage.', reason: 'Assistant could not verify the answer', priority: 'high', status: 'Pending' });
await mk(2, { question: '[DEMO] राशन कार्ड में नाम जोड़ना है', language: 'hi', category: 'ration', summary: 'Wants to add a family member to ration card. State-specific process not in verified records.', reason: 'No state-specific record', status: 'Assigned', assignedTo: agent._id });
await mk(3, { question: '[DEMO] Scholarship last date for my district?', language: 'en', category: 'scholarship', summary: 'Asks district-specific last date.', reason: 'Citizen asked for human support', status: 'In Progress', assignedTo: agent._id,
  responses: [{ by: agent._id, byName: agent.name, text: 'We are checking the last date with the district office and will update here.' }] });
await mk(4, { question: '[DEMO] Is the free scooter scheme message real?', language: 'en', category: 'other', summary: 'Citizen got a forwarded message about a free scooter scheme.', reason: 'Assistant could not verify the answer', status: 'Resolved', resolvedAt: new Date(), assignedTo: agent._id,
  responses: [{ by: agent._id, byName: agent.name, text: 'We could not find this scheme on any official portal. Please do not click links or pay anyone. You can report it at cybercrime.gov.in or call 1930.' }] });
console.log(`Demo ready. Agent: ${DEMO_AGENT.email} / ${DEMO_AGENT.password}. Tickets: GM-DEMO0001..4. HIGH: scam-safety. LOW: demo-unverified-scheme.`);
process.exit(0);
