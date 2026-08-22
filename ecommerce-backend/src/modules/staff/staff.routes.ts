import express from 'express';
import { StaffController } from './staff.controller';
import { auth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/requirePermission';
import { PERMISSIONS } from '../../constants/permissions';

const router = express.Router();

router.get(
  '/',
  auth,
  requirePermission(PERMISSIONS.STAFF_VIEW),
  StaffController.getAllStaff
);

router.post(
  '/',
  auth,
  requirePermission(PERMISSIONS.STAFF_CREATE),
  StaffController.createStaff
);

router.get(
  '/:id',
  auth,
  requirePermission(PERMISSIONS.STAFF_VIEW),
  StaffController.getStaffById
);

router.patch(
  '/:id',
  auth,
  requirePermission(PERMISSIONS.STAFF_UPDATE),
  StaffController.updateStaff
);

router.patch(
  '/:id/status',
  auth,
  requirePermission(PERMISSIONS.STAFF_UPDATE),
  StaffController.updateStaffStatus
);

router.patch(
  '/:id/role',
  auth,
  requirePermission(PERMISSIONS.STAFF_MANAGE_ROLES),
  StaffController.updateStaffRole
);

router.post(
  '/:id/force-logout',
  auth,
  requirePermission(PERMISSIONS.STAFF_UPDATE),
  StaffController.forceLogout
);

export const StaffRoutes = router;
