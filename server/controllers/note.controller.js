import * as noteService from '../services/note.service.js';

export const listNotes = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await noteService.getUserNotes({
      userId: req.user.id,
      role: req.user.role,
      page,
      limit,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSingleNote = async (req, res) => {
  try {
    const note = await noteService.getNoteById(req.params.id, req.user);
    res.json(note);
  } catch (error) {
    const status = error.message.includes('Forbidden')
      ? 403
      : error.message === 'Note not found'
      ? 404
      : 500;
    res.status(status).json({ message: error.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const note = await noteService.createNewNote(req.body, req.user.id);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await noteService.updateExistingNote(
      req.params.id,
      req.body,
      req.user
    );
    res.json(note);
  } catch (error) {
    const status = error.message.includes('Forbidden')
      ? 403
      : error.message === 'Note not found'
      ? 404
      : 500;
    res.status(status).json({ message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const response = await noteService.removeNote(req.params.id, req.user);
    res.json(response);
  } catch (error) {
    const status = error.message.includes('Forbidden')
      ? 403
      : error.message === 'Note not found'
      ? 404
      : 500;
    res.status(status).json({ message: error.message });
  }
};