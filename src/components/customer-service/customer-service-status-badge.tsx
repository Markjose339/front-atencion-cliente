import { Badge } from "@/components/ui/badge";
import { TicketStatus } from "@/types/customer-service";

const STATUS_LABELS: Record<TicketStatus, string> = {
  PENDIENTE: "Pendiente",
  LLAMADO: "Llamado",
  ESPERA: "En espera",
  ATENDIENDO: "Atendiendo",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

const STATUS_VARIANTS: Record<
  TicketStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDIENTE: "outline",
  LLAMADO: "secondary",
  ESPERA: "secondary",
  ATENDIENDO: "default",
  FINALIZADO: "outline",
  CANCELADO: "destructive",
};

interface CustomerServiceStatusBadgeProps {
  status: TicketStatus;
}

export function CustomerServiceStatusBadge({ status }: CustomerServiceStatusBadgeProps) {
  return <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}
