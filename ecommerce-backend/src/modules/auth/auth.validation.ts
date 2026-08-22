import { z } from 'zod';

const register = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    emailOrPhone: z.string({ required_error: 'Email or phone is required' }),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  }),
});

const verifyOtp = z.object({
  body: z.object({
    emailOrPhone: z.string({ required_error: 'Email or phone is required' }),
    code: z.string({ required_error: 'OTP code is required' }),
    name: z.string({ required_error: 'Name is required' }),
    password: z.string().optional(),
    phone: z.string().optional(),
  }),
});

const resendOtp = z.object({
  body: z.object({
    emailOrPhone: z.string({ required_error: 'Email or phone is required' }),
    type: z.enum(['signup', 'forgot', 'order_confirm']),
  }),
});

const login = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email(),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const refreshToken = z.object({
  body: z.object({
    refreshToken: z.string().optional(), // Can also be in cookies
  }),
});

const forgotPassword = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email(),
  }),
});

const verifyForgotOtp = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email(),
    otp: z.string({ required_error: 'OTP is required' }),
  }),
});

const resetPassword = z.object({
  body: z.object({
    resetToken: z.string({ required_error: 'Reset token is required' }),
    newPassword: z.string({ required_error: 'New password is required' }).min(6),
  }),
});

const changePassword = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Old password is required' }),
    newPassword: z.string({ required_error: 'New password is required' }).min(6),
  }),
});

export const AuthValidation = {
  register,
  verifyOtp,
  resendOtp,
  login,
  refreshToken,
  forgotPassword,
  verifyForgotOtp,
  resetPassword,
  changePassword,
};
