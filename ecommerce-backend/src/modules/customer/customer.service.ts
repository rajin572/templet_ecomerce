import { Customer } from './customer.model';

const create = async (payload: any) => await Customer.create(payload);
const getAll = async () => await Customer.find();

export const CustomerService = { create, getAll };
