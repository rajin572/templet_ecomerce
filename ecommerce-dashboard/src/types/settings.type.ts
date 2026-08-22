export interface IAdminProfile {
  fullName: string;
  email: string;
  profileImage: string | null;
}

export interface IGetProfileResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IAdminProfile;
}
