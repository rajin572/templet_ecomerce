export type IApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: IMeta;
  data: T;
};

export type IMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: {
    path: string | number;
    message: string;
  }[];
};

export type IAuthUser = {
  userId: string;
  role: string;
  email: string;
  permissions?: string[];
};

export type IQueryPayload = Record<string, unknown>;
