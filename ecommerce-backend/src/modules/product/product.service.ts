import { Product } from './product.model';

const create = async (payload: any) => await Product.create(payload);
const getAll = async () => await Product.find();

export const ProductService = { create, getAll };
