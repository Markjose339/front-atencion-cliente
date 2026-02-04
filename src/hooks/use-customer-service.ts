import { api } from "@/lib/api";
import { CustomerServiceMutationResponse, CustomerServiceResponse } from "@/types/customer-service";
import { UseQuery } from "@/types/use-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "./use-socket";
import { useEffect } from "react";

export function useCustomerServiceQuery({ page, limit, search }: UseQuery) {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  const findPendingTicketsByUserServiceWindow = useQuery({
    queryKey: ["customer-service", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page!.toString(),
        limit: limit!.toString(),
        ...(search && { search }),
      });
      return api.get<CustomerServiceResponse>(`/customer-service?${params.toString()}`);
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleTicket = () => {
      queryClient.invalidateQueries({ queryKey: ["customer-service"], exact: false });
    };

    socket.on('ticket:created', handleTicket);
    socket.on('ticket:updated', handleTicket);
    socket.on('ticket:started', handleTicket);
    socket.on('ticket:ended', handleTicket);

    return () => {
      socket.off('ticket:created', handleTicket);
      socket.off('ticket:updated', handleTicket);
      socket.off('ticket:started', handleTicket);
      socket.off('ticket:ended', handleTicket);
    };
  }, [socket, queryClient]);

  return { findPendingTicketsByUserServiceWindow, isConnected };
}

export function useCustomerServiceMutation() {
  const queryClient = useQueryClient();

  const startTicketAttention = useMutation({
    mutationFn: (ticketId: string) =>
      api.patch<CustomerServiceMutationResponse>(`/customer-service/${ticketId}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-service"], exact: false });
    },
  });

  const endTicketAttention = useMutation({
    mutationFn: (ticketId: string) =>
      api.patch<CustomerServiceMutationResponse>(`/customer-service/${ticketId}/end`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-service"], exact: false });
    }
  });

  return { startTicketAttention, endTicketAttention };
}