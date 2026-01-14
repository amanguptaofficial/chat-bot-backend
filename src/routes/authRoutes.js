import express from 'express';
import { body } from 'express-validator';
import { login, signup } from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').isString().isLength({ min: 2, max: 80 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().notEmpty().withMessage('Password is required')
  ],
  login
);

export default router;

