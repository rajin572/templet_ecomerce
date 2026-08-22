import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StaffService } from './staff.service';

const getAllStaff = catchAsync(async (req: Request, res: Response) => {
  const result = await StaffService.getAllStaff(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const createStaff = catchAsync(async (req: Request, res: Response) => {
  const result = await StaffService.createStaff(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Staff created successfully',
    data: result,
  });
});

const getStaffById = catchAsync(async (req: Request, res: Response) => {
  const result = await StaffService.getStaffById(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff retrieved successfully',
    data: result,
  });
});

const updateStaff = catchAsync(async (req: Request, res: Response) => {
  const result = await StaffService.updateStaff(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff updated successfully',
    data: result,
  });
});

const updateStaffStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await StaffService.updateStaffStatus(req.params.id as string, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff status updated successfully',
    data: result,
  });
});

const updateStaffRole = catchAsync(async (req: Request, res: Response) => {
  const { role } = req.body; // roleId
  const result = await StaffService.updateStaffRole(req.params.id as string, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff role updated successfully',
    data: result,
  });
});

const forceLogout = catchAsync(async (req: Request, res: Response) => {
  await StaffService.forceLogout(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff forcefully logged out successfully',
    data: null,
  });
});

export const StaffController = {
  getAllStaff,
  createStaff,
  getStaffById,
  updateStaff,
  updateStaffStatus,
  updateStaffRole,
  forceLogout,
};
