"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { Building2, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  clearKioskBranchId,
  getKioskBranchId,
  setKioskBranchId,
  usePublicBranches,
} from "@/hooks/use-public"

import { TicketCreate } from "@/components/tickets/ticket-create"
import { ChoiceCard } from "@/components/tickets/choice-card"

const IDLE_RESET_MS = 2 * 60 * 1000

export default function TicketKioskClient() {
  const { data: branches, isLoading: loadingBranches } = usePublicBranches()
  const [branchId, setBranchId] = useState<string>(() => getKioskBranchId() ?? "")

  const view = useMemo<"setup" | "tickets">(() => {
    return branchId ? "tickets" : "setup"
  }, [branchId])

  const handleBranchChange = (value: string) => {
    setBranchId(value)
    if (!value) return
    setKioskBranchId(value)
    toast.success("Sucursal configurada")
  }

  const reset = () => {
    clearKioskBranchId()
    toast.success("Sucursal reiniciada")
    setBranchId("")
  }

  const idleTimer = useRef<number | null>(null)
  useEffect(() => {
    const kick = () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current)
      idleTimer.current = window.setTimeout(() => {
        if (getKioskBranchId()) {
          clearKioskBranchId()
          setBranchId("")
          toast.message("Sesión reiniciada por inactividad")
        }
      }, IDLE_RESET_MS)
    }

    kick()
    const events = ["click", "touchstart", "mousemove", "keydown", "scroll"]
    events.forEach((e) => window.addEventListener(e, kick, { passive: true }))

    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current)
      events.forEach((e) => window.removeEventListener(e, kick))
    }
  }, [])

  if (view === "tickets") {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="absolute left-4 top-18 flex gap-2">
          <Button variant="outline" onClick={reset} className="rounded-xl">
            <Settings2 className="mr-2 h-4 w-4" />
            Cambiar sucursal
          </Button>
        </div>
        <TicketCreate branchId={branchId} />
      </div>
    )
  }

  return (
    <main className="h-full w-full overflow-y-auto flex items-center justify-center">
      <div className="w-full max-w-5xl rounded-3xl border bg-card p-6 sm:p-8 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Configurar Sucursal</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Esta configuración se hace una sola vez por PC/kiosco.
          </p>
        </div>

        <div className="max-h-[55vh] overflow-y-auto pt-2 pb-4 pr-2">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(branches ?? []).map((b) => (
              <ChoiceCard
                key={b.id}
                title={b.name}
                description={b.departmentName}
                icon={<Building2 className="h-8 w-8" />}
                onClick={() => handleBranchChange(b.id)}
                disabled={loadingBranches}
              />
            ))}
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-muted-foreground">
          {loadingBranches ? "Cargando sucursales..." : "La sucursal queda guardada en este kiosco."}
        </p>
      </div>
    </main>
  )
}
