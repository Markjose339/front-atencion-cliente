"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Loader2,
  Package,
  Ticket,
  ArrowLeft,
  Star,
  ArrowRight,
} from "lucide-react"

import { useTicketsMutation } from "@/hooks/use-tickets"
import { useQZPrinter } from "@/hooks/use-qz-printer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FullscreenButton } from "../ui/fullscreen-button"
import { ChoiceCard } from "./choice-card"

type TicketType = "REGULAR" | "PREFERENCIAL"
type Step = "package" | "type"

export function TicketCreate() {
  const [step, setStep] = useState<Step>("package")
  const [packageCode, setPackageCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { create } = useTicketsMutation()
  const { isConnected, isChecking, printTicket } = useQZPrinter()
  useEffect(() => {
    if (isChecking) {
      toast.loading("Verificando impresora...", {
        id: "printer-status",
      })
      return
    }

    if (isConnected) {
      toast.success("Impresora conectada y lista", {
        id: "printer-status",
      })
    } else {
      toast.error("Impresora no conectada", {
        id: "printer-status",
        description: "Verifica que QZ Tray esté ejecutándose",
      })
    }
  }, [isChecking, isConnected])

  const resetForm = () => {
    setStep("package")
    setPackageCode("")
    setError("")
    setLoading(false)
  }

  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!packageCode.trim()) {
      setError("El código de paquete es requerido")
      return
    }

    setError("")
    setStep("type")
  }

  const handleTypeSelect = async (type: TicketType) => {
    if (!isConnected) {
      toast.error("La impresora no está conectada", {
        description: "No se puede imprimir el ticket",
      })
      return
    }

    setLoading(true)

    try {
      const ticket = await create.mutateAsync({
        packageCode: packageCode.trim(),
        type,
      })

      const printed = await printTicket(ticket)

      if (printed) {
        toast.success(`Ticket "${ticket.code}" creado e impreso`)
      } else {
        toast.warning(`Ticket "${ticket.code}" creado`, {
          description: "No se pudo imprimir",
        })
      }

      resetForm()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al crear el ticket"
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-linear-to-b from-background to-muted/30 px-4 sm:px-6 md:px-10 py-8 sm:py-10 md:py-14">
      <FullscreenButton />

      <div className="mb-6 sm:mb-8 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10 shadow-sm">
        <Ticket className="h-8 w-8 sm:h-11 sm:w-11 text-primary" />
      </div>

      <h1 className="mb-2 text-center font-extrabold tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
        Generar Ticket
      </h1>

      <p className="mb-8 sm:mb-10 md:mb-14 max-w-xl sm:max-w-2xl text-center text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground">
        {step === "package"
          ? "Ingrese el código del paquete"
          : "Seleccione el tipo de atención"}
      </p>

      {step === "package" ? (
        <form
          onSubmit={handlePackageSubmit}
          className="w-full max-w-full sm:max-w-xl md:max-w-2xl space-y-6 sm:space-y-8 md:space-y-10 rounded-2xl sm:rounded-3xl border bg-card p-6 sm:p-8 md:p-12 shadow-lg"
        >
          <div className="space-y-3 sm:space-y-4">
            <label className="flex justify-center items-center gap-3 font-semibold text-base sm:text-lg">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Código de paquete
            </label>

            <Input
              value={packageCode}
              onChange={(e) => {
                setPackageCode(e.target.value)
                setError("")
              }}
              placeholder="PAQ-2024-001"
              className="
                w-full text-center font-mono tracking-widest
                h-14 sm:h-16 md:h-20
                text-xl sm:text-2xl md:text-3xl lg:text-4xl
                rounded-xl sm:rounded-2xl
                border-2
                focus-visible:ring-2 focus-visible:ring-primary
              "
              autoFocus
              disabled={loading}
            />

            {error && (
              <p className="text-md sm:text-base text-destructive text-center">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-14 sm:h-16 md:h-20 rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl transition hover:scale-[1.02]"
            disabled={loading}
          >
            Continuar
            <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </form>
      ) : (
        <div className="w-full max-w-full lg:max-w-7xl space-y-8 sm:space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
            <ChoiceCard
              title="Regular"
              description="Atención normal por orden de llegada"
              icon={<Ticket className="h-8 w-8 sm:h-10 sm:w-10" />}
              onClick={() => handleTypeSelect("REGULAR")}
              disabled={loading || !isConnected}
            />

            <ChoiceCard
              title="Preferencial"
              description="Atención prioritaria para casos especiales"
              icon={<Star className="h-8 w-8 sm:h-10 sm:w-10" />}
              onClick={() => handleTypeSelect("PREFERENCIAL")}
              disabled={loading || !isConnected}
            />
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 sm:gap-4 text-base sm:text-lg text-muted-foreground">
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
              Generando e imprimiendo ticket...
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 sm:pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("package")}
              disabled={loading}
              className="h-12 sm:h-14 rounded-xl text-base sm:text-lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver
            </Button>

            <span className="text-sm sm:text-base text-muted-foreground">
              Seleccione una opción para continuar
            </span>
          </div>
        </div>
      )}
    </main>
  )
}
