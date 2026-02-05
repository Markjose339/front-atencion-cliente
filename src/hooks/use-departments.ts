import { api } from "@/lib/api";
import { DepartmentSchemaType } from "@/lib/schemas/department";
import { ApiResponse } from "@/types/api-response";
import { Department } from "@/types/department";
import { UseQuery } from "@/types/use-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDepartmentsQuery({ page, limit, search }: UseQuery) {
  const findAllDepartments = useQuery({
    queryKey: ["departments", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page!.toString(),
        limit: limit!.toString(),
        ...(search && { search }),
      });

      return api.get<ApiResponse<Department>>(
        `/departments?${params.toString()}`
      );
    },
    staleTime: 30_000,
  });

  return { findAllDepartments };
}

export function useDepartmentsMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (values: DepartmentSchemaType) =>
      api.post<Department>("/departments", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"], exact: false });
    },
  });

  const update = useMutation({
    mutationFn: (department: { id: string; values: DepartmentSchemaType }) =>
      api.patch<Department>(`/departments/${department.id}`, department.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"], exact: false });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<Department>(`/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"], exact: false });
    },
  });

  return { create, update, remove };
}
