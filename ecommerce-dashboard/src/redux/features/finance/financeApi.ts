import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";

export const financeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFinances: build.query({
      query: (arg) => ({
        url: "/finances",
        method: "GET",
        params: arg,
      }),
      providesTags: [tagTypes.finance],
    }),

    getFinanceById: build.query({
      query: (id) => ({
        url: `/finances/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.finance],
    }),

    createFinance: build.mutation({
      query: (data) => ({
        url: "/finances",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.finance],
    }),

    updateFinance: build.mutation({
      query: ({ id, data }) => ({
        url: `/finances/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.finance],
    }),

    deleteFinance: build.mutation({
      query: (id) => ({
        url: `/finances/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.finance],
    }),
  }),
});

export const {
  useGetFinancesQuery,
  useGetFinanceByIdQuery,
  useCreateFinanceMutation,
  useUpdateFinanceMutation,
  useDeleteFinanceMutation,
} = financeApi;
