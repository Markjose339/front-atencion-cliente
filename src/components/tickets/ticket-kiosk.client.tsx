"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Building2, Clock3, Landmark, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { ChoiceCard } from "@/components/tickets/choice-card"
import { TicketCreate } from "@/components/tickets/ticket-create"
import { Button } from "@/components/ui/button"
import { useKioskBranch, usePublicBranches } from "@/hooks/use-public"

const IDLE_RESET_MS = 2 * 60 * 1000

const formatIdleMinutes = (ms: number): string => {
  const minutes = Math.round(ms / 60_000)
  return `${minutes} min`
}

export default function TicketKioskClient() {
  const { data: branches, isLoading: loadingBranches } = usePublicBranches()
  const { branchId, selectedBranch, selectBranch, resetBranch } = useKioskBranch(branches)

  const [sessionKey, setSessionKey] = useState(0)
  const view = useMemo<"setup" | "tickets">(() => (branchId ? "tickets" : "setup"), [branchId])

  const onSelectBranch = (value: string) => {
    selectBranch(value)
    toast.success("Sucursal configurada para este kiosco")
  }

  const onResetBranch = () => {
    resetBranch()
    setSessionKey(0)
    toast.success("Configuracion reiniciada")
  }

  const idleTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!branchId) {
      return
    }

    const resetSessionByIdle = () => {
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current)
      }

      idleTimer.current = window.setTimeout(() => {
        setSessionKey((prev) => prev + 1)
        toast.message("Sesion reiniciada por inactividad")
      }, IDLE_RESET_MS)
    }

    resetSessionByIdle()

    const events = ["click", "touchstart", "mousemove", "keydown", "scroll"] as const
    events.forEach((event) => {
      window.addEventListener(event, resetSessionByIdle, { passive: true })
    })

    return () => {
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current)
      }

      events.forEach((event) => {
        window.removeEventListener(event, resetSessionByIdle)
      })
    }
  }, [branchId])

  if (view === "tickets") {
    return (
      <div className="relative h-full w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.18),transparent_35%)]" />

        <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-4">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/85 px-4 py-3 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.75)] backdrop-blur sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Kiosco de tickets
              </p>
              <p className="text-base font-semibold text-slate-900 sm:text-lg">
                {selectedBranch?.name ?? "Sucursal seleccionada"}
              </p>
              <p className="text-xs text-slate-600">
                {selectedBranch?.departmentName ?? "Atencion al cliente"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                <Clock3 className="h-3.5 w-3.5" />
                Reinicio por inactividad: {formatIdleMinutes(IDLE_RESET_MS)}
              </span>

              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-xl border-slate-300 bg-white"
                onClick={onResetBranch}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Cambiar sucursal
              </Button>
            </div>
          </header>

          <div className="min-h-0 flex-1">
            <TicketCreate
              key={sessionKey}
              branchId={branchId}
              branchName={selectedBranch?.name}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="h-full w-full overflow-auto px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.65)] backdrop-blur sm:p-8">
        <header className="mb-6 border-b border-slate-200 pb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Landmark className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
            Configuracion inicial del kiosco
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Seleccione la sucursal para habilitar la emision de tickets. Esta configuracion
            queda guardada localmente en el equipo.
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
            <p className="text-center text-sm text-slate-500">Cargando sucursales...</p>
          ) : null}

          {!loadingBranches && (branches?.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
              No hay sucursales activas disponibles para este kiosco.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}
