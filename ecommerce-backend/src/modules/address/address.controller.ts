import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AddressService } from './address.service';

const createAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await AddressService.createAddress(userId as string, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Address created successfully',
    data: result,
  });
});

const getMyAddresses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await AddressService.getMyAddresses(userId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Addresses retrieved successfully',
    data: result,
  });
});

const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await AddressService.updateAddress(userId as string, req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Address updated successfully',
    data: result,
  });
});

const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  await AddressService.deleteAddress(userId as string, req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Address deleted successfully',
    data: null,
  });
});

const setDefaultAddress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await AddressService.setDefaultAddress(userId as string, req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Default address set successfully',
    data: result,
  });
});

export const AddressController = {
  createAddress,
  getMyAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
