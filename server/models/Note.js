import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Compound index for User/Admin listing notes (filtered by userId and sorted by createdAt)
noteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Note', noteSchema);