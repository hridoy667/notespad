import Note from '../models/Note.js';

export const getUserNotes = async ({ userId, role, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  // Admin sees all notes; User sees only their own notes
  const filter = role === 'Admin' ? {} : { userId };

  // Uses noteSchema.index({ userId: 1, createdAt: -1 })
  const notes = await Note.find(filter)
    .sort({ userId: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email');

  const total = await Note.countDocuments(filter);

  return {
    data: notes,
    page,
    totalPages: Math.ceil(total / limit),
    totalNotes: total,
  };
};

export const getNoteById = async (noteId, user) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new Error('Note not found');
  }

  // Authorization check: User can only access their own note (Admin can access any)
  if (user.role !== 'Admin' && note.userId.toString() !== user.id) {
    throw new Error('Forbidden: Access denied');
  }

  return {
    success: true,
    message: 'Note retrieved successfully',
    note,
  };
};

export const createNewNote = async (noteData, userId) => {
  const note = await Note.create({
    ...noteData,
    userId,
  });
  return {
    success: true,
    message: 'Note created successfully',
  };
};

export const updateExistingNote = async (noteId, updateData, user) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new Error('Note not found');
  }

  if (user.role !== 'Admin' && note.userId.toString() !== user.id) {
    throw new Error('Forbidden: Access denied');
  }

  const updatedNote = await Note.findByIdAndUpdate(noteId, updateData, {
    returnDocument: 'after',
    runValidators: true,
  });

  return {
    success: true,
    message: 'Note updated successfully',
    note: updatedNote
  };
};

export const removeNote = async (noteId, user) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new Error('Note not found');
  }

  if (user.role !== 'Admin' && note.userId.toString() !== user.id) {
    throw new Error('Forbidden: Access denied');
  }

  await Note.findByIdAndDelete(noteId);
  return { success: true, message: 'Note deleted successfully' };
};