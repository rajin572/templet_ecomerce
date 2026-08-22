import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PermissionService } from './permission.service';

const getPermissions = catchAsync(async (req: Request, res: Response) => {
  const result = await PermissionService.getPermissions();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Permissions retrieved successfully',
    data: result,
  });
});

export const PermissionController = {
  getPermissions,
};
