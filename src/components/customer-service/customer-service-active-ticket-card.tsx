import { AlertCircle } from "lucide-react";

import { CustomerServiceStatusBadge } from "@/components/customer-service/customer-service-status-badge";
import { Button } from "@/components/ui/button";
import {
  CustomerServiceCalledTicket,
  CustomerServiceTicket,
} from "@/types/customer-service";

import { formatCustomerServiceDate } from "./customer-service-utils";

interface CustomerServiceActiveTicketCardProps {
  calledTicket: CustomerServiceCalledTicket | null;
  attendingTicket: CustomerServiceTicket | null;
  isAttendingTicket: boolean;
  onRecall: () => void;
  onStartAttention: () => void;
  onHoldAttention: () => void;
  onCancelCalled: () => void;
  onFinishAttention: () => void;
  recalling: boolean;
  starting: boolean;
  holding: boolean;
  disableHoldAttention: boolean;
  cancelling: boolean;
  finishing: boolean;
}

export function CustomerServiceActiveTicketCard({
  calledTicket,
  attendingTicket,
  isAttendingTicket,
  onRecall,
  onStartAttention,
  onHoldAttention,
  onCancelCalled,
  onFinishAttention,
  recalling,
  starting,
  holding,
  disableHoldAttention,
  cancelling,
  finishing,
}: CustomerServiceActiveTicketCardProps) {
  if (!calledTicket && !attendingTicket && !isAttendingTicket) {
    return null;
  }

  if (isAttendingTicket && !attendingTicket && !calledTicket) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-50 px-4 py-3">
        <AlertCircle className="h-5 w-5 text-amber-600" />
        <p className="text-sm text-amber-700">
          Ya tienes un ticket en atencion. Limpia el filtro de busqueda para verlo.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1 text-sm">
          {attendingTicket ? (
            <>
              <div>
                Ticket en atencion: <strong>{attendingTicket.code}</strong>
              </div>
              <div className="text-xs text-muted-foreground">
                Inicio: {formatCustomerServiceDate(attendingTicket.attentionStartedAt)}
              </div>
            </>
          ) : calledTicket ? (
            <>
              <div>
                Ticket llamado: <strong>{calledTicket.code}</strong>
              </div>
              <div className="text-xs text-muted-foreground">
                Llamado: {formatCustomerServiceDate(calledTicket.calledAt)}
              </div>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CustomerServiceStatusBadge
            status={attendingTicket?.status ?? calledTicket?.status ?? "PENDIENTE"}
          />

          {calledTicket && !attendingTicket && (
            <>
              <Button type="button" onClick={onStartAttention} disabled={starting}>
                {starting ? "Iniciando..." : "Iniciar atencion"}
              </Button>
              <Button type="button" variant="outline" onClick={onRecall} disabled={recalling}>
                {recalling ? "Llamando..." : "Llamar de nuevo"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onCancelCalled}
                disabled={cancelling}
              >
                {cancelling ? "Cancelando..." : "Cancelar"}
              </Button>
            </>
          )}

          {attendingTicket && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onHoldAttention}
                disabled={holding || finishing || disableHoldAttention}
              >
                {holding ? "Poniendo en espera..." : "Poner en espera"}
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={onFinishAttention}
                disabled={finishing || holding}
              >
                {finishing ? "Finalizando..." : "Finalizar atencion"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
