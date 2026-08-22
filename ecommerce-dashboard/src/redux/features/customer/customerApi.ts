import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";

export const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCustomers: build.query({
      query: (arg) => ({
        url: "/customers",
        method: "GET",
        params: arg,
      }),
      providesTags: [tagTypes.customer],
    }),

    getCustomerById: build.query({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.customer],
    }),

    createCustomer: build.mutation({
      query: (data) => ({
        url: "/customers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.customer],
    }),

    updateCustomer: build.mutation({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.customer],
    }),

    deleteCustomer: build.mutation({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.customer],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;
