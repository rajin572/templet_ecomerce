import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await UserService.getMe(userId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await UserService.updateMe(userId as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

export const UserController = {
  getMe,
  updateMe,
};
