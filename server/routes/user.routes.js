import express from 'express';
import {
  listUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
  getUsersByInterestsController,
  getUserPostsAggregateController,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  paginationQuerySchema,
} from '../schemas/user.schema.js';

const router = express.Router();

// 1. Authenticated routes (Accessible to both Users and Admins)
router.get('/interests', authenticate, getUsersByInterestsController);
router.get('/:id/posts', authenticate, getUserPostsAggregateController);

// 2. Admin-only restriction applies to everything below this line
router.use(authenticate, authorizeRoles('Admin'));

// 3. Admin routes
router.get('/', listUsers);
router.post('/', validate(createUserSchema), createUser);
router.get('/:id', getSingleUser); // Keep dynamic :id parameters near the bottom
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;