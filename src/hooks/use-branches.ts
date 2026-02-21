import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import { UseQuery } from "@/types/use-query";
import { Branch } from "@/types/branch";
import { BranchSchemaType } from "@/lib/schemas/branch.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const BRANCHES_BATCH_LIMIT = 100;

const getAllBranches = async (): Promise<Branch[]> => {
  let page = 1;
  let totalPages = 1;
  const rows: Branch[] = [];

  while (page <= totalPages) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: BRANCHES_BATCH_LIMIT.toString(),
    });

    const response = await api.get<ApiResponse<Branch>>(
      `/branches?${params.toString()}`,
    );

    totalPages = response.meta.totalPages ?? 1;
    rows.push(...response.data);
    page += 1;
  }

  return rows;
};

export function useBranchesQuery({
  page,
  limit,
  search,
}: UseQuery) {
  const findAllBranches = useQuery({
    queryKey: ["branches", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page!.toString(),
        limit: limit!.toString(),
        ...(search && { search }),
      });

      return api.get<ApiResponse<Branch>>(`/branches?${params.toString()}`);
    },
    staleTime: 30_000,
  });

  return { findAllBranches };
}

export function useAllBranchesQuery() {
  const findAllBranchesOptions = useQuery({
    queryKey: ["branches", "all"],
    queryFn: getAllBranches,
    staleTime: 60_000,
  });

  return { findAllBranchesOptions };
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
