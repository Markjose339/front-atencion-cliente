"use client";

import {
  Loader2,
  Moon,
  RefreshCw,
  Settings2,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Announcements } from "@/components/announcements";
import { ClientTicketDisplay } from "@/components/client-ticket-display";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  requiresConfiguration: boolean;
  onToggleVoice: () => void;
  onReload: () => void;
  onOpenSettings: () => void;
};

export function PublicDisplayBoard({
  tickets,
  isLoading,
  errorMessage,
  isVoiceSupported,
  voiceEnabled,
  requiresConfiguration,
  onToggleVoice,
  onReload,
  onOpenSettings,
}: PublicDisplayBoardProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkTheme = resolvedTheme === "dark";
  const handleToggleTheme = () => {
    setTheme(isDarkTheme ? "light" : "dark");
  };

  return (
    <main className="relative isolate h-dvh w-full overflow-hidden bg-[#f4f8ff] text-[#0C3E63] dark:bg-[#0C3E63] dark:text-[#e9f2ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_8%,rgba(32,83,154,0.24),transparent_38%),radial-gradient(circle_at_92%_4%,rgba(253,203,53,0.25),transparent_34%),linear-gradient(175deg,#f7fbff_0%,#e9f1ff_56%,#fff7db_100%)] dark:bg-[radial-gradient(circle_at_8%_8%,rgba(32,83,154,0.45),transparent_38%),radial-gradient(circle_at_92%_4%,rgba(240,224,73,0.2),transparent_34%),linear-gradient(165deg,#0C3E63_0%,#1f3b62_58%,#0C3E63_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(17,69,145,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(17,69,145,0.12)_1px,transparent_1px)] bg-[size:38px_38px] dark:bg-[linear-gradient(rgba(240,224,73,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(240,224,73,0.12)_1px,transparent_1px)]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="px-3 pb-2 pt-3 sm:px-5 sm:pb-3 sm:pt-4">
          <div className="flex items-center justify-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-[#20539A]/45 bg-white text-[#114591] hover:border-[#114591] hover:bg-[#e9f1ff] dark:border-[#5e81ab]/70 dark:bg-[#123d64] dark:text-[#deebff] dark:hover:border-[#86a9d9] dark:hover:bg-[#114591]"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Pantalla publica</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={onOpenSettings}>
                  <Settings2 className="h-4 w-4" />
                  Configurar pantalla
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={onReload}>
                  <RefreshCw className="h-4 w-4" />
                  Refrescar tickets
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={handleToggleTheme}>
                  {isDarkTheme ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Modo claro
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Modo oscuro
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={onToggleVoice}
                  disabled={!isVoiceSupported}
                  title={
                    isVoiceSupported
                      ? "Activar o desactivar voz"
                      : "Tu navegador no soporta voz"
                  }
                >
                  {voiceEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Voz activa
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      Voz apagada
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <section className="grid min-h-0 flex-1 grid-rows-[minmax(0,4fr)_minmax(0,1fr)] gap-3 px-3 pb-3 sm:gap-4 sm:px-5 sm:pb-5">
          <div className="min-h-0 rounded-3xl border border-slate-200 bg-white/90 p-3 shadow-[0_26px_46px_-36px_rgba(15,23,42,0.8)] dark:border-[#55779f]/65 dark:bg-[#163a5f]/82 dark:shadow-[0_28px_48px_-36px_rgba(0,0,0,0.82)] sm:p-4">
            <Announcements />
          </div>

          <div className="min-h-0 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_28px_48px_-38px_rgba(15,23,42,0.82)] dark:border-[#55779f]/65 dark:bg-[#163a5f]/86 dark:shadow-[0_30px_52px_-38px_rgba(0,0,0,0.84)] sm:p-5">
            {isLoading ? (
              <div className="flex h-full min-h-22.5 items-center justify-center text-sm text-[#20539A] dark:text-[#c2d6f1]">
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

            {!isLoading && !errorMessage && tickets.length > 0 ? (
              <div className="grid h-full grid-cols-1 gap-3 overflow-auto pr-1 sm:grid-cols-6">
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
              <div className="flex h-full min-h-[90px] items-center justify-center rounded-2xl border border-dashed border-slate-300/70 bg-slate-50/80 p-4 text-center text-sm text-slate-600 dark:border-[#5f82ac]/50 dark:bg-[#173a5e]/70 dark:text-[#c6d9f2]">
                {requiresConfiguration ? (
                  <div className="space-y-3">
                    <p>Configure la pantalla para empezar a recibir tickets llamados.</p>
                    <Button type="button" size="sm" variant="outline" onClick={onOpenSettings}>
                      <Settings2 className="mr-2 h-4 w-4" />
                      Abrir configuracion
                    </Button>
                  </div>
                ) : (
                  "No hay tickets llamados para los servicios seleccionados."
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
