import { Request, Response, NextFunction } from 'express';
import ApiError from '../errors/ApiError';

export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions || [];
    
    // Check if the user has AT LEAST ONE of the required permissions
    // Or maybe ALL of them? Usually we just need one of them if it's an array for a specific route?
    // Wait, the spec says `requirePermission(...perms) checks the resolved set`.
    // Usually it means "has all of the required permissions" if multiple are passed for a single operation.
    
    const hasPermission = requiredPermissions.every(perm => 
      userPermissions.includes(perm)
    );

    if (!hasPermission && req.user?.role !== 'super_admin') {
      throw new ApiError(403, 'You do not have the required permissions to perform this action');
    }

    next();
  };
};
