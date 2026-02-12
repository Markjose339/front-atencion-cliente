export type TicketType = "REGULAR" | "PREFERENCIAL";

export type TicketStatus =
  | "PENDIENTE"
  | "LLAMADO"
  | "ATENDIENDO"
  | "FINALIZADO"
  | "CANCELADO";

export interface Ticket {
  id: string;
  code: string;
  packageCode: string | null;
  type: TicketType;
  status: TicketStatus;
  branchId: string;
  serviceId: string;
  createdAt: string;
}
