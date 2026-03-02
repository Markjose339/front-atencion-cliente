"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Building2,
  Landmark,
  Loader2,
  Maximize2,
  Minimize2,
  PrinterCheck,
  PrinterX,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"

import { ChoiceCard } from "@/components/tickets/choice-card"
import { TicketCreate } from "@/components/tickets/ticket-create"
import { Button } from "@/components/ui/button"
import { useKioskBranch, usePublicBranches } from "@/hooks/use-public"
import { useQZPrinter } from "@/hooks/use-qz-printer"
import { cn } from "@/lib/utils"
import { ModeToggle } from "../mode-toggle"

const IDLE_RESET_MS = 2 * 60 * 1000

export default function TicketKioskClient() {
  const { data: branches, isLoading: loadingBranches } = usePublicBranches()
  const { branchId, selectBranch, resetBranch } = useKioskBranch(branches)

  const [sessionKey, setSessionKey] = useState(0)
  const view = useMemo<"setup" | "tickets">(() => (branchId ? "tickets" : "setup"), [branchId])

  const [showAdminControls, setShowAdminControls] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const {
    isConnected: isPrinterConnected,
    isChecking: isPrinterChecking,
    printTicket,
  } = useQZPrinter()

  const idleTimer = useRef<number | null>(null)

  const onSelectBranch = (value: string) => {
    selectBranch(value)
    toast.success("Sucursal configurada para este kiosco")
  }

  const onResetBranch = () => {
    resetBranch()
    setSessionKey(0)
    toast.success("Configuracion reiniciada")
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "m") {
        e.preventDefault()
        setShowAdminControls((v) => !v)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", onFsChange)
    onFsChange()
    return () => document.removeEventListener("fullscreenchange", onFsChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      toast.error("No se pudo cambiar a pantalla completa")
    }
  }

  useEffect(() => {
    if (!branchId) return

    const resetSessionByIdle = () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current)

      idleTimer.current = window.setTimeout(() => {
        setSessionKey((prev) => prev + 1)
        toast.message("Sesion reiniciada por inactividad")
      }, IDLE_RESET_MS)
    }

    resetSessionByIdle()

    const events = ["click", "touchstart", "mousemove", "keydown", "scroll"] as const
    events.forEach((event) => window.addEventListener(event, resetSessionByIdle, { passive: true }))

    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current)
      events.forEach((event) => window.removeEventListener(event, resetSessionByIdle))
    }
  }, [branchId])

  if (view === "tickets") {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(17,69,145,0.2),transparent_38%),radial-gradient(circle_at_88%_2%,rgba(253,203,53,0.2),transparent_32%)] dark:bg-[radial-gradient(circle_at_12%_12%,rgba(32,83,154,0.35),transparent_38%),radial-gradient(circle_at_88%_2%,rgba(240,224,73,0.15),transparent_35%)]" />
        {showAdminControls ? (
          <div className="fixed left-3 top-3 z-20 flex flex-wrap items-center gap-2 sm:left-5 sm:top-5">
            <span
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-xs font-semibold shadow-[0_20px_32px_-28px_rgba(12,62,99,0.7)] backdrop-blur dark:bg-[#123d64]",
                isPrinterConnected
                  ? "border-[#20539A]/45 text-[#114591] dark:border-[#6a92c7]/60 dark:text-[#e5f0ff]"
                  : "border-[#D38E2A]/55 text-[#D38E2A] dark:border-[#EECA46]/55 dark:text-[#FDCB35]",
              )}
            >
              {isPrinterChecking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPrinterConnected ? (
                <PrinterCheck className="h-4 w-4" />
              ) : (
                <PrinterX className="h-4 w-4" />
              )}
              {isPrinterChecking
                ? "Verificando impresora..."
                : isPrinterConnected
                  ? "Impresora lista"
                  : "Impresora no detectada"}
            </span>

            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-[#20539A]/45 bg-white px-4 text-[#114591] shadow-[0_20px_32px_-28px_rgba(12,62,99,0.7)] backdrop-blur hover:border-[#114591] hover:bg-[#e8f0ff] dark:border-[#5f82ac]/70 dark:bg-[#123d64] dark:text-[#dce9ff] dark:hover:border-[#87aadc] dark:hover:bg-[#114591]"
              onClick={onResetBranch}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Cambiar sucursal
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-[#20539A]/45 bg-white px-3 text-[#114591] shadow-[0_20px_32px_-28px_rgba(12,62,99,0.7)] backdrop-blur hover:border-[#114591] hover:bg-[#e8f0ff] dark:border-[#5f82ac]/70 dark:bg-[#123d64] dark:text-[#dce9ff] dark:hover:border-[#87aadc] dark:hover:bg-[#114591]"
              onClick={toggleFullscreen}
              title="Pantalla completa"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            <ModeToggle />
          </div>
        ) : null}

        <div className="flex h-full justify-center items-center">
          <div className="min-h-0 flex-1">
            <TicketCreate key={sessionKey} branchId={branchId} onPrintTicket={printTicket} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="h-full w-full overflow-auto px-4 py-6 sm:px-6 sm:py-9">
      <div className="mx-auto w-full max-w-6xl rounded-[2.1rem] border-2 border-[#20539A]/35 bg-[linear-gradient(145deg,#ffffff_0%,#f1f7ff_48%,#fff5d5_100%)] p-6 shadow-[0_30px_52px_-34px_rgba(12,62,99,0.65)] dark:border-[#EECA46]/45 dark:bg-[linear-gradient(145deg,#14345c_0%,#0C3E63_54%,#213661_100%)] dark:shadow-[0_32px_54px_-34px_rgba(0,0,0,0.82)] sm:p-8">
        <header className="mb-6 border-b border-[#20539A]/25 pb-6 text-center dark:border-[#EECA46]/35">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#114591] text-[#F0E049] shadow-[0_14px_28px_-18px_rgba(12,62,99,0.95)] dark:bg-[#FDCB35] dark:text-[#0C3E63]">
            <Landmark className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold text-[#0C3E63] dark:text-[#F0E049] sm:text-3xl">
            Configuracion inicial del kiosco
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-[#20539A] dark:text-[#FDCB35] sm:text-base">
            Seleccione la sucursal para habilitar la emision de tickets. Esta configuracion queda
            guardada localmente en el equipo.
          </p>
        </header>

        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(branches ?? []).map((branch) => (
              <ChoiceCard
                key={branch.id}
                title={branch.name}
                description={branch.departmentName}
                badge="Sucursal"
                icon={<Building2 className="h-7 w-7" />}
                tone="primary"
                onClick={() => onSelectBranch(branch.id)}
                disabled={loadingBranches}
              />
            ))}
          </div>

          {loadingBranches ? (
            <p className="text-center text-sm text-[#20539A] dark:text-[#FDCB35]">
              Cargando sucursales...
            </p>
          ) : null}

          {!loadingBranches && (branches?.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#20539A]/35 bg-white/70 p-8 text-center text-sm text-[#20539A] dark:border-[#EECA46]/45 dark:bg-[#213661]/50 dark:text-[#FDCB35]">
              No hay sucursales activas disponibles para este kiosco.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
