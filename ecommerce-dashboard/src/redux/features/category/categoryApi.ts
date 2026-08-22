import { baseApi } from "../../api/baseApi";
import { tagTypes } from "../../tagTypes";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query({
      query: (arg: Record<string, any>) => ({
        url: "/categories",
        method: "GET",
        params: arg,
      }),
      providesTags: [tagTypes.category],
    }),

    getCategoryById: build.query({
      query: (id: string) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.category],
    }),

    createCategory: build.mutation({
      query: (data) => ({
        url: "/categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.category],
    }),

    updateCategory: build.mutation({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.category],
    }),

    deleteCategory: build.mutation({
      query: (id: string) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.category],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
