import express from 'express';
import { CustomerController } from './customer.controller';

const router = express.Router();

router.post('/', CustomerController.create);
router.get('/', CustomerController.getAll);

export const CustomerRoutes = router;
