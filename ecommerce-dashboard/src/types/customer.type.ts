import type { IApiResponse, IMeta } from "./common.type";

export type ICustomerType = "Registered" | "Guest" | "Offline";
export type ICustomerStatus = "Active" | "Blocked";

export interface ICustomer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  orders: number;
  spent: number;
  type: ICustomerType;
  status: ICustomerStatus;
  joinedAt: string;
}

export type IGetCustomerListResponse = IApiResponse<{ data: ICustomer[]; meta: IMeta }>;
