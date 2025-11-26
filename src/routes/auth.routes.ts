import { Router } from 'express';
import { authController, registerValidation, loginValidation } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidation, authController.register.bind(authController));
router.post('/login', loginValidation, authController.login.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));

export default router;
