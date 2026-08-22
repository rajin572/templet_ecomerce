export interface IDashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeUsers: number;
  totalListings: number;
}

export interface IRevenueBookingsTrendPoint {
  month: string;
  Revenue: number;
}

export interface ITransportDistributionItem {
  category: string;
  percentage: number;
}

export type VerificationFileStatus = "completed" | "pending";

export interface IPendingVerificationFile {
  name: string;
  status: VerificationFileStatus;
}

export interface IPendingVerification {
  _id: string;
  ownerName: string;
  documentType: string;
  submittedLabel: string;
  files: IPendingVerificationFile[];
}

export type DashboardBookingStatus = "confirmed" | "pending" | "completed" | "cancelled";
export type TransportType = "Boat" | "Air" | "Land";

export interface IBookingTimelineEvent {
  label: string;
  dateLabel: string;
}

export interface IRecentBooking {
  _id: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  listingTitle: string;
  transportType: TransportType;
  featured: boolean;
  amount: number;
  status: DashboardBookingStatus;
  bookingDate: string;
  bookedDaysAgoLabel: string;
  duration: string;
  guests: number;
  basePrice: number;
  timeline: IBookingTimelineEvent[];
}

export interface ITopListing {
  _id: string;
  rank: number;
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
}

export interface IDashboardOverviewData {
  stats: IDashboardStats;
  revenueBookingsTrend: IRevenueBookingsTrendPoint[];
  transportDistribution: ITransportDistributionItem[];
  pendingVerifications: IPendingVerification[];
  recentBookings: IRecentBooking[];
  topListings: ITopListing[];
}

export interface IGetDashboardOverviewResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IDashboardOverviewData;
}
