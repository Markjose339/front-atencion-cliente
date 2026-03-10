export interface TicketRatingRealtimeState {
  ticketId: string;
  code: string;
  status: string;
  windowId: string;
  canRate: boolean;
  isPaused: boolean;
  isRated: boolean;
  rating: number | null;
}

export interface TicketRatingResponse {
  ticketId?: string;
  score?: number;
  rating?: number;
  message?: string;
}
