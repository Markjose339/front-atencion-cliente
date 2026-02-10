"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Package,
  Star,
  Ticket,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChoiceCard } from "@/components/tickets/choice-card"
import { usePublicServicesByBranch } from "@/hooks/use-public"
import { PublicService } from "@/types/public"
import { useTicketsMutation } from "@/hooks/use-tickets"

type TicketType = "REGULAR" | "PREFERENCIAL"
type Step = "service" | "tracking" | "type"

type Props = {
  branchId: string
}

export function TicketCreate({ branchId }: Props) {
  const [step, setStep] = useState<Step>("service")
  const [serviceId, setServiceId] = useState<string>("")
  const [wantsCode, setWantsCode] = useState<boolean | null>(null)
  const [packageCode, setPackageCode] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const { data: services, isLoading: loadingServices } =
    usePublicServicesByBranch(branchId)

  const selectedService: PublicService | undefined = useMemo(() => {
    return (services ?? []).find((s) => s.serviceId === serviceId)
  }, [services, serviceId])

  const isAdmission = selectedService?.abbreviation === "ADM"
  const { create } = useTicketsMutation()

  const reset = () => {
    setStep("service")
    setServiceId("")
    setWantsCode(null)
    setPackageCode("")
    setLoading(false)
  }

  const goToService = () => setStep("service")

  const goToTracking = () => {
    setWantsCode(null)
    setStep("tracking")
  }

  const handleSelectService = (id: string) => {
    setServiceId(id)
    setWantsCode(null)
    setPackageCode("")

    const picked = (services ?? []).find((s) => s.serviceId === id)
    const skipTracking = picked?.abbreviation === "ADM"
    setStep(skipTracking ? "type" : "tracking")
  }

  const handleTrackingChoice = (choice: boolean) => {
    setWantsCode(choice)
    if (!choice) {
      setPackageCode("")
      setStep("type")
    }
  }

  const handleContinueWithCode = () => {
    if (!packageCode.trim()) {
      toast.error("Ingrese el código de rastreo")
      return
    }
    setStep("type")
  }

  const handleCreate = async (type: TicketType) => {
    if (!serviceId) return

    setLoading(true)
    try {
      const ticket = await create.mutateAsync({
        branchId,
        serviceId,
        type,
        packageCode: isAdmission ? null : wantsCode ? packageCode.trim() : null,
      })

      toast.success(`Ticket "${ticket.code}" creado`)
      reset()
    } catch (err) {
      const msg =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Error al crear ticket"

      toast.error(msg)
      reset()
    }
  }

  return (
    <main className="h-full w-full px-4 py-10 overflow-auto">
      <div className="mx-auto flex w-full max-w-300 flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 shadow-sm">
          <Ticket className="h-8 w-8 text-primary" />
        </div>

        <h1 className="mb-2 text-center text-3xl sm:text-4xl font-extrabold">
          Generar Ticket
        </h1>

        <p className="mb-8 text-center text-muted-foreground">
          {step === "service"
            ? "Seleccione su servicio"
            : step === "tracking"
            ? "¿Tiene código de rastreo?"
            : "Seleccione el tipo de atención"}
        </p>

        {step === "service" && (
          <div className="w-full rounded-3xl border bg-card shadow-lg">
            <div className="flex max-h-[78svh] flex-col min-h-0 p-6">
              <div className="text-center pb-4">
                <p className="text-sm text-muted-foreground">
                  {loadingServices ? "Cargando servicios..." : "Elija una opción"}
                </p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pt-2 pb-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(services ?? []).map((s) => (
                    <ChoiceCard
                      key={s.serviceId}
                      title={s.serviceName}
                      description={`Servicio ${s.abbreviation}`}
                      icon={<Ticket className="h-8 w-8" />}
                      onClick={() => handleSelectService(s.serviceId)}
                      disabled={loading || loadingServices}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 text-center text-xs sm:text-sm text-muted-foreground">
                {loadingServices ? "Cargando..." : "Toque una opción para continuar."}
              </div>
            </div>
          </div>
        )}

        {step === "tracking" && (
          <div className="w-full max-w-225 rounded-3xl border bg-card shadow-lg flex flex-col p-8 gap-6">
            {wantsCode !== true ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ChoiceCard
                  title="Sí, tengo código"
                  description="Ingresar código de rastreo"
                  icon={<CheckCircle2 className="h-8 w-8" />}
                  onClick={() => handleTrackingChoice(true)}
                  disabled={loading}
                />
                <ChoiceCard
                  title="No tengo código"
                  description="Continuar sin código"
                  icon={<XCircle className="h-8 w-8" />}
                  onClick={() => handleTrackingChoice(false)}
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <label className="flex items-center gap-2 font-semibold">
                  <Package className="h-5 w-5 text-primary" />
                  Código de rastreo
                </label>

                <Input
                  value={packageCode}
                  onChange={(e) => setPackageCode(e.target.value)}
                  placeholder="Ej: EN000001LP"
                  className="h-12 rounded-xl font-mono"
                  disabled={loading}
                />
              </div>
            )}

            <div className="flex justify-center gap-4 pt-4">
              <Button
                variant="outline"
                className="w-44 h-12 rounded-xl"
                onClick={goToService}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver
              </Button>

              {wantsCode === true && (
                <Button
                  className="w-44 h-12 rounded-xl"
                  onClick={handleContinueWithCode}
                  disabled={loading}
                >
                  Continuar
                </Button>
              )}
            </div>
          </div>
        )}

        {step === "type" && (
          <div className="w-full max-w-225 rounded-3xl border bg-card shadow-lg flex flex-col p-8 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ChoiceCard
                title="Regular"
                description="Atención estándar"
                icon={<Ticket className="h-8 w-8" />}
                onClick={() => handleCreate("REGULAR")}
                disabled={loading}
              />
              <ChoiceCard
                title="Preferencial"
                description="Prioridad de atención"
                icon={<Star className="h-8 w-8" />}
                onClick={() => handleCreate("PREFERENCIAL")}
                disabled={loading}
              />
            </div>

            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                className="w-44 h-12 rounded-xl"
                onClick={isAdmission ? goToService : goToTracking}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver
              </Button>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Generando ticket...
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
