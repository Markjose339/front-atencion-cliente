import { api } from "@/lib/api";
import { AssignmentSchemaType } from "@/lib/schemas/assignment.schema";
import { Assignment } from "@/types/assignment";
import { ApiResponse } from "@/types/api-response";
import { UseQuery } from "@/types/use-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAssignmentsQuery({ page, limit, search }: UseQuery) {
  const findAllAssignments = useQuery({
    queryKey: ["assignments", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page!.toString(),
        limit: limit!.toString(),
        ...(search && { search }),
      });

      return api.get<ApiResponse<Assignment>>(`/assignments?${params.toString()}`);
    },
    staleTime: 30_000,
  });

  return { findAllAssignments };
}

export function useAssignmentsMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (values: AssignmentSchemaType) =>
      api.post<Assignment>("/assignments", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"], exact: false });
    },
  });

  const update = useMutation({
    mutationFn: (assignment: { id: string; values: AssignmentSchemaType }) =>
      api.patch<Assignment>(`/assignments/${assignment.id}`, assignment.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"], exact: false });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<Assignment>(`/assignments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"], exact: false });
    },
  });

  return { create, update, remove };
}
