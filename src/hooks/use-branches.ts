import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { UseQuery } from "@/types/use-query";
import { Branch } from "@/types/branch";
import { BranchSchemaType } from "@/lib/schemas/branch.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useBranchesQuery({
  page,
  limit,
  search,
  departmentId,
}: UseQuery & { departmentId?: string }) {
  const findAllBranches = useQuery({
    queryKey: ["branches", page, limit, search, departmentId],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page!.toString(),
        limit: limit!.toString(),
        ...(search && { search }),
        ...(departmentId && { departmentId }),
      });

      return api.get<ApiResponse<Branch>>(`/branches?${params.toString()}`);
    },
    staleTime: 30_000,
  });

  return { findAllBranches };
}

export function useBranchesMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (values: BranchSchemaType) => api.post<Branch>("/branches", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"], exact: false });
    },
  });

  const update = useMutation({
    mutationFn: (branch: { id: string; values: Partial<BranchSchemaType> }) =>
      api.patch<Branch>(`/branches/${branch.id}`, branch.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"], exact: false });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<Branch>(`/branches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"], exact: false });
    },
  });

  return { create, update, remove };
}
