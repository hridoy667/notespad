import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Compound Index: Supports filtered paginated queries for logged-in user notes (where userId = X sort by createdAt DESC)
noteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Note', noteSchema);