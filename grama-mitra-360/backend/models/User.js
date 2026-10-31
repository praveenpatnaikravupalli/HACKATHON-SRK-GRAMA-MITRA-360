import mongoose from 'mongoose';
// Staff only (admin / support agent). Citizens are anonymous: no accounts, no stored identity.
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'agent'], required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model('User', s);
