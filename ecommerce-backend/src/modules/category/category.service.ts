import { Category } from './category.model';
import { ICategory } from './category.interface';
import ApiError from '../../errors/ApiError';

const createCategory = async (payload: Partial<ICategory>) => {
  const result = await Category.create(payload);
  return result;
};

const getAllCategories = async () => {
  const result = await Category.find().populate('parent');
  return result;
};

const getCategoryById = async (id: string) => {
  const result = await Category.findById(id).populate('parent');
  if (!result) throw new ApiError(404, 'Category not found');
  return result;
};

const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  const result = await Category.findByIdAndUpdate(id, payload, { new: true });
  if (!result) throw new ApiError(404, 'Category not found');
  return result;
};

const deleteCategory = async (id: string) => {
  // Check if it has children
  const children = await Category.find({ parent: id });
  if (children.length > 0) {
    throw new ApiError(400, 'Cannot delete category with sub-categories. Please delete them first.');
  }
  const result = await Category.findByIdAndDelete(id);
  if (!result) throw new ApiError(404, 'Category not found');
  return result;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
