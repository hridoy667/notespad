import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = express.Router();

// Publicly accessible routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;