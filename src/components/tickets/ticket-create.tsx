"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  Building2,
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
import { cn } from "@/lib/utils"
import { PublicService } from "@/types/public"

type TicketType = "REGULAR" | "PREFERENCIAL"
type Step = "service" | "tracking" | "type"

type Props = {
  branchId: string
  branchName?: string
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
    <ol className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2">
      {STEP_ORDER.map((item, index) => {
        const isActive = item === step
        const isPast = index < currentIndex
        const isTrackingAndSkipped = item === "tracking" && trackingSkipped

        return (
          <li
            key={item}
            className={cn(
              "rounded-xl border px-3 py-2 text-center transition",
              isActive && "border-sky-300 bg-sky-50 text-sky-900",
              isPast && "border-emerald-200 bg-emerald-50 text-emerald-900",
              !isActive && !isPast && "border-slate-200 bg-white text-slate-500",
              isTrackingAndSkipped && "border-slate-200 bg-slate-100 text-slate-400",
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

export function TicketCreate({ branchId, branchName }: Props) {
  const [step, setStep] = useState<Step>("service")
  const [serviceId, setServiceId] = useState("")
  const [wantsCode, setWantsCode] = useState<boolean | null>(null)
  const [packageCode, setPackageCode] = useState("")
  const [loading, setLoading] = useState(false)

  const { data: services, isLoading: loadingServices } =
    usePublicServicesByBranch(branchId)
  const { create } = useTicketsMutation()

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

      toast.success(`Ticket ${ticket.code} generado correctamente`)
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
    <main className="h-full w-full overflow-auto px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <section className="rounded-[2rem] border border-slate-200/70 bg-white/88 p-5 shadow-[0_24px_90px_-45px_rgba(15,23,42,0.55)] backdrop-blur md:p-8">
          <header className="mb-6 flex flex-col gap-5 border-b border-slate-200/80 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                  <Ticket className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sky-700">
                    {currentMeta.label}
                  </p>
                  <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
                    {currentMeta.title}
                  </h1>
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex">
                <Building2 className="h-4 w-4 text-slate-500" />
                {branchName ?? "Sucursal activa"}
              </div>
            </div>

            <p className="text-sm text-slate-600 sm:text-base">{currentMeta.subtitle}</p>

            <StepIndicator step={step} trackingSkipped={trackingSkipped} />

            {selectedService ? (
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  Servicio: {selectedService.serviceName}
                </span>
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-medium text-sky-700">
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
                      className="h-30 animate-pulse rounded-3xl border border-slate-200 bg-slate-100"
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
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
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
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Package className="h-4 w-4" />
                    Codigo de rastreo
                  </label>

                  <Input
                    value={packageCode}
                    onChange={(event) => setPackageCode(event.target.value.toUpperCase())}
                    placeholder="Ej: EN000001LP"
                    className="h-12 rounded-xl border-slate-300 bg-white font-mono text-base"
                    disabled={loading}
                    maxLength={25}
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Solo letras, numeros y guiones.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl border-slate-300 bg-white"
                  onClick={goBack}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>

                {wantsCode === true ? (
                  <Button
                    type="button"
                    className="h-11 rounded-xl bg-slate-900 px-6 text-white hover:bg-slate-800"
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
                  className="h-11 rounded-xl border-slate-300 bg-white"
                  onClick={goBack}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>

                {loading ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
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
