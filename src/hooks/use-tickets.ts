import { api } from "@/lib/api";
import { TicketSchemaType } from "@/lib/schemas/ticket.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useTicketsMutation() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (values: TicketSchemaType) =>
      api.post("/tickets", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"], exact: false })
    }
  })

  return { create }
}