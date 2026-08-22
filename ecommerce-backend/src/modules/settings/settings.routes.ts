import express from 'express';
import { SettingsController } from './settings.controller';

const router = express.Router();

router.post('/', SettingsController.create);
router.get('/', SettingsController.getAll);

export const SettingsRoutes = router;
