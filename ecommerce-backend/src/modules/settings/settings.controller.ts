import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SettingsService } from './settings.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingsService.create(req.body);
  sendResponse(res, { statusCode: 201, success: true, data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await SettingsService.getAll();
  sendResponse(res, { statusCode: 200, success: true, data: result });
});

export const SettingsController = { create, getAll };
