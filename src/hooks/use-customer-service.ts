import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/contexts/auth-context";
import { ensureOperatorQueueRegistration } from "@/lib/socket";
import { useSocket } from "@/hooks/use-socket";
import { api } from "@/lib/api";
import {
  customerServiceCallNextSchema,
  CustomerServiceCallNextSchemaType,
  customerServiceQueueQuerySchema,
  customerServiceTicketIdSchema,
} from "@/lib/schemas/customer-service.schema";
import { ApiResponse } from "@/types/api-response";
import { OperatorAssignment, WindowServiceAssignment } from "@/types/assignment";
import {
  CustomerServiceCallNextResponse,
  CustomerServiceMutationResponse,
  CustomerServiceRecallResponse,
  CustomerServiceResponse,
  CustomerServiceWindowOption,
} from "@/types/customer-service";
import { UseQuery } from "@/types/use-query";

const ASSIGNMENTS_LIMIT = 100;

const CUSTOMER_SERVICE_QUERY_KEY = ["customer-service"] as const;
const CUSTOMER_SERVICE_QUEUE_QUERY_KEY = [
  ...CUSTOMER_SERVICE_QUERY_KEY,
  "queue",
] as const;

const getUserWindowOptions = async (
  userId: string,
): Promise<CustomerServiceWindowOption[]> => {
  let operatorsPage = 1;
  let operatorsTotalPages = 1;
  const operatorRows: OperatorAssignment[] = [];

  while (operatorsPage <= operatorsTotalPages) {
    const params = new URLSearchParams({
      page: operatorsPage.toString(),
      limit: ASSIGNMENTS_LIMIT.toString(),
    });

    const response = await api.get<ApiResponse<OperatorAssignment>>(
      `/assignments/operators?${params.toString()}`,
    );

    operatorsTotalPages = response.meta.totalPages ?? 1;
    operatorRows.push(...response.data);
    operatorsPage += 1;
  }

  let windowServicesPage = 1;
  let windowServicesTotalPages = 1;
  const windowServicesRows: WindowServiceAssignment[] = [];

  while (windowServicesPage <= windowServicesTotalPages) {
    const params = new URLSearchParams({
      page: windowServicesPage.toString(),
      limit: ASSIGNMENTS_LIMIT.toString(),
    });

    const response = await api.get<ApiResponse<WindowServiceAssignment>>(
      `/assignments/window-services?${params.toString()}`,
    );

    windowServicesTotalPages = response.meta.totalPages ?? 1;
    windowServicesRows.push(...response.data);
    windowServicesPage += 1;
  }

  const activeOperators = operatorRows.filter(
    (operator) => operator.user?.id === userId && operator.isActive,
  );

  const servicesByBranchWindow = new Map<string, WindowServiceAssignment[]>();

  windowServicesRows
    .filter((row) => row.isActive)
    .forEach((row) => {
      const key = `${row.branch.id}:${row.window.id}`;
      const list = servicesByBranchWindow.get(key) ?? [];
      list.push(row);
      servicesByBranchWindow.set(key, list);
    });

  const options = new Map<string, CustomerServiceWindowOption>();

  activeOperators.forEach((operator) => {
    const key = `${operator.branch.id}:${operator.window.id}`;
    const services = servicesByBranchWindow.get(key) ?? [];

    services.forEach((row) => {
      const optionKey = `${row.branch.id}:${row.service.id}`;

      if (!options.has(optionKey)) {
        options.set(optionKey, {
          branchId: row.branch.id,
          branchName: row.branch.name,
          serviceId: row.service.id,
          serviceName: row.service.name,
          serviceCode: row.service.code,
          windowId: operator.window.id,
          windowName: operator.window.name,
        });
      }
    });
  });

  return Array.from(options.values()).sort((a, b) =>
    `${a.windowName} ${a.serviceName}`.localeCompare(
      `${b.windowName} ${b.serviceName}`,
      "es",
    ),
  );
};

export function useCustomerServiceWindows() {
  const { user } = useAuth();

  const windowsQuery = useQuery({
    queryKey: [...CUSTOMER_SERVICE_QUERY_KEY, "windows", user?.id],
    enabled: !!user?.id,
    queryFn: () => getUserWindowOptions(user!.id),
    staleTime: 60_000,
  });

  return { windowsQuery };
}

export function useCustomerServiceQuery({
  page,
  limit,
  search,
  branchId,
  serviceId,
}: UseQuery & { branchId?: string; serviceId?: string }) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const findPendingTicketsByUserServiceWindow = useQuery({
    queryKey: [
      ...CUSTOMER_SERVICE_QUEUE_QUERY_KEY,
      branchId,
      serviceId,
      page,
      limit,
      search,
    ],
    enabled: !!branchId && !!serviceId,
    queryFn: async () => {
      const paramsPayload = customerServiceQueueQuerySchema.parse({
        branchId,
        serviceId,
        page,
        limit,
        search: search || undefined,
      });

      const params = new URLSearchParams({
        branchId: paramsPayload.branchId,
        serviceId: paramsPayload.serviceId,
        page: paramsPayload.page.toString(),
        limit: paramsPayload.limit.toString(),
      });

      if (paramsPayload.search) {
        params.set("search", paramsPayload.search);
      }

      return api.get<CustomerServiceResponse>(
        `/customer-service/queue?${params.toString()}`,
      );
    },
    staleTime: 30_000,
    refetchInterval: 10_000,
  });

  useEffect(() => {
    if (!socket) {
      return;
    }

    const registerOperatorRooms = () => {
      ensureOperatorQueueRegistration(socket).catch((e) => {
        console.error("❌ queue:register failed", e);
      });
    };

    registerOperatorRooms();
    socket.on("connect", registerOperatorRooms);

    return () => {
      socket.off("connect", registerOperatorRooms);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const invalidateQueue = () => {
      queryClient.invalidateQueries({
        queryKey: CUSTOMER_SERVICE_QUEUE_QUERY_KEY,
        exact: false,
      });
    };

    const events = [
      "ticket:created",
      "ticket:updated",
      "ticket:called",
      "ticket:recalled",
      "ticket:held",
      "ticket:started",
      "ticket:finished",
      "ticket:cancelled",
    ];

    events.forEach((event) => {
      socket.on(event, invalidateQueue);
    });

    return () => {
      events.forEach((event) => {
        socket.off(event, invalidateQueue);
      });
    };
  }, [socket, queryClient]);

  return { findPendingTicketsByUserServiceWindow };
}

export function useCustomerServiceMutation() {
  const queryClient = useQueryClient();

  const invalidateCustomerService = () => {
    queryClient.invalidateQueries({
      queryKey: CUSTOMER_SERVICE_QUERY_KEY,
      exact: false,
    });
  };

  const callNextTicket = useMutation({
    mutationFn: async (values: CustomerServiceCallNextSchemaType) => {
      const payload = customerServiceCallNextSchema.parse(values);
      return api.post<CustomerServiceCallNextResponse | null>(
        "/customer-service/queue/call-next",
        payload,
      );
    },
    onSuccess: invalidateCustomerService,
  });

  const recallTicket = useMutation({
    mutationFn: async (ticketId: string) => {
      const parsedTicketId = customerServiceTicketIdSchema.parse(ticketId);
      return api.patch<CustomerServiceRecallResponse>(
        `/customer-service/${parsedTicketId}/recall`,
      );
    },
    onSuccess: invalidateCustomerService,
  });

  const startTicketAttention = useMutation({
    mutationFn: async (ticketId: string) => {
      const parsedTicketId = customerServiceTicketIdSchema.parse(ticketId);
      return api.patch<CustomerServiceMutationResponse>(
        `/customer-service/${parsedTicketId}/start`,
      );
    },
    onSuccess: invalidateCustomerService,
  });

  const holdTicket = useMutation({
    mutationFn: async (ticketId: string) => {
      const parsedTicketId = customerServiceTicketIdSchema.parse(ticketId);
      return api.patch<CustomerServiceMutationResponse>(
        `/customer-service/${parsedTicketId}/hold`,
      );
    },
    onSuccess: invalidateCustomerService,
  });

  const finishTicketAttention = useMutation({
    mutationFn: async (ticketId: string) => {
      const parsedTicketId = customerServiceTicketIdSchema.parse(ticketId);
      return api.patch<CustomerServiceMutationResponse>(
        `/customer-service/${parsedTicketId}/finish`,
      );
    },
    onSuccess: invalidateCustomerService,
  });

  const cancelTicket = useMutation({
    mutationFn: async (ticketId: string) => {
      const parsedTicketId = customerServiceTicketIdSchema.parse(ticketId);
      return api.patch<CustomerServiceMutationResponse>(
        `/customer-service/${parsedTicketId}/cancel`,
      );
    },
    onSuccess: invalidateCustomerService,
  });

  return {
    callNextTicket,
    recallTicket,
    startTicketAttention,
    holdTicket,
    finishTicketAttention,
    cancelTicket,
  };
}
