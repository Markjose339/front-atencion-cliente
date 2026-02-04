// @/types/customer-service.ts
import { ApiResponse } from "@/types/api-response";

export interface CustomerService {
  id: string;
  code: string;
  packageCode: string;
  type: string;
  attentionStartedAt: string | null;
  attentionFinishedAt: string | null;
  createdAt: Date;
}

export interface CustomerServiceResponse extends ApiResponse<CustomerService> {
  serviceWindowName: string;
  isAttendingTicket: boolean;
}

export interface CustomerServiceMutationResponse {
  message: string;
}