import { Router } from 'express';
import { quizController, submitQuizValidation } from '../controllers/quiz.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/generate', quizController.generateQuiz.bind(quizController));
router.get('/', quizController.getQuizzes.bind(quizController));
router.get('/results', quizController.getQuizResults.bind(quizController));
router.get('/statistics', quizController.getQuizStatistics.bind(quizController));
router.get('/:id', quizController.getQuizById.bind(quizController));
router.post('/:id/submit', submitQuizValidation, quizController.submitQuiz.bind(quizController));

export default router;
