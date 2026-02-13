"use client";

import {
  BellRing,
  Loader2,
  Mic,
  MicOff,
  RefreshCw,
  Settings2,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Announcements } from "@/components/announcements";
import { ClientTicketDisplay } from "@/components/client-ticket-display";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { PublicDisplayCalledTicket } from "@/types/public-display";

type PublicDisplayBoardProps = {
  branchName: string;
  selectedServiceNames: string[];
  tickets: PublicDisplayCalledTicket[];
  isLoading: boolean;
  isFetching: boolean;
  errorMessage: string | null;
  isVoiceSupported: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onReload: () => void;
  onOpenSettings: () => void;
};

export function PublicDisplayBoard({
  branchName,
  selectedServiceNames,
  tickets,
  isLoading,
  isFetching,
  errorMessage,
  isVoiceSupported,
  voiceEnabled,
  onToggleVoice,
  onReload,
  onOpenSettings,
}: PublicDisplayBoardProps) {
  const latestTicket = tickets[0] ?? null;
  const servicesLabel =
    selectedServiceNames.length > 0 ? selectedServiceNames.join(", ") : "Sin servicios";

  return (
    <main className="relative isolate h-dvh w-full overflow-hidden bg-[#f4f8ff] text-[#0C3E63] dark:bg-[#0C3E63] dark:text-[#e9f2ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_8%,rgba(32,83,154,0.24),transparent_38%),radial-gradient(circle_at_92%_4%,rgba(253,203,53,0.25),transparent_34%),linear-gradient(175deg,#f7fbff_0%,#e9f1ff_56%,#fff7db_100%)] dark:bg-[radial-gradient(circle_at_8%_8%,rgba(32,83,154,0.45),transparent_38%),radial-gradient(circle_at_92%_4%,rgba(240,224,73,0.2),transparent_34%),linear-gradient(165deg,#0C3E63_0%,#1f3b62_58%,#0C3E63_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(17,69,145,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(17,69,145,0.12)_1px,transparent_1px)] bg-[size:38px_38px] dark:bg-[linear-gradient(rgba(240,224,73,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(240,224,73,0.12)_1px,transparent_1px)]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="px-3 pb-2 pt-3 sm:px-5 sm:pb-3 sm:pt-4">
          <div className="rounded-2xl border border-[#20539A]/35 bg-white/85 px-4 py-3 shadow-[0_18px_30px_-24px_rgba(12,62,99,0.75)] backdrop-blur dark:border-[#5f82ac]/65 dark:bg-[#1b446e]/80 dark:shadow-[0_20px_34px_-24px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.09em] text-[#114591] dark:text-[#FDCB35]">
                  Pantalla publica
                </p>
                <h1 className="truncate text-xl font-bold sm:text-2xl">{branchName}</h1>
                <p className="mt-1 text-xs text-[#20539A] dark:text-[#bdd1ed] sm:text-sm">
                  Servicios: {servicesLabel}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ModeToggle buttonClassName="h-10 w-10 border-[#20539A]/45 bg-white text-[#114591] hover:border-[#114591] hover:bg-[#e9f1ff] dark:border-[#5e81ab]/70 dark:bg-[#123d64] dark:text-[#deebff] dark:hover:border-[#86a9d9] dark:hover:bg-[#114591]" />

                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-[#20539A]/45 bg-white text-[#114591] hover:border-[#114591] hover:bg-[#e9f1ff] dark:border-[#5e81ab]/70 dark:bg-[#123d64] dark:text-[#deebff] dark:hover:border-[#86a9d9] dark:hover:bg-[#114591]"
                  onClick={onOpenSettings}
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  Configurar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-[#20539A]/45 bg-white text-[#114591] hover:border-[#114591] hover:bg-[#e9f1ff] dark:border-[#5e81ab]/70 dark:bg-[#123d64] dark:text-[#deebff] dark:hover:border-[#86a9d9] dark:hover:bg-[#114591]"
                  onClick={onReload}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refrescar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-[#20539A]/45 bg-white text-[#114591] hover:border-[#114591] hover:bg-[#e9f1ff] dark:border-[#5e81ab]/70 dark:bg-[#123d64] dark:text-[#deebff] dark:hover:border-[#86a9d9] dark:hover:bg-[#114591]"
                  onClick={onToggleVoice}
                  disabled={!isVoiceSupported}
                  title={
                    isVoiceSupported
                      ? "Activar o desactivar voz"
                      : "Tu navegador no soporta voz"
                  }
                >
                  {voiceEnabled ? (
                    <>
                      <Volume2 className="mr-2 h-4 w-4" />
                      Voz activa
                    </>
                  ) : (
                    <>
                      <VolumeX className="mr-2 h-4 w-4" />
                      Voz apagada
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 px-3 pb-3 sm:gap-4 sm:px-5 sm:pb-5 xl:grid-cols-[1.4fr_1fr]">
          <div className="min-h-0 rounded-3xl border border-slate-200 bg-white/90 p-3 shadow-[0_26px_46px_-36px_rgba(15,23,42,0.8)] dark:border-[#55779f]/65 dark:bg-[#163a5f]/82 dark:shadow-[0_28px_48px_-36px_rgba(0,0,0,0.82)] sm:p-4">
            <Announcements />
          </div>

          <div className="min-h-0 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_28px_48px_-38px_rgba(15,23,42,0.82)] dark:border-[#55779f]/65 dark:bg-[#163a5f]/86 dark:shadow-[0_30px_52px_-38px_rgba(0,0,0,0.84)] sm:p-5">
            <header className="mb-4 border-b border-slate-200 pb-3 dark:border-[#5f82ac]/45">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
                  <BellRing className="h-5 w-5 text-[#114591] dark:text-[#FDCB35]" />
                  Tickets llamados
                </h2>

                {isFetching ? (
                  <span className="inline-flex items-center gap-1 text-xs text-[#20539A] dark:text-[#bdd1ed]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Actualizando
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-sm text-slate-600 dark:text-[#c9dbf3]">
                Revise su ticket y pase a la ventanilla indicada.
              </p>
            </header>

            {isLoading ? (
              <div className="flex h-[220px] items-center justify-center text-sm text-[#20539A] dark:text-[#c2d6f1]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando tickets...
              </div>
            ) : null}

            {!isLoading && errorMessage ? (
              <div className="space-y-3 rounded-2xl border border-amber-400/35 bg-amber-50/70 p-4 text-sm text-amber-800 dark:border-amber-300/35 dark:bg-amber-100/10 dark:text-amber-100">
                <p>{errorMessage}</p>
                <Button type="button" size="sm" variant="outline" onClick={onReload}>
                  Reintentar
                </Button>
              </div>
            ) : null}

            {!isLoading && !errorMessage && latestTicket ? (
              <div className="mb-4 rounded-2xl border border-[#20539A]/25 bg-[#eef4ff] p-4 dark:border-[#6b8fbe]/45 dark:bg-[#1e446e]">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#20539A] dark:text-[#d7e7ff]">
                  Ultimo llamado
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0C3E63] dark:text-[#f2f7ff]">
                  {latestTicket.code}
                </p>
                <p className="mt-1 text-sm text-[#20539A] dark:text-[#d0e1f8]">
                  {latestTicket.windowName} - Tipo {latestTicket.serviceName}
                </p>

                <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#20539A]/30 bg-white/75 px-2 py-1 text-xs text-[#114591] dark:border-[#6b8fbe]/45 dark:bg-[#163a5f] dark:text-[#d9e7fb]">
                  {voiceEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                  {isVoiceSupported
                    ? voiceEnabled
                      ? "Anuncio por voz activo"
                      : "Anuncio por voz apagado"
                    : "Voz no soportada"}
                </div>
              </div>
            ) : null}

            {!isLoading && !errorMessage && tickets.length > 0 ? (
              <div className="grid max-h-[46vh] grid-cols-1 gap-3 overflow-auto pr-1 sm:grid-cols-2">
                {tickets.map((ticket) => (
                  <ClientTicketDisplay
                    key={ticket.id}
                    code={ticket.code}
                    window={ticket.windowName}
                    serviceName={ticket.serviceName}
                  />
                ))}
              </div>
            ) : null}

            {!isLoading && !errorMessage && tickets.length === 0 ? (
              <div className="flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-300/70 bg-slate-50/80 text-sm text-slate-600 dark:border-[#5f82ac]/50 dark:bg-[#173a5e]/70 dark:text-[#c6d9f2]">
                No hay tickets llamados para los servicios seleccionados.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
