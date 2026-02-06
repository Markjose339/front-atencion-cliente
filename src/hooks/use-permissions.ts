import { api } from "@/lib/api";
import { PermissionSchemaType } from "@/lib/schemas/permission.schema";
import { ApiResponse } from "@/types/api-response";
import { Permission } from "@/types/permission";
import { UseQuery } from "@/types/use-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePermissionsQuery({ page, limit, search }: UseQuery) {
  const findAllPermissions = useQuery({
    queryKey: ["permissions", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page!.toString(),
        limit: limit!.toString(),
        ...(search && { search }),
      });
      return api.get<ApiResponse<Permission>>(`/permissions?${params.toString()}`);
    },
    staleTime: 30_000,
  });

  return { findAllPermissions };
}

export function usePermissionsMutation() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (values: PermissionSchemaType) =>
      api.post<Permission>("/permissions", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"], exact: false });
    },
  });

  const update = useMutation({
    mutationFn: (permission: { id: string; values: PermissionSchemaType }) =>
      api.patch<Permission>(`/permissions/${permission.id}`, permission.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"], exact: false });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<Permission>(`/permissions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"], exact: false });
    },
  });

  return { create, update, remove }
}