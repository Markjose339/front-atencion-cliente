import { ApiResponse } from "@/types/api-response";

export type TicketStatus =
  | "PENDIENTE"
  | "LLAMADO"
  | "ATENDIENDO"
  | "FINALIZADO"
  | "CANCELADO";

export type CustomerServiceTicketType = "REGULAR" | "PREFERENCIAL";

export interface CustomerServiceTicket {
  id: string;
  code: string;
  packageCode: string | null;
  type: CustomerServiceTicketType;
  status: TicketStatus;
  branchId: string;
  serviceId: string;
  calledAt: string | null;
  attentionStartedAt: string | null;
  attentionFinishedAt: string | null;
  createdAt: string;
}

export interface CustomerServiceQueueResponse extends ApiResponse<CustomerServiceTicket> {
  isAttendingTicket: boolean;
  calledTicket?: CustomerServiceCalledTicket | null;
}

export interface CustomerServiceCalledTicket {
  id: string;
  code: string;
  type: CustomerServiceTicketType;
  status: TicketStatus;
  branchId: string;
  serviceId: string;
  userId: string | null;
  branchWindowServiceId: string | null;
  calledAt: string | null;
  createdAt: string;
}

export type CustomerService = CustomerServiceTicket;
export type CustomerServiceResponse = CustomerServiceQueueResponse;
export type CustomerServiceCallNextResponse = CustomerServiceCalledTicket;

export interface CustomerServiceWindowOption {
  branchId: string;
  branchName: string;
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  windowId: string;
  windowName: string;
}

export interface CustomerServiceMutationResponse {
  message: string;
}

export interface CustomerServiceRecallResponse extends CustomerServiceMutationResponse {
  ticket: CustomerServiceCalledTicket;
}
