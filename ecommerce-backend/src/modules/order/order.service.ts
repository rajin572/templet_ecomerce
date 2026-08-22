import { Order } from './order.model';

const create = async (payload: any) => await Order.create(payload);
const getAll = async () => await Order.find();

export const OrderService = { create, getAll };
