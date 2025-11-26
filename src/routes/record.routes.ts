import { Router } from 'express';
import { recordController, createRecordValidation } from '../controllers/record.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createRecordValidation, recordController.createRecord.bind(recordController));
router.get('/', recordController.getRecords.bind(recordController));
router.get('/statistics', recordController.getStatistics.bind(recordController));
router.get('/:id', recordController.getRecordById.bind(recordController));
router.put('/:id', recordController.updateRecord.bind(recordController));
router.delete('/:id', recordController.deleteRecord.bind(recordController));

export default router;
