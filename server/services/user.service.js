import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Uses userSchema.index({ createdAt: -1 })
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments();

  return {
    data: users,
    page,
    totalPages: Math.ceil(total / limit),
    totalUsers: total,
  };
};

export const getUserById = async (userId) => {
  // Uses default _id index
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const createNewUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const newUser = await User.create({
    ...userData,
    password: hashedPassword,
  });

  return {
    success: true,
    message: 'User created successfully',
  };
};

export const updateExistingUser = async (userId, updateData) => {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return updatedUser;
};

export const removeUser = async (userId) => {
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    throw new Error('User not found');
  }
  return { message: 'User deleted successfully' };
};