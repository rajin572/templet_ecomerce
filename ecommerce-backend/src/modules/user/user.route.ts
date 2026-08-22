import express from 'express';
import { UserController } from './user.controller';
import { auth } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';

const router = express.Router();

router.get('/me', auth, UserController.getMe);
router.patch('/me', auth, validateRequest(UserValidation.updateProfileSchema), UserController.updateMe);

export const UserRoutes = router;
