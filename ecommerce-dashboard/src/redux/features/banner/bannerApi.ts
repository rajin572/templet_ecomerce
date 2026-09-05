import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";
import type { IApiResponse, IGetBannerListResponse } from "@/types";

type MutationArg<B = Record<string, unknown>> = {
  body?: B;
  params?: Record<string, string>;
};

type GetBannersArgs = {
  page: number;
  limit: number;
  searchTerm?: string;
};

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<IGetBannerListResponse, GetBannersArgs>({
      query: ({ page, limit, searchTerm }) => ({
        url: "/admin/banners",
        method: "GET",
        params: { page, limit, searchTerm },
      }),
      providesTags: [tagTypes.banner],
    }),

    createBanner: builder.mutation<IApiResponse<null>, MutationArg<FormData>>({
      query: ({ body }) => ({
        url: "/admin/banners",
        method: "POST",
        body,
      }),
      invalidatesTags: [tagTypes.banner],
    }),

    updateBanner: builder.mutation<IApiResponse<null>, MutationArg<FormData>>({
      query: ({ body, params }) => ({
        url: `/admin/banners/${params?.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.banner],
    }),

    toggleBannerActive: builder.mutation<IApiResponse<null>, MutationArg<{ isActive: boolean }>>({
      query: ({ body, params }) => ({
        url: `/admin/banners/${params?.id}/toggle-active`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.banner],
    }),

    deleteBanner: builder.mutation<IApiResponse<null>, MutationArg>({
      query: ({ params }) => ({
        url: `/admin/banners/${params?.id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.banner],
    }),
  }),
});

export const {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useToggleBannerActiveMutation,
  useDeleteBannerMutation,
} = bannerApi;
