import express from 'express';
import { OrderController } from './order.controller';

const router = express.Router();

router.post('/', OrderController.create);
router.get('/', OrderController.getAll);

export const OrderRoutes = router;
