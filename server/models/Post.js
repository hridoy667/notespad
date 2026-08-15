import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Supporting Scenario 2 Aggregation ($lookup on userId and sorted by createdAt)
postSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);