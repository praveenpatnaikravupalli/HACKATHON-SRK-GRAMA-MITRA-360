import mongoose from 'mongoose';
const s = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  authority: { type: String, required: true },
  url: { type: String, required: true, match: /^https:\/\//i },
  approved: { type: Boolean, default: false }, // only approved sources can yield HIGH/MEDIUM trust
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export default mongoose.model('KnowledgeSource', s);
