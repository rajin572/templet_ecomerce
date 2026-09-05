import type { IApiResponse, IMeta } from "./common.type";

export type IComboStatus = "active" | "inactive";

export interface ICombo {
  _id: string;
  name: string;
  productIds: string[];
  comboPrice: number;
  status: IComboStatus;
  createdAt: string;
}

export type IGetComboListResponse = IApiResponse<{ data: ICombo[]; meta: IMeta }>;

export interface IComboFormValues {
  name: string;
  productIds: string[];
  comboPrice: number;
  status: IComboStatus;
}
