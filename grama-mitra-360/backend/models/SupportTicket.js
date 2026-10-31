import mongoose from 'mongoose';
const s = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  question: { type: String, required: true, maxlength: 1000 },
  language: { type: String, enum: ['en', 'hi', 'te'], required: true },
  category: { type: String, default: 'other' },
  summary: { type: String, maxlength: 2000 },
  reason: { type: String, required: true, maxlength: 300 },
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
  status: { type: String, enum: ['Pending', 'Assigned', 'In Progress', 'Resolved'], default: 'Pending' },
  contact: { type: String, maxlength: 40 }, // optional, citizen-provided, only with consent
  consent: { type: Boolean, required: true, validate: v => v === true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  responses: [{ by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, byName: String, text: { type: String, maxlength: 2000 }, at: { type: Date, default: Date.now } }],
  resolvedAt: Date,
}, { timestamps: true });
export default mongoose.model('SupportTicket', s);
