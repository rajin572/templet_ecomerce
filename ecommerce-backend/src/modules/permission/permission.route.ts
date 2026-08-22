import express from 'express';
import { PermissionController } from './permission.controller';
import { auth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/requirePermission';
import { PERMISSIONS } from '../../constants/permissions';

const router = express.Router();

router.get(
  '/',
  auth,
  requirePermission(PERMISSIONS.STAFF_MANAGE_PERMISSIONS),
  PermissionController.getPermissions
);

export const PermissionRoutes = router;
