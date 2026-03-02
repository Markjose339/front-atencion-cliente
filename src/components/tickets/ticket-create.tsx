"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Package,
  ShieldCheck,
  Star,
  Ticket,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { ChoiceCard } from "@/components/tickets/choice-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePublicServicesByBranch } from "@/hooks/use-public"
import { useTicketsMutation } from "@/hooks/use-tickets"
import { PublicService } from "@/types/public"

type TicketType = "REGULAR" | "PREFERENCIAL"
type Step = "service" | "tracking" | "type"

type Props = {
  branchId: string
}

const isAdmissionService = (service?: PublicService): boolean =>
  service?.abbreviation?.toUpperCase() === "ADM"

export function TicketCreate({ branchId }: Props) {
  const [step, setStep] = useState<Step>("service")
  const [serviceId, setServiceId] = useState("")
  const [wantsCode, setWantsCode] = useState<boolean | null>(null)
  const [packageCode, setPackageCode] = useState("")
  const [loading, setLoading] = useState(false)

  const { data: services, isLoading: loadingServices } = usePublicServicesByBranch(branchId)
  const { create } = useTicketsMutation()

  const availableServices = useMemo(() => {
    return [...(services ?? [])].sort((a, b) =>
      `${a.serviceName} ${a.abbreviation}`.localeCompare(`${b.serviceName} ${b.abbreviation}`, "es"),
    )
  }, [services])

  const selectedService = useMemo(
    () => availableServices.find((s) => s.serviceId === serviceId),
    [availableServices, serviceId],
  )

  const admission = isAdmissionService(selectedService)

  const reset = () => {
    setStep("service")
    setServiceId("")
    setWantsCode(null)
    setPackageCode("")
    setLoading(false)
  }

  const handleSelectService = (id: string) => {
    setServiceId(id)
    setWantsCode(null)
    setPackageCode("")

    const picked = availableServices.find((s) => s.serviceId === id)
    setStep(isAdmissionService(picked) ? "type" : "tracking")
  }

  const handleTrackingChoice = (hasCode: boolean) => {
    setWantsCode(hasCode)
    if (!hasCode) {
      setPackageCode("")
      setStep("type")
    }
  }

  const handleContinueWithCode = () => {
    if (!packageCode.trim()) {
      toast.error("Ingrese el codigo de rastreo")
      return
    }
    setStep("type")
  }

  const handleCreate = async (type: TicketType) => {
    if (!serviceId || loading) return

    setLoading(true)
    try {
      const ticket = await create.mutateAsync({
        branchId,
        serviceId,
        type,
        packageCode: admission ? null : wantsCode ? packageCode : null,
      })

      toast.success(`Ticket ${ticket.code} generado`)
      reset()
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "No se pudo generar el ticket"

      toast.error(message)
      reset()
    }
  }

  const goBack = () => {
    if (step === "type") {
      setStep(admission ? "service" : "tracking")
      return
    }

    if (step === "tracking") {
      setStep("service")
      setWantsCode(null)
      setPackageCode("")
    }
  }

  return (
    <main className="h-full w-full overflow-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <section className="p-5 md:p-8">
          {step === "service" ? (
            <div className="space-y-4">
              {loadingServices ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-32 animate-pulse rounded-3xl border border-[#20539A]/25 bg-[#edf3ff] dark:border-[#54759e]/65 dark:bg-[#1e4068]"
                    />
                  ))}
                </div>
              ) : availableServices.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {availableServices.map((service) => {
                    const tone = service.abbreviation.toUpperCase() === "ADM" ? "primary" : "neutral"
                    return (
                      <ChoiceCard
                        key={service.serviceId}
                        title={service.serviceName}
                        description={`Atencion para ${service.serviceCode}`}
                        badge={service.abbreviation}
                        icon={<ShieldCheck className="h-7 w-7" />}
                        tone={tone}
                        onClick={() => handleSelectService(service.serviceId)}
                        disabled={loading}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#20539A]/35 bg-white/80 p-8 text-center text-sm text-[#20539A] dark:border-[#54769f]/65 dark:bg-[#1e4068]/65 dark:text-[#d2e1f8]">
                  No hay servicios habilitados para esta sucursal.
                </div>
              )}
            </div>
          ) : null}

          {step === "tracking" ? (
            <div className="space-y-5">
              {wantsCode !== true ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <ChoiceCard
                    title="Si, tengo codigo"
                    description="Ingresar codigo de rastreo"
                    badge="Con codigo"
                    icon={<CheckCircle2 className="h-7 w-7" />}
                    tone="success"
                    onClick={() => handleTrackingChoice(true)}
                    disabled={loading}
                  />
                  <ChoiceCard
                    title="No tengo codigo"
                    description="Continuar y generar ticket sin codigo"
                    badge="Sin codigo"
                    icon={<XCircle className="h-7 w-7" />}
                    tone="attention"
                    onClick={() => handleTrackingChoice(false)}
                    disabled={loading}
                  />
                </div>
              ) : (
                <div className="rounded-3xl border-2 border-[#20539A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#edf5ff_100%)] p-5 dark:border-[#54779f]/70 dark:bg-[linear-gradient(145deg,#22466f_0%,#183e65_100%)] sm:p-6">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#114591] dark:text-[#deebff]">
                    <Package className="h-4 w-4" />
                    Codigo de rastreo
                  </label>

                  <Input
                    value={packageCode}
                    onChange={(e) => setPackageCode(e.target.value.toUpperCase())}
                    placeholder="Ej: EN000001LP"
                    className="h-12 rounded-xl border-[#20539A]/35 bg-white font-mono text-base text-[#0C3E63] placeholder:text-[#20539A]/70 dark:border-[#5a7da6]/70 dark:bg-[#153a61] dark:text-[#edf5ff] dark:placeholder:text-[#adc3e2]"
                    disabled={loading}
                    maxLength={25}
                  />

                  <p className="mt-2 text-xs text-[#20539A] dark:text-[#c7d9f3]">
                    Solo letras, numeros y guiones.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-[#20539A]/45 bg-white px-5 text-[#114591] hover:border-[#114591] hover:bg-[#e8f0ff] dark:border-[#5b7da6]/70 dark:bg-[#1f446e] dark:text-[#e8f1ff] dark:hover:border-[#86a8d8] dark:hover:bg-[#1a3d62]"
                  onClick={goBack}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>

                {wantsCode === true ? (
                  <Button
                    type="button"
                    className="h-11 rounded-xl bg-[#114591] px-6 text-white hover:bg-[#0C3E63] dark:bg-[#FDCB35] dark:text-[#0C3E63] dark:hover:bg-[#F0E049]"
                    onClick={handleContinueWithCode}
                    disabled={loading}
                  >
                    Continuar
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === "type" ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ChoiceCard
                  title="Ticket Regular"
                  description="Atencion estandar por orden de llegada"
                  badge="Regular"
                  icon={<Ticket className="h-7 w-7" />}
                  tone="primary"
                  onClick={() => handleCreate("REGULAR")}
                  disabled={loading}
                />
                <ChoiceCard
                  title="Ticket Preferencial"
                  description="Prioridad para adultos mayores o casos especiales"
                  badge="Preferencial"
                  icon={<Star className="h-7 w-7" />}
                  tone="attention"
                  onClick={() => handleCreate("PREFERENCIAL")}
                  disabled={loading}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-[#20539A]/45 bg-white px-5 text-[#114591] hover:border-[#114591] hover:bg-[#e8f0ff] dark:border-[#5b7da6]/70 dark:bg-[#1f446e] dark:text-[#e8f1ff] dark:hover:border-[#86a8d8] dark:hover:bg-[#1a3d62]"
                  onClick={goBack}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>

                {loading ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#20539A]/35 bg-white px-4 py-2 text-sm font-medium text-[#20539A] dark:border-[#5c7ea7]/65 dark:bg-[#1e446f] dark:text-[#ddeaff]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando ticket...
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}