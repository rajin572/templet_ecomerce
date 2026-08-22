import { User } from '../user/user.model';
import { IUser } from '../user/user.interface';
import { Otp } from './otp.model';
import { Role } from '../role/role.model';
import { Session } from '../session/session.model';
import { Permission } from '../permission/permission.model';
import ApiError from '../../errors/ApiError';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { jwtHelpers } from '../../utils/jwtHelpers';
import { config } from '../../app/config';
import { sendEmail } from '../../utils/emailSender';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

const OTP_MAX_ATTEMPTS = 3;

/**
 * Counts a wrong guess and throws. On the last allowed attempt the record is
 * consumed, so the cap actually holds — otherwise a later correct guess would
 * still be accepted and the code could be brute-forced.
 */
const registerFailedAttempt = async (
  otpRecord: { code: string; attempts: number; consumedAt?: Date; save: () => Promise<unknown> }
) => {
  otpRecord.attempts += 1;

  if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
    otpRecord.consumedAt = new Date();
    await otpRecord.save();
    throw new ApiError(400, 'Max attempts reached. Please request a new OTP.');
  }

  await otpRecord.save();
  const left = OTP_MAX_ATTEMPTS - otpRecord.attempts;
  throw new ApiError(400, `Invalid OTP. ${left} attempt${left === 1 ? '' : 's'} left.`);
};

const register = async (payload: { name: string; emailOrPhone: string; phone?: string; password?: string }) => {
  const existingUser = await User.findOne({ email: payload.emailOrPhone });
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  // Rate limiting / abuse prevention (basic implementation)
  const existingRecentOtp = await Otp.findOne({ emailOrPhone: payload.emailOrPhone, type: 'signup', createdAt: { $gte: new Date(Date.now() - 60000) } });
  if (existingRecentOtp) {
    throw new ApiError(429, 'Please wait before requesting another OTP');
  }

  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({ emailOrPhone: payload.emailOrPhone, code: otpCode, type: 'signup', expiresAt });

  // Assume email for now, can be extended for SMS
  await sendEmail(
    payload.emailOrPhone,
    'ECommerce - Registration OTP',
    `<h1>Welcome to ECommerce!</h1><p>Your OTP for registration is: <b>${otpCode}</b></p><p>This OTP is valid for 5 minutes.</p>`
  );

  return { message: 'OTP sent successfully. Please verify to complete registration.' };
};

const verifyOtp = async (payload: { emailOrPhone: string; code: string; name: string; password?: string; phone?: string }) => {
  const otpRecord = await Otp.findOne({ emailOrPhone: payload.emailOrPhone, type: 'signup', consumedAt: { $exists: false } }).sort({ createdAt: -1 });

  if (!otpRecord) throw new ApiError(400, 'OTP not found or already consumed');
  if (otpRecord.expiresAt < new Date()) throw new ApiError(400, 'OTP has expired');

  if (otpRecord.code !== payload.code) {
    await registerFailedAttempt(otpRecord);
  }

  otpRecord.consumedAt = new Date();
  await otpRecord.save();

  // Find customer role
  const customerRole = await Role.findOne({ slug: 'user' });
  if (!customerRole) throw new ApiError(500, 'System role customer not found');

  // Do not hash here — the User pre('save') hook owns password hashing.
  const newUser = await User.create({
    name: payload.name,
    email: payload.emailOrPhone,
    phone: payload.phone || payload.emailOrPhone,
    password: payload.password,
    role: customerRole._id,
    emailVerified: true,
  });

  const userObj = newUser.toObject() as Partial<IUser>;
  delete userObj.password;
  return userObj;
};

const resendOtp = async (payload: { emailOrPhone: string; type: 'signup' | 'forgot' | 'order_confirm' }) => {
  const existingRecentOtp = await Otp.findOne({ emailOrPhone: payload.emailOrPhone, type: payload.type, createdAt: { $gte: new Date(Date.now() - 60000) } });
  if (existingRecentOtp) {
    throw new ApiError(429, 'Please wait before requesting another OTP');
  }

  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({ emailOrPhone: payload.emailOrPhone, code: otpCode, type: payload.type, expiresAt });

  await sendEmail(
    payload.emailOrPhone,
    'ECommerce - OTP',
    `<p>Your new OTP is: <b>${otpCode}</b></p><p>This OTP is valid for 5 minutes.</p>`
  );

  return { message: 'OTP resent successfully.' };
};

const login = async (payload: { email: string; password?: string }, ip?: string, device?: string) => {
  const user = await User.findOne({ email: payload.email }).select('+password').populate('role');
  if (!user) throw new ApiError(404, 'User not found');
  if (user.status !== 'active') throw new ApiError(403, 'User account is not active');

  if (!payload.password) throw new ApiError(400, 'Password is required');
  const isPasswordMatched = await bcrypt.compare(payload.password, user.password as string);
  if (!isPasswordMatched) throw new ApiError(401, 'Invalid credentials');

  const roleObj = user.role as any;
  const jwtPayload = { userId: user._id.toString(), role: roleObj.slug, email: user.email };

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.accessSecret,
    config.jwt.accessExpiresIn
  );

  const refreshToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.refreshSecret,
    config.jwt.refreshExpiresIn
  );

  // Store refresh token hash in session
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await Session.create({
    user: user._id,
    refreshTokenHash,
    ip,
    device,
    lastUsedAt: new Date(),
  });

  user.lastLoginAt = new Date();
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: { _id: user._id, name: user.name, email: user.email, role: roleObj.slug, status: user.status },
  };
};

const refreshToken = async (token: string, ip?: string, device?: string) => {
  let decoded;
  try {
    decoded = jwtHelpers.verifyToken(token, config.jwt.refreshSecret);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.userId).populate('role');
  if (!user || user.status !== 'active') throw new ApiError(401, 'User invalid or inactive');

  // Verify token exists in active sessions
  const hashToFind = crypto.createHash('sha256').update(token).digest('hex');
  const validSession = await Session.findOne({ user: user._id, refreshTokenHash: hashToFind, revokedAt: { $exists: false } });

  if (!validSession) throw new ApiError(401, 'Session revoked or invalid');

  const roleObj = user.role as any;
  const jwtPayload = { userId: user._id.toString(), role: roleObj.slug, email: user.email };

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.accessSecret,
    config.jwt.accessExpiresIn
  );

  const newRefreshToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.refreshSecret,
    config.jwt.refreshExpiresIn
  );

  const refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  validSession.refreshTokenHash = refreshTokenHash;
  validSession.lastUsedAt = new Date();
  validSession.ip = ip;
  validSession.device = device;
  await validSession.save();

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (token: string) => {
  const hashToFind = crypto.createHash('sha256').update(token).digest('hex');
  const validSession = await Session.findOne({ refreshTokenHash: hashToFind, revokedAt: { $exists: false } });

  if (validSession) {
    validSession.revokedAt = new Date();
    await validSession.save();
  }

  return { message: 'Logged out successfully' };
};

const forgotPassword = async (payload: { email: string }) => {
  const user = await User.findOne({ email: payload.email });
  if (!user) throw new ApiError(404, 'User not found');

  const existingRecentOtp = await Otp.findOne({ emailOrPhone: payload.email, type: 'forgot', createdAt: { $gte: new Date(Date.now() - 60000) } });
  if (existingRecentOtp) {
    throw new ApiError(429, 'Please wait before requesting another OTP');
  }

  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({ emailOrPhone: payload.email, code: otpCode, type: 'forgot', expiresAt });

  await sendEmail(
    payload.email,
    'ECommerce - Password Reset OTP',
    `<p>Your OTP for password reset is: <b>${otpCode}</b></p><p>Valid for 5 minutes.</p>`
  );

  return { message: 'OTP sent to your email.' };
};

const verifyForgotOtp = async (payload: { email: string; otp: string }) => {
  const otpRecord = await Otp.findOne({ emailOrPhone: payload.email, type: 'forgot', consumedAt: { $exists: false } }).sort({ createdAt: -1 });

  if (!otpRecord) throw new ApiError(400, 'OTP not found or already consumed');
  if (otpRecord.expiresAt < new Date()) throw new ApiError(400, 'OTP has expired');

  if (otpRecord.code !== payload.otp) {
    await registerFailedAttempt(otpRecord);
  }

  otpRecord.consumedAt = new Date();
  await otpRecord.save();

  // Create a reset token (short-lived JWT for password reset)
  const resetToken = jwtHelpers.createToken(
    { email: payload.email },
    config.jwt.accessSecret,
    '15m'
  );

  return { message: 'OTP verified successfully.', resetToken };
};

const resetPassword = async (payload: { resetToken: string; newPassword?: string }) => {
  if (!payload.newPassword) throw new ApiError(400, 'New password is required');

  let decoded;
  try {
    decoded = jwtHelpers.verifyToken(payload.resetToken, config.jwt.accessSecret);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired reset token');
  }

  const user = await User.findOne({ email: decoded.email });
  if (!user) throw new ApiError(404, 'User not found');

  // Assign the plaintext — the User pre('save') hook hashes it.
  user.password = payload.newPassword;
  await user.save();

  return { message: 'Password reset successfully.' };
};

const changePassword = async (userId: string, payload: { oldPassword?: string; newPassword?: string }) => {
  if (!payload.oldPassword || !payload.newPassword) {
    throw new ApiError(400, 'Old and new passwords are required');
  }

  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isPasswordMatched = await bcrypt.compare(payload.oldPassword, user.password as string);
  if (!isPasswordMatched) throw new ApiError(401, 'Incorrect old password');

  // Assign the plaintext — the User pre('save') hook hashes it.
  user.password = payload.newPassword;
  await user.save();

  return { message: 'Password changed successfully.' };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).populate({
    path: 'role',
    populate: { path: 'permissions' }
  });
  if (!user) throw new ApiError(404, 'User not found');

  const roleObj = user.role as any;
  let permissions = roleObj?.permissions?.map((p: any) => p.action) || [];

  if (roleObj.slug === 'super_admin') {
    const allPerms = await Permission.find();
    permissions = allPerms.map(p => p.action);
  }

  const userObj = user.toObject();
  delete userObj.password;

  return {
    ...userObj,
    resolvedPermissions: permissions,
  };
};

export const AuthService = {
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
