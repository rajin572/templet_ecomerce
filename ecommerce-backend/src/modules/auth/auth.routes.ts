import express from 'express';
import { AuthController } from './auth.controller';
import { auth } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post('/register', validateRequest(AuthValidation.register), AuthController.register);
router.post('/verify-otp', validateRequest(AuthValidation.verifyOtp), AuthController.verifyOtp);
router.post('/resend-otp', validateRequest(AuthValidation.resendOtp), AuthController.resendOtp);
router.post('/login', validateRequest(AuthValidation.login), AuthController.login);
router.post('/refresh-token', validateRequest(AuthValidation.refreshToken), AuthController.refreshToken);
router.post('/logout', auth, AuthController.logout);

router.post('/forgot-password', validateRequest(AuthValidation.forgotPassword), AuthController.forgotPassword);
router.post('/verify-forgot-otp', validateRequest(AuthValidation.verifyForgotOtp), AuthController.verifyForgotOtp);
router.post('/reset-password', validateRequest(AuthValidation.resetPassword), AuthController.resetPassword);

router.patch('/change-password', auth, validateRequest(AuthValidation.changePassword), AuthController.changePassword);
router.get('/me', auth, AuthController.getMe);

export const AuthRoutes = router;
