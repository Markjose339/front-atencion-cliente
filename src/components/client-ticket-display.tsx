"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CustomerServiceTicketType } from "@/types/customer-service"

interface ClientTicketDisplayProps {
  code: string
  window: string
  type: CustomerServiceTicketType
  isRecentlyCalled?: boolean
}

export function ClientTicketDisplay({
  code,
  window,
  type,
  isRecentlyCalled = false,
}: ClientTicketDisplayProps) {
  const windowLabel = window.toLowerCase().includes("ventanilla")
    ? window
    : `Ventanilla ${window}`
  const isPreferential = type === "PREFERENCIAL"

  return (
    <Card
      className={cn(
        "group relative flex h-full items-center justify-center overflow-hidden rounded-2xl border p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.75)] transition-transform duration-200 hover:-translate-y-0.5 dark:shadow-[0_20px_42px_-32px_rgba(0,0,0,0.85)]",
        isPreferential
          ? "border-[#D38E2A]/45 bg-[linear-gradient(145deg,#fff9ef_0%,#ffe9bd_54%,#ffd877_100%)] dark:border-[#EECA46]/55 dark:bg-[linear-gradient(145deg,#2c4868_0%,#214463_52%,#1a3a59_100%)]"
          : "border-slate-200/80 bg-white/95 dark:border-[#55779f]/65 dark:bg-[#163a5f]/86",
        isRecentlyCalled
          ? "border-[#C1121F]/95 bg-[linear-gradient(145deg,#ffccd2_0%,#f04453_42%,#a80515_100%)] shadow-[0_0_34px_rgba(193,18,31,0.62)] dark:border-[#ff8790]/95 dark:bg-[linear-gradient(145deg,#ff7a85_0%,#de2435_48%,#74000d_100%)] motion-safe:animate-pulse motion-reduce:animate-none"
          : "",
      )}
    >
      {isRecentlyCalled ? (
        <>
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.26)_0%,rgba(255,255,255,0.1)_48%,transparent_80%)]" />
          <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-full bg-[#C1121F] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/85" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            Llamando
          </div>
        </>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-10 h-1",
          isRecentlyCalled
            ? "bg-linear-to-r from-[#ffd5db] via-white to-[#ffd5db]"
            : isPreferential
            ? "bg-linear-to-r from-[#D38E2A] via-[#FDCB35] to-[#EECA46]"
            : "bg-linear-to-r from-sky-500 via-cyan-400 to-slate-900",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-8 z-10 h-24 w-24 rounded-full",
          isRecentlyCalled
            ? "bg-white/20 dark:bg-white/12"
            : isPreferential
            ? "bg-[#FDCB35]/45 dark:bg-[#FDCB35]/20"
            : "bg-sky-100/70 dark:bg-[#20539A]/25",
        )}
      />

      <div className="relative z-10 flex min-h-36 w-full flex-col items-center justify-center gap-3 text-center">
        <p
          className={cn(
            "text-6xl font-bold leading-none tracking-[0.08em] sm:text-7xl",
            isRecentlyCalled
              ? "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
              : isPreferential
                ? "text-[#7A4C0D] dark:text-[#fff4d4]"
                : "text-slate-950 dark:text-[#edf5ff]",
          )}
        >
          {code}
        </p>
        <p
          className={cn(
            "text-4xl font-semibold leading-tight sm:text-5xl",
            isRecentlyCalled
              ? "text-[#ffe9ec]"
              : isPreferential
                ? "text-[#9C6114] dark:text-[#FDCB35]"
                : "text-sky-900 dark:text-[#bcd5f5]",
          )}
        >
          {windowLabel}
        </p>
      </div>
    </Card>
  )
}
