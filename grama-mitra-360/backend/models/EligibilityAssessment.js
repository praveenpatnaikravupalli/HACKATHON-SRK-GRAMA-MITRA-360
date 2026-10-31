import mongoose from 'mongoose';
// Anonymous, consent-only, auto-deleted after 90 days.
const s = new mongoose.Schema({
  serviceSlug: { type: String, required: true },
  answers: mongoose.Schema.Types.Mixed,
  result: { type: String, enum: ['preliminary_match', 'may_not_be_eligible', 'needs_more_info'], required: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 90 * 864e5), index: { expires: 0 } },
}, { timestamps: true });
export default mongoose.model('EligibilityAssessment', s);
