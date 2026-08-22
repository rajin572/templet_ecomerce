import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import { jwtHelpers } from '../utils/jwtHelpers';
import { User } from '../modules/user/user.model';
import { Role } from '../modules/role/role.model';
import { Permission } from '../modules/permission/permission.model';
import { Types } from 'mongoose';
import { config } from '../app/config';

export const auth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Contract: Authorization: Bearer <accessToken>
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : undefined;

  if (!token) {
    throw new ApiError(401, 'You are not logged in');
  }

  const decoded = jwtHelpers.verifyToken(token, config.jwt.accessSecret);
  
  const user = await User.findById(decoded.userId).populate({
    path: 'role',
    populate: {
      path: 'permissions'
    }
  });

  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists');
  }

  if (user.status !== 'active') {
    throw new ApiError(403, 'User account is not active');
  }

  const roleObj = user.role as any;
  const permissions = roleObj?.permissions?.map((p: any) => p.action) || [];

  if (roleObj.slug === 'super_admin') {
    // Super admin inherently gets all permissions, but we can resolve them explicitly
    const allPerms = await Permission.find();
    req.user = {
      userId: user._id.toString(),
      role: roleObj.slug,
      email: user.email,
      permissions: allPerms.map(p => p.action)
    };
  } else {
    req.user = {
      userId: user._id.toString(),
      role: roleObj.slug,
      email: user.email,
      permissions
    };
  }

  next();
});
