"use client"

import { CustomerService } from "@/types/customer-service"
import { Button } from "../ui/button";
import { useCustomerServiceMutation } from "@/hooks/use-customer-service";
import { toast } from "sonner";

interface CustomerServiceActionsProps {
  customerService: CustomerService;
}

export function CustomerServiceActions({ customerService }: CustomerServiceActionsProps) {
  const { startTicketAttention, endTicketAttention } = useCustomerServiceMutation()

  async function onSubmitStartTicketAttention(id: string) {
    toast.promise(startTicketAttention.mutateAsync(id), {
      loading: "Iniciando atención...",
      success: (data) => data.message,
      error: (error) => error.message
    });
  }

  async function onSubmitEndTicketAttention(id: string) {
    toast.promise(endTicketAttention.mutateAsync(id), {
      loading: "Finalizando atención...",
      success: (data) => data.message,
      error: (error) => error.message
    });
  }

  const isInAttention = customerService.attentionStartedAt !== null && customerService.attentionFinishedAt === null;

  return (
    <div>
      {isInAttention ? (
        <Button
          type="button"
          onClick={() => onSubmitEndTicketAttention(customerService.id)}
          disabled={endTicketAttention.isPending}
          variant="destructive"
        >
          {endTicketAttention.isPending ? "Finalizando..." : "Finalizar"}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={() => onSubmitStartTicketAttention(customerService.id)}
          disabled={startTicketAttention.isPending}
        >
          {startTicketAttention.isPending ? "Atendiendo..." : "Atender"}
        </Button>
      )}
    </div>
  )
}