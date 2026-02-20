import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateOperatorAssignmentSchemaType,
  CreateWindowServiceAssignmentSchemaType,
  UpdateOperatorAssignmentSchemaType,
  UpdateWindowServiceAssignmentSchemaType,
} from "@/lib/schemas/assignment.schema";
import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api-response";
import {
  BranchAssignmentsConfigResponse,
  BranchWindowsResponse,
  OperatorsSyncPayload,
  OperatorsSyncResponse,
  OperatorAssignment,
  WindowServicesSyncPayload,
  WindowServicesSyncResponse,
  WindowServiceAssignment,
  WindowServiceAssignmentBulkResponse,
} from "@/types/assignment";
import { UseQuery } from "@/types/use-query";

export function useWindowServiceAssignmentsQuery({ page, limit, search }: UseQuery) {
  const findAllWindowServices = useQuery({
    queryKey: ["assignments", "window-services", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      return api.get<ApiResponse<WindowServiceAssignment>>(
        `/assignments/window-services?${params.toString()}`,
      );
    },
    staleTime: 30_000,
  });

  return { findAllWindowServices };
}

export function useOperatorAssignmentsQuery({ page, limit, search }: UseQuery) {
  const findAllOperators = useQuery({
    queryKey: ["assignments", "operators", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      return api.get<ApiResponse<OperatorAssignment>>(
        `/assignments/operators?${params.toString()}`,
      );
    },
    staleTime: 30_000,
  });

  return { findAllOperators };
}

export function useBranchWindowsQuery(branchId: string) {
  const findBranchWindows = useQuery({
    queryKey: ["assignments", "branches", branchId, "windows"],
    enabled: branchId.trim().length > 0,
    queryFn: () =>
      api.get<BranchWindowsResponse>(
        `/assignments/branches/${encodeURIComponent(branchId)}/windows`,
      ),
    staleTime: 30_000,
  });

  return { findBranchWindows };
}

export function useBranchAssignmentsConfigQuery(branchId: string) {
  const findBranchConfig = useQuery({
    queryKey: ["assignments", "branches", branchId, "config"],
    enabled: branchId.trim().length > 0,
    queryFn: () =>
      api.get<BranchAssignmentsConfigResponse>(
        `/assignments/branches/${encodeURIComponent(branchId)}/config`,
      ),
    staleTime: 30_000,
  });

  return { findBranchConfig };
}

export function useWindowServiceAssignmentsMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (values: CreateWindowServiceAssignmentSchemaType) =>
      api.post<WindowServiceAssignmentBulkResponse>("/assignments/window-services", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", "window-services"], exact: false });
    },
  });

  const update = useMutation({
    mutationFn: (payload: { id: string; values: UpdateWindowServiceAssignmentSchemaType }) =>
      api.patch<WindowServiceAssignment>(`/assignments/window-services/${payload.id}`, payload.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", "window-services"], exact: false });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<WindowServiceAssignment>(`/assignments/window-services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", "window-services"], exact: false });
    },
  });

  return { create, update, remove };
}

export function useWindowServicesSyncMutation() {
  const queryClient = useQueryClient();

  const sync = useMutation({
    mutationFn: (payload: WindowServicesSyncPayload) =>
      api.put<WindowServicesSyncResponse>("/assignments/window-services/sync", payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["assignments", "branches", variables.branchId, "config"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["assignments", "window-services"], exact: false });
    },
  });

  return { sync };
}

export function useOperatorAssignmentsMutation() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (values: CreateOperatorAssignmentSchemaType) =>
      api.post<OperatorAssignment>("/assignments/operators", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", "operators"], exact: false });
    },
  });

  const update = useMutation({
    mutationFn: (payload: { id: string; values: UpdateOperatorAssignmentSchemaType }) =>
      api.patch<OperatorAssignment>(`/assignments/operators/${payload.id}`, payload.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", "operators"], exact: false });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<OperatorAssignment>(`/assignments/operators/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", "operators"], exact: false });
    },
  });

  return { create, update, remove };
}

export function useOperatorsSyncMutation() {
  const queryClient = useQueryClient();

  const sync = useMutation({
    mutationFn: (payload: OperatorsSyncPayload) =>
      api.put<OperatorsSyncResponse>("/assignments/operators/sync", payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["assignments", "branches", variables.branchId, "config"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["assignments", "operators"], exact: false });
    },
  });

  return { sync };
}
