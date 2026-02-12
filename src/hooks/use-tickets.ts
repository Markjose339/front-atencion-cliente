import { api } from "@/lib/api";
import { TicketSchema, TicketSchemaType } from "@/lib/schemas/ticket.schema";
import { Ticket } from "@/types/ticket";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useTicketsMutation() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (values: TicketSchemaType) => {
      const payload = TicketSchema.parse(values)
      return api.post<Ticket>("/tickets", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"], exact: false })
      queryClient.invalidateQueries({
        queryKey: ["customer-service", "queue"],
        exact: false,
      })
    },
  })

  return { create }
}
