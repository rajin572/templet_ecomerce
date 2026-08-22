import express from 'express';
import { FinanceController } from './finance.controller';

const router = express.Router();

router.post('/', FinanceController.create);
router.get('/', FinanceController.getAll);

export const FinanceRoutes = router;
