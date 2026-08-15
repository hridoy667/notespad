import express from 'express';
import {
  listNotes,
  getSingleNote,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/note.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createNoteSchema, updateNoteSchema } from '../schemas/note.schema.js';
import { paginationQuerySchema } from '../schemas/user.schema.js';

const router = express.Router();

// All note endpoints require authentication
router.use(authenticate);

router.get('/', listNotes);
router.get('/:id', getSingleNote);
router.post('/', validate(createNoteSchema), createNote);
router.patch('/:id', validate(updateNoteSchema), updateNote);
router.delete('/:id', deleteNote);

export default router;