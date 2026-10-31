import mongoose from 'mongoose';
// Saved ONLY with citizen consent. Auto-deleted after 30 days (TTL index).
const s = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  language: { type: String, enum: ['en', 'hi', 'te'] },
  messages: [{ role: { type: String, enum: ['user', 'assistant'] }, text: { type: String, maxlength: 2000 }, intent: String, trust: String, at: { type: Date, default: Date.now } }],
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 864e5), index: { expires: 0 } },
}, { timestamps: true });
export default mongoose.model('Conversation', s);
