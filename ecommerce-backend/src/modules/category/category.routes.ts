import express from 'express';
import { CategoryController } from './category.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createCategorySchema, updateCategorySchema } from './category.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(createCategorySchema),
  CategoryController.createCategory
);

router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

router.patch(
  '/:id',
  validateRequest(updateCategorySchema),
  CategoryController.updateCategory
);

router.delete('/:id', CategoryController.deleteCategory);

export const CategoryRoutes = router;
