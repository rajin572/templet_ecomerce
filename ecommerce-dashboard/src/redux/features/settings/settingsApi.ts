import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSettingss: build.query({
      query: (arg) => ({
        url: "/settingss",
        method: "GET",
        params: arg,
      }),
      providesTags: [tagTypes.settings],
    }),

    getSettingsById: build.query({
      query: (id) => ({
        url: `/settingss/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.settings],
    }),

    createSettings: build.mutation({
      query: (data) => ({
        url: "/settingss",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.settings],
    }),

    updateSettings: build.mutation({
      query: ({ id, data }) => ({
        url: `/settingss/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.settings],
    }),

    deleteSettings: build.mutation({
      query: (id) => ({
        url: `/settingss/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.settings],
    }),
  }),
});

export const {
  useGetSettingssQuery,
  useGetSettingsByIdQuery,
  useCreateSettingsMutation,
  useUpdateSettingsMutation,
  useDeleteSettingsMutation,
} = settingsApi;
