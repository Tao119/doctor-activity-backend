import { Router } from 'express';
import authRoutes from './auth.routes';
import recordRoutes from './record.routes';
import quizRoutes from './quiz.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/records', recordRoutes);
router.use('/quizzes', quizRoutes);

export default router;
