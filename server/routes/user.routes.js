import express from 'express';
import {
  listUsers,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
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

// All routes are restricted to Admin
router.use(authenticate, authorizeRoles('Admin'));

router.get('/',listUsers);
router.get('/:id', getSingleUser);
router.post('/', validate(createUserSchema), createUser);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;