import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthService } from './auth.service';

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  sendResponse(res, { statusCode: 200, success: true, message: result.message, data: null });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyOtp(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'User registered successfully', data: result });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resendOtp(req.body);
  sendResponse(res, { statusCode: 200, success: true, message: result.message, data: null });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress;
  const device = req.headers['user-agent'];
  const result = await AuthService.login(req.body, ip, device);
  
  res.cookie('refreshToken', result.refreshToken, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, { statusCode: 200, success: true, message: 'User logged in successfully', data: { accessToken: result.accessToken, user: result.user } });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const ip = req.ip || req.socket.remoteAddress;
  const device = req.headers['user-agent'];
  
  const result = await AuthService.refreshToken(token, ip, device);

  res.cookie('refreshToken', result.refreshToken, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, { statusCode: 200, success: true, message: 'Token refreshed successfully', data: { accessToken: result.accessToken } });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (token) {
    await AuthService.logout(token);
  }
  
  res.clearCookie('refreshToken');
  sendResponse(res, { statusCode: 200, success: true, message: 'Logged out successfully', data: null });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);
  sendResponse(res, { statusCode: 200, success: true, message: result.message, data: null });
});

const verifyForgotOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyForgotOtp(req.body);
  sendResponse(res, { statusCode: 200, success: true, message: result.message, data: { resetToken: result.resetToken } });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);
  sendResponse(res, { statusCode: 200, success: true, message: result.message, data: null });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await AuthService.changePassword(userId as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: result.message, data: null });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await AuthService.getMe(userId as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'User profile retrieved successfully', data: result });
});

export const AuthController = {
  register,
  verifyOtp,
  resendOtp,
  login,
  refreshToken,
  logout,
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
  changePassword,
  getMe,
};
