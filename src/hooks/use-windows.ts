import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { UseQuery } from "@/types/use-query";
import { Window } from "@/types/window";
import { WindowSchemaType } from "@/lib/schemas/window.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useWindowsQuery({ page, limit, search }: UseQuery) {
  const findAllWindows = useQuery({
    queryKey: ["windows", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page!.toString(),
        limit: limit!.toString(),
        ...(search && { search }),
      });

      return api.get<ApiResponse<Window>>(`/windows?${params.toString()}`);
    },
    staleTime: 30_000,
  });

  return { findAllWindows };
}

export function useWindowsMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (values: WindowSchemaType) => api.post<Window>("/windows", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["windows"], exact: false });
    },
  });

  const update = useMutation({
    mutationFn: (window: { id: string; values: WindowSchemaType }) =>
      api.patch<Window>(`/windows/${window.id}`, window.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["windows"], exact: false });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<Window>(`/windows/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["windows"], exact: false });
    },
  });

  return { create, update, remove };
}
