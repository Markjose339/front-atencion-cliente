import { CustomerServiceTicketType, TicketStatus } from "@/types/customer-service";

export interface PublicDisplayConfig {
  branchId: string;
  serviceIds: string[];
}

export interface PublicDisplayCalledTicket {
  id: string;
  code: string;
  type: CustomerServiceTicketType;
  status: TicketStatus;
  branchId: string;
  branchName: string;
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  windowId: string;
  windowName: string;
  calledAt: string | null;
  createdAt: string;
}

export type PublicDisplaySocketEventName =
  | "ticket:called"
  | "ticket:recalled"
  | "ticket:held"
  | "ticket:updated"
  | "ticket:started"
  | "ticket:finished"
  | "ticket:cancelled";
