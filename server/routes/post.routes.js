import express from 'express';
import {
  listPosts,
  getSinglePost,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/post.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createPostSchema, updatePostSchema } from '../schemas/post.schema.js';

const router = express.Router();

// GET endpoints are public/unvalidated per requirements
router.get('/', listPosts);
router.get('/:id', getSinglePost);

// Write actions require authentication and Zod schema validation
router.post('/', authenticate, validate(createPostSchema), createPost);
router.patch('/:id', authenticate, validate(updatePostSchema), updatePost);
router.delete('/:id', authenticate, deletePost);

export default router;