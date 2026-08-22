import { Finance } from './finance.model';

const create = async (payload: any) => await Finance.create(payload);
const getAll = async () => await Finance.find();

export const FinanceService = { create, getAll };
