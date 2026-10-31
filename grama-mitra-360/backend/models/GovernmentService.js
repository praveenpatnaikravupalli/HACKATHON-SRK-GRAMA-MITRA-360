import mongoose from 'mongoose';
const L = { en: { type: String, required: true }, hi: String, te: String };
const rule = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  question: L,
  type: { type: String, enum: ['number', 'boolean', 'text'], required: true },
  op: { type: String, enum: ['gte', 'lte', 'eq', 'neq', 'info'], required: true }, // info = collected, but needs official verification
  value: mongoose.Schema.Types.Mixed,
}, { _id: false });
const doc = new mongoose.Schema({
  key: { type: String, required: true },
  name: L,
  explain: { type: String, required: true },
  howToObtain: String,
}, { _id: false });
const s = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true },
  name: L,
  category: { type: String, enum: ['pension', 'ration', 'scholarship', 'health', 'safety', 'other'], required: true },
  description: { type: String, required: true },
  eligibilityText: [String],
  eligibilityRules: [rule],
  documents: [doc],
  procedure: [String],
  keywords: [String], // en/hi/te words for retrieval
  source: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeSource' },
  sourceUrl: String,
  lastVerified: Date,
  status: { type: String, enum: ['verified', 'needs_verification', 'outdated'], default: 'needs_verification' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  faq: { type: Boolean, default: false }, // included in offline bundle
}, { timestamps: true });
export default mongoose.model('GovernmentService', s);
