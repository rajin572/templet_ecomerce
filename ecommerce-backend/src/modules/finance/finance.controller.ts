import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FinanceService } from './finance.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await FinanceService.create(req.body);
  sendResponse(res, { statusCode: 201, success: true, data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await FinanceService.getAll();
  sendResponse(res, { statusCode: 200, success: true, data: result });
});

export const FinanceController = { create, getAll };
