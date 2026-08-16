import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// 1. CRITICAL: Foreign Key Index supporting Scenario 2 Aggregation ($lookup stage join)
postSchema.index({ userId: 1 });

// 2. Supports global public posts feed (paginated & sorted by createdAt)
postSchema.index({ createdAt: -1 });

export default mongoose.model('Post', postSchema);