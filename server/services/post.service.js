import Post from '../models/Post.js';

export const getAllPosts = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Uses postSchema.index({ userId: 1, createdAt: -1 })
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email');

  const total = await Post.countDocuments();

  return {
    success: true,
    message: 'Posts retrieved successfully',
    data: {
      posts,
      page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    },
  };
};

export const getPostById = async (postId) => {
  const post = await Post.findById(postId).populate('userId', 'name email');
  if (!post) {
    throw new Error('Post not found');
  }

  return {
    success: true,
    message: 'Post retrieved successfully',
    data: post,
  };
};

export const createNewPost = async (postData, userId) => {
  const post = await Post.create({
    ...postData,
    userId,
  });

  return {
    success: true,
    message: 'Post created successfully',
    data: post,
  };
};

export const updateExistingPost = async (postId, updateData, user) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  if (user.role !== 'Admin' && post.userId.toString() !== user.id) {
    throw new Error('Forbidden: Access denied');
  }

  const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
    returnDocument: 'after',
    runValidators: true,
  });

  return {
    success: true,
    message: 'Post updated successfully',
    data: updatedPost,
  };
};

export const removePost = async (postId, user) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  if (user.role !== 'Admin' && post.userId.toString() !== user.id) {
    throw new Error('Forbidden: Access denied');
  }

  await Post.findByIdAndDelete(postId);

  return {
    success: true,
    message: 'Post deleted successfully',
  };
};