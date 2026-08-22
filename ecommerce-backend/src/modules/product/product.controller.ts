import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProductService } from './product.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.create(req.body);
  sendResponse(res, { statusCode: 201, success: true, data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getAll();
  sendResponse(res, { statusCode: 200, success: true, data: result });
});

export const ProductController = { create, getAll };
