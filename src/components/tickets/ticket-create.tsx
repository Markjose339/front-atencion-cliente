"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Package,
  PrinterCheck,
  PrinterX,
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
import { useQZPrinter } from "@/hooks/use-qz-printer"
import { useTicketsMutation } from "@/hooks/use-tickets"
import { cn } from "@/lib/utils"
import { PublicService } from "@/types/public"

type TicketType = "REGULAR" | "PREFERENCIAL"
type Step = "service" | "tracking" | "type"

type Props = {
  branchId: string
}

const STEP_ORDER: Step[] = ["service", "tracking", "type"]

const STEP_META: Record<Step, { label: string; title: string; subtitle: string }> = {
  service: {
    label: "Paso 1",
    title: "Seleccione su servicio",
    subtitle: "Elija el tramite que desea realizar en esta sucursal.",
  },
  tracking: {
    label: "Paso 2",
    title: "Codigo de rastreo",
    subtitle: "Indique si cuenta con codigo para priorizar su atencion.",
  },
  type: {
    label: "Paso 3",
    title: "Tipo de atencion",
    subtitle: "Confirme el tipo de ticket para generar su turno.",
  },
}

const isAdmissionService = (service: PublicService | undefined): boolean => {
  return service?.abbreviation.toUpperCase() === "ADM"
}

type StepIndicatorProps = {
  step: Step
  trackingSkipped: boolean
}

function StepIndicator({ step, trackingSkipped }: StepIndicatorProps) {
  const currentIndex = STEP_ORDER.indexOf(step)

  return (
    <ol className="grid grid-cols-1 gap-2 rounded-3xl border-2 border-[#20539A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#eef5ff_100%)] p-2 dark:border-[#4f6f97]/80 dark:bg-[linear-gradient(145deg,#1b3f69_0%,#12385f_100%)] sm:grid-cols-3">
      {STEP_ORDER.map((item, index) => {
        const isActive = item === step
        const isPast = index < currentIndex
        const isTrackingAndSkipped = item === "tracking" && trackingSkipped

        return (
          <li
            key={item}
            className={cn(
              "rounded-2xl border px-3 py-2 text-center transition",
              isActive && "border-[#20539A] bg-[linear-gradient(145deg,#edf4ff_0%,#d6e6ff_100%)] text-[#0C3E63] dark:border-[#6d95cc] dark:bg-[linear-gradient(145deg,#234f83_0%,#20539A_100%)] dark:text-[#f1f7ff]",
              isPast && "border-[#EECA46] bg-[linear-gradient(145deg,#fff9e9_0%,#F0E049_100%)] text-[#0C3E63] dark:border-[#FDCB35] dark:bg-[linear-gradient(145deg,#35577a_0%,#2b4a6d_100%)] dark:text-[#FDCB35]",
              !isActive && !isPast && "border-[#20539A]/25 bg-white/80 text-[#20539A] dark:border-[#56769f]/70 dark:bg-[#1f4068]/80 dark:text-[#d8e7ff]",
              isTrackingAndSkipped && "border-[#20539A]/20 bg-[#eef4ff] text-[#20539A]/70 dark:border-[#4f6e96]/60 dark:bg-[#1a3a60] dark:text-[#bcd0ea]",
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em]">
              {STEP_META[item].label}
            </p>
            <p className="text-sm font-semibold">
              {item === "tracking" && trackingSkipped ? "Omitido" : STEP_META[item].title}
            </p>
          </li>
        )
      })}
    </ol>
  )
}

export function TicketCreate({ branchId }: Props) {
  const [step, setStep] = useState<Step>("service")
  const [serviceId, setServiceId] = useState("")
  const [wantsCode, setWantsCode] = useState<boolean | null>(null)
  const [packageCode, setPackageCode] = useState("")
  const [loading, setLoading] = useState(false)

  const { data: services, isLoading: loadingServices } = usePublicServicesByBranch(branchId)
  const { create } = useTicketsMutation()
  const {
    printTicket,
    isConnected: isPrinterConnected,
    isChecking: isPrinterChecking,
  } = useQZPrinter()

  const availableServices = useMemo(() => {
    return [...(services ?? [])].sort((a, b) =>
      `${a.serviceName} ${a.abbreviation}`.localeCompare(
        `${b.serviceName} ${b.abbreviation}`,
        "es",
      ),
    )
  }, [services])

  const selectedService: PublicService | undefined = useMemo(() => {
    return availableServices.find((service) => service.serviceId === serviceId)
  }, [availableServices, serviceId])

  const admission = isAdmissionService(selectedService)
  const trackingSkipped = admission

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

    const picked = availableServices.find((service) => service.serviceId === id)
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

      const printed = await printTicket(ticket)

      if (printed) {
        toast.success(`Ticket ${ticket.code} generado e impreso`)
      } else {
        toast.success(`Ticket ${ticket.code} generado`)
        toast.message("No se pudo imprimir automaticamente. Verifique QZ Tray y la impresora.")
      }

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

  const currentMeta = STEP_META[step]

  return (
    <main className="h-full w-full overflow-auto px-3 py-4 sm:px-6 sm:py-7">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <section className="rounded-[2rem] border-2 border-[#20539A]/30 bg-[linear-gradient(145deg,#ffffff_0%,#f1f7ff_46%,#fff7de_100%)] p-5 shadow-[0_26px_44px_-34px_rgba(12,62,99,0.72)] dark:border-[#4e6d96]/80 dark:bg-[linear-gradient(145deg,#17385f_0%,#123a60_56%,#1d355a_100%)] dark:text-[#e9f2ff] dark:shadow-[0_30px_48px_-34px_rgba(0,0,0,0.82)] md:p-8">
          <header className="mb-6 flex flex-col gap-5 border-b border-[#20539A]/20 pb-6 dark:border-[#5c7ea7]/45">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#114591] text-[#F0E049] shadow-[0_12px_22px_-14px_rgba(12,62,99,0.9)] dark:bg-[#FDCB35] dark:text-[#0C3E63]">
                  <Ticket className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#114591] dark:text-[#FDCB35]">
                    {currentMeta.label}
                  </p>
                  <h1 className="text-2xl font-bold text-[#0C3E63] dark:text-[#edf5ff] sm:text-3xl">
                    {currentMeta.title}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold",
                  isPrinterConnected
                    ? "border-[#20539A]/45 bg-[#edf4ff] text-[#114591] dark:border-[#6a92c7]/60 dark:bg-[#1f446f] dark:text-[#e5f0ff]"
                    : "border-[#D38E2A]/55 bg-[#fff4df] text-[#D38E2A] dark:border-[#EECA46]/55 dark:bg-[#2a3f58] dark:text-[#FDCB35]",
                )}
              >
                {isPrinterChecking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isPrinterConnected ? (
                  <PrinterCheck className="h-3.5 w-3.5" />
                ) : (
                  <PrinterX className="h-3.5 w-3.5" />
                )}
                {isPrinterChecking
                  ? "Verificando impresora..."
                  : isPrinterConnected
                    ? "Impresora lista"
                    : "Impresora no detectada"}
              </span>
            </div>

            <p className="text-sm text-[#20539A] dark:text-[#cfdef6] sm:text-base">{currentMeta.subtitle}</p>

            <StepIndicator step={step} trackingSkipped={trackingSkipped} />

            {selectedService ? (
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="rounded-full border border-[#20539A]/35 bg-white px-3 py-1 font-semibold text-[#114591] dark:border-[#6488b8]/60 dark:bg-[#17416b]/80 dark:text-[#e6f1ff]">
                  Servicio: {selectedService.serviceName}
                </span>
                <span className="rounded-full border border-[#D38E2A]/45 bg-[#fff5e0] px-3 py-1 font-semibold text-[#D38E2A] dark:border-[#EECA46]/55 dark:bg-[#2b415a] dark:text-[#FDCB35]">
                  Codigo: {selectedService.abbreviation}
                </span>
              </div>
            ) : null}
          </header>

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
                    onChange={(event) => setPackageCode(event.target.value.toUpperCase())}
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
                    Generando e imprimiendo ticket...
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
