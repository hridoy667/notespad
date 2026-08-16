import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Auto-indexed by Mongoose unique constraint
  password: { type: String, required: true },
  role: { type: String, enum: ['User', 'Admin'], default: 'User' },
  interests: [{ type: String }]
}, { timestamps: true });

// 1. Supports Admin user listing (paginated & sorted by createdAt)
userSchema.index({ createdAt: -1 });

// 2. Multikey Index supporting Scenario 1 Aggregation ($unwind interests -> $group)
userSchema.index({ interests: 1 });

export default mongoose.model('User', userSchema);