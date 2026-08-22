import { IGetDashboardOverviewResponse } from "@/types";
import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";

const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<IGetDashboardOverviewResponse, void>({
      query: () => ({
        url: "/admin/dashboard/overview",
        method: "GET",
      }),
      providesTags: [tagTypes.dashboard],
    }),
    approveVerification: builder.mutation<unknown, { params: { id: string } }>({
      query: (req) => ({
        url: `/admin/dashboard/verifications/${req.params.id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.dashboard],
    }),
    rejectVerification: builder.mutation<unknown, { params: { id: string }; body: { reason?: string } }>({
      query: (req) => ({
        url: `/admin/dashboard/verifications/${req.params.id}/reject`,
        method: "PATCH",
        body: req.body,
      }),
      invalidatesTags: [tagTypes.dashboard],
    }),
    confirmBooking: builder.mutation<unknown, { params: { id: string } }>({
      query: (req) => ({
        url: `/admin/dashboard/bookings/${req.params.id}/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.dashboard],
    }),
    cancelBooking: builder.mutation<unknown, { params: { id: string } }>({
      query: (req) => ({
        url: `/admin/dashboard/bookings/${req.params.id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.dashboard],
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useConfirmBookingMutation,
  useCancelBookingMutation,
} = dashboardApi;

export default dashboardApi;
