import express from 'express';
import { ProductController } from './product.controller';

const router = express.Router();

router.post('/', ProductController.create);
router.get('/', ProductController.getAll);

export const ProductRoutes = router;
