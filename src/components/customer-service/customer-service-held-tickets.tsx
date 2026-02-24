import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CustomerServiceTicket } from "@/types/customer-service";

import { CustomerServiceStatusBadge } from "./customer-service-status-badge";
import { formatCustomerServiceDate } from "./customer-service-utils";

interface CustomerServiceHeldTicketsProps {
  tickets: CustomerServiceTicket[];
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
  onRecall: (ticket: CustomerServiceTicket) => void;
  onResumeAttention: (ticket: CustomerServiceTicket) => void;
}

export function CustomerServiceHeldTickets({
  tickets,
  loadingRecallById,
  loadingStartById,
  activeCalledTicketId,
  activeAttendingTicketId,
  isAttendingTicket,
  recallBlockedByCalledMessage,
  recallBlockedByAttendingMessage,
  resumeBlockedByCalledMessage,
  resumeBlockedByAttendingMessage,
  onRecall,
  onResumeAttention,
}: CustomerServiceHeldTicketsProps) {
  return (
    <section className="rounded-xl border bg-background shadow-sm">
      <div className="flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold">Tickets en espera</h2>
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
                className="flex flex-col gap-3 rounded-lg border p-3 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-1 text-sm">
                  <div>
                    Ticket en espera: <strong>{ticket.code}</strong>
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
                            onClick={() => onRecall(ticket)}
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
                      onClick={() => onRecall(ticket)}
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
                            onClick={() => onResumeAttention(ticket)}
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
                      onClick={() => onResumeAttention(ticket)}
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
