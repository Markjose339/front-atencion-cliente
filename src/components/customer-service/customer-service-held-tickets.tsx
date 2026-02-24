import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CustomerServiceHeldTicket } from "@/types/customer-service";

import { CustomerServiceStatusBadge } from "./customer-service-status-badge";
import { formatCustomerServiceDate } from "./customer-service-utils";

interface CustomerServiceHeldTicketsProps {
  tickets: CustomerServiceHeldTicket[];
  maxHeldTickets: number;
  loadingRecallById: Record<string, boolean>;
  loadingStartById: Record<string, boolean>;
  activeCalledTicketId: string | null;
  activeAttendingTicketId: string | null;
  isAttendingTicket: boolean;
  recallBlockedByCalledMessage: string | null;
  recallBlockedByAttendingMessage: string | null;
  resumeBlockedByCalledMessage: string | null;
  resumeBlockedByAttendingMessage: string | null;
  onSelectTicket: (ticket: CustomerServiceHeldTicket) => void;
  onRecall: (ticket: CustomerServiceHeldTicket) => void;
  onResumeAttention: (ticket: CustomerServiceHeldTicket) => void;
}

export function CustomerServiceHeldTickets({
  tickets,
  maxHeldTickets,
  loadingRecallById,
  loadingStartById,
  activeCalledTicketId,
  activeAttendingTicketId,
  isAttendingTicket,
  recallBlockedByCalledMessage,
  recallBlockedByAttendingMessage,
  resumeBlockedByCalledMessage,
  resumeBlockedByAttendingMessage,
  onSelectTicket,
  onRecall,
  onResumeAttention,
}: CustomerServiceHeldTicketsProps) {
  return (
    <section className="rounded-xl border bg-background shadow-sm">
      <div className="flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold">Tickets en espera del operador</h2>
        <Badge variant={tickets.length >= maxHeldTickets ? "destructive" : "secondary"}>
          En espera: {tickets.length}/{maxHeldTickets}
        </Badge>
      </div>

      <div className="space-y-3 p-4">
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay tickets en espera.</p>
        ) : (
          tickets.map((ticket) => {
            const waitingReference =
              ticket.attentionStartedAt ?? ticket.calledAt ?? ticket.createdAt;
            const isTicketRecalling = Boolean(loadingRecallById[ticket.id]);
            const isTicketStarting = Boolean(loadingStartById[ticket.id]);
            const isRecallBlockedByCalledTicket =
              Boolean(activeCalledTicketId) && activeCalledTicketId !== ticket.id;
            const isRecallBlockedByAttendingTicket =
              (Boolean(activeAttendingTicketId) && activeAttendingTicketId !== ticket.id) ||
              isAttendingTicket;
            const isResumeBlockedByCalledTicket =
              Boolean(activeCalledTicketId) && activeCalledTicketId !== ticket.id;
            const isResumeBlockedByAttendingTicket =
              (Boolean(activeAttendingTicketId) && activeAttendingTicketId !== ticket.id) ||
              isAttendingTicket;
            const disableRecallButton =
              isTicketRecalling ||
              isTicketStarting ||
              isRecallBlockedByCalledTicket ||
              isRecallBlockedByAttendingTicket;
            const disableResumeButton =
              isTicketStarting ||
              isTicketRecalling ||
              isResumeBlockedByCalledTicket ||
              isResumeBlockedByAttendingTicket;
            const recallTooltip = isRecallBlockedByAttendingTicket
              ? recallBlockedByAttendingMessage
              : isRecallBlockedByCalledTicket
                ? recallBlockedByCalledMessage
                : null;
            const resumeTooltip = isResumeBlockedByAttendingTicket
              ? resumeBlockedByAttendingMessage
              : isResumeBlockedByCalledTicket
                ? resumeBlockedByCalledMessage
                : null;

            return (
              <article
                key={ticket.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectTicket(ticket)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectTicket(ticket);
                  }
                }}
                className="flex cursor-pointer flex-col gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-1 text-sm">
                  <div>
                    Ticket en espera: <strong>{ticket.code}</strong>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Servicio: <strong>{ticket.serviceName}</strong>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Referencia: {formatCustomerServiceDate(waitingReference)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <CustomerServiceStatusBadge status={ticket.status} />

                  {recallTooltip ? (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={(event) => {
                              event.stopPropagation();
                              onRecall(ticket);
                            }}
                            disabled={disableRecallButton}
                          >
                            {isTicketRecalling ? "Re-llamando..." : "Re-llamar"}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">{recallTooltip}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRecall(ticket);
                      }}
                      disabled={disableRecallButton}
                    >
                      {isTicketRecalling ? "Re-llamando..." : "Re-llamar"}
                    </Button>
                  )}

                  {resumeTooltip ? (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Button
                            type="button"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              onResumeAttention(ticket);
                            }}
                            disabled={disableResumeButton}
                          >
                            {isTicketStarting ? "Reanudando..." : "Reanudar atencion"}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">{resumeTooltip}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onResumeAttention(ticket);
                      }}
                      disabled={disableResumeButton}
                    >
                      {isTicketStarting ? "Reanudando..." : "Reanudar atencion"}
                    </Button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
