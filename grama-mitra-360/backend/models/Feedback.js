import mongoose from 'mongoose';
const s = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 500 },
  language: { type: String, enum: ['en', 'hi', 'te'] },
  ticketId: String,
}, { timestamps: true });
export default mongoose.model('Feedback', s);
