import { api } from "@/lib/api";
import { ServiceWindowsSchemaType } from "@/lib/schemas/service-windows.schema";
import { ApiResponse } from "@/types/api-response";
import { ServiceWindow } from "@/types/service-window";
import { UseQuery } from "@/types/use-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useServiceWindowsQuery({ page, limit, search }: UseQuery) {
  const findAll = useQuery({
    queryKey: ["service-windows", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page!.toString(),
        limit: limit!.toString(),
        ...(search && { search }),
      });
      return api.get<ApiResponse<ServiceWindow>>(`/service-windows?${params.toString()}`);
    },
    staleTime: 30_000,
  });

  return { findAll };
}

export function useServiceWindowsMutation() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (values: ServiceWindowsSchemaType) =>
      api.post<ServiceWindow>("/service-windows", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-windows"], exact: false });
    },
  });

  const update = useMutation({
    mutationFn: (serviceWindow: { id: string; values: ServiceWindowsSchemaType }) =>
      api.patch<ServiceWindow>(`/service-windows/${serviceWindow.id}`, serviceWindow.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-windows"], exact: false });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<ServiceWindow>(`/service-windows/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-windows"], exact: false });
    },
  });

  return { create, update, remove }
}