import { api } from "@/lib/api";
import { RoleSchemaType } from "@/lib/schemas/role.schema";
import { ApiResponse } from "@/types/api-response";
import { Role } from "@/types/role";
import { UseQuery } from "@/types/use-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useRolesQuery({ page, limit, search }: UseQuery) {
  const findAllRoles = useQuery({
    queryKey: ["roles", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page!.toString(),
        limit: limit!.toString(),
        ...(search && { search }),
      });
      return api.get<ApiResponse<Role>>(`/roles?${params.toString()}`)
    },
    staleTime: 30_000,
  })

  return { findAllRoles }
}

export function useRolesMutation() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (values: RoleSchemaType) =>
      api.post<Role>("/roles", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"], exact: false })
    }
  })

  const update = useMutation({
    mutationFn: (role: { id: string; values: RoleSchemaType }) =>
      api.patch<Role>(`/roles/${role.id}`, role.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"], exact: false })
    }
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<Role>(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"], exact: false })
    }
  })

  return { create, update, remove }
}