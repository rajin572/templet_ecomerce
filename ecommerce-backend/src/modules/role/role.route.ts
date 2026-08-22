import express from 'express';
import { RoleController } from './role.controller';
import validateRequest from '../../middlewares/validateRequest';
import { RoleValidation } from './role.validation';
import { auth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/requirePermission';
import { PERMISSIONS } from '../../constants/permissions';

const router = express.Router();

router.get(
  '/',
  auth,
  requirePermission(PERMISSIONS.STAFF_MANAGE_ROLES),
  RoleController.getRoles
);

router.post(
  '/',
  auth,
  requirePermission(PERMISSIONS.STAFF_MANAGE_ROLES),
  validateRequest(RoleValidation.createRoleZodSchema),
  RoleController.createRole
);

router.get(
  '/:id',
  auth,
  requirePermission(PERMISSIONS.STAFF_MANAGE_ROLES),
  RoleController.getRoleById
);

router.patch(
  '/:id',
  auth,
  requirePermission(PERMISSIONS.STAFF_MANAGE_ROLES),
  validateRequest(RoleValidation.updateRoleZodSchema),
  RoleController.updateRole
);

router.delete(
  '/:id',
  auth,
  requirePermission(PERMISSIONS.STAFF_MANAGE_ROLES),
  RoleController.deleteRole
);

export const RoleRoutes = router;
