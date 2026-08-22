import { Settings } from './settings.model';

const create = async (payload: any) => await Settings.create(payload);
const getAll = async () => await Settings.find();

export const SettingsService = { create, getAll };
