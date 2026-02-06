import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { UseQuery } from "@/types/use-query";
import { Service } from "@/types/service";
import { ServiceSchemaType } from "@/lib/schemas/service.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useServicesQuery({ page, limit, search }: UseQuery) {
  const findAll = useQuery({
    queryKey: ["services", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page!.toString(),
        limit: limit!.toString(),
        ...(search && { search }),
      });

      return api.get<ApiResponse<Service>>(`/services?${params.toString()}`);
    },
    staleTime: 30_000,
  });

  return { findAll };
}

export function useServicesMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (values: ServiceSchemaType) =>
      api.post<Service>("/services", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"], exact: false });
    },
  });

  const update = useMutation({
    mutationFn: (service: { id: string; values: ServiceSchemaType }) =>
      api.patch<Service>(`/services/${service.id}`, service.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"], exact: false });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<Service>(`/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"], exact: false });
    },
  });

  return { create, update, remove };
}
