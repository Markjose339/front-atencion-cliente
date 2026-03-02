"use client";

import { Loader2, Settings2 } from "lucide-react";
import { motion } from "motion/react";

import { PublicDisplayCalledTicket } from "@/types/public-display";
import { ClientTicketDisplay } from "@/components/public-display/client-ticket-display";
import { Button } from "@/components/ui/button";

type TicketGridProps = {
  tickets: PublicDisplayCalledTicket[];
  isLoading: boolean;
  errorMessage: string | null;
  highlightedKeySet: Set<string>;
  requiresConfiguration: boolean;
  onReload: () => void;
  onOpenSettings: () => void;
};

const sig = (t: PublicDisplayCalledTicket) => `${t.id}:${t.calledAt ?? t.createdAt}`;

export function TicketGrid({
  tickets,
  isLoading,
  errorMessage,
  highlightedKeySet,
  requiresConfiguration,
  onReload,
  onOpenSettings,
}: TicketGridProps) {
  return (
    <div
      className={[
        "relative min-h-0 overflow-hidden",
        "bg-[#0D3358]/95 dark:bg-white/86",
        "shadow-[0_28px_52px_-36px_rgba(5,15,30,0.9)]",
        "border-b border-[#00529C]/25 dark:border-[#4A7BA5]/35",
      ].join(" ")}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-[#C6A856]/60 to-transparent" />

      <div className="h-full">
        {isLoading && (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-[#7BAFD4] dark:text-[#3A6A9A]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando tickets…
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="rounded-xl border border-amber-400/30 bg-amber-50/10 px-6 py-4 text-center text-sm text-amber-300 dark:text-amber-700">
              <p className="mb-3">{errorMessage}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onReload}
                className="border-amber-400/50 text-amber-300 hover:bg-amber-400/10 dark:text-amber-700"
              >
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !errorMessage && tickets.length > 0 && (
          <div className="grid h-full grid-cols-1 grid-rows-2 gap-3 overflow-auto sm:grid-cols-6">
            {tickets.map((ticket) => {
              const ticketAlertKey = sig(ticket);
              const isRecentlyCalled = highlightedKeySet.has(ticketAlertKey);

              return (
                <motion.div
                  key={String(ticket.id)}          
                  layout                           
                  initial={false}                  
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isRecentlyCalled ? 1.03 : 1,
                  }}
                  transition={{
                    duration: 0.55,
                    ease: "easeInOut",
                  }}
                  className="transform-gpu will-change-transform"
                >
                  <ClientTicketDisplay
                    code={ticket.code}
                    window={ticket.windowName}
                    type={ticket.type}
                    isRecentlyCalled={isRecentlyCalled}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {!isLoading && !errorMessage && tickets.length === 0 && (
          <div className="flex h-full items-center justify-center">
            {requiresConfiguration ? (
              <div className="space-y-4 text-center">
                <p className="text-sm text-[#7BAFD4] dark:text-[#4A7BA5]">
                  Configure la pantalla para empezar a recibir tickets llamados.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onOpenSettings}
                  className="border-[#C6A856]/50 text-[#C6A856] hover:bg-[#C6A856]/10"
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  Abrir configuración
                </Button>
              </div>
            ) : (
              <p className="text-sm text-[#7BAFD4]/70 dark:text-[#4A7BA5]/80">
                No hay tickets llamados para los servicios seleccionados.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}