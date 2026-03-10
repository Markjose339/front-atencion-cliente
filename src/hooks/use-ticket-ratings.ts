import { useMutation } from "@tanstack/react-query";

import { api } from "@/lib/api";
import {
  ticketRatingCreateSchema,
  TicketRatingCreateSchemaType,
} from "@/lib/schemas/ticket-rating.schema";
import { TicketRatingResponse } from "@/types/ticket-rating";

export function useTicketRatingsMutation() {
  const createTicketRating = useMutation({
    mutationFn: async (values: TicketRatingCreateSchemaType) => {
      const payload = ticketRatingCreateSchema.parse(values);
      return api.post<TicketRatingResponse>("/ticket-ratings", payload);
    },
  });

  return { createTicketRating };
}
