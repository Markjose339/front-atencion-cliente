import { api } from "@/lib/api";
import { UserCreateSchemaType, UserUpdateSchemaType } from "@/lib/schemas/user.schema";
import { ApiResponse } from "@/types/api-response";
import { UseQuery } from "@/types/use-query";
import { User } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useUsersQuery({ page, limit, search }: UseQuery) {
  const findAll = useQuery({
    queryKey: ["users", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page!.toString(),
        limit: limit!.toString(),
        ...(search && { search }),
      });
      return api.get<ApiResponse<User>>(`/users?${params.toString()}`)
    },
    staleTime: 30_000,
  })

  return { findAll }
}

export function useUsersMutation() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (values: UserCreateSchemaType) =>
      api.post<User>("/users", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false })
    }
  })

  const update = useMutation({
    mutationFn: (user: { id: string; values: UserUpdateSchemaType }) =>
      api.patch<User>(`/users/${user.id}`, user.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false })
    }
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<User>(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"], exact: false })
    }
  })

  return { create, update, remove }
}