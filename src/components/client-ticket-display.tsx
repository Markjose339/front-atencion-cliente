"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { CustomerServiceTicketType } from "@/types/customer-service"

interface ClientTicketDisplayProps {
  code: string
  window: string
  type: CustomerServiceTicketType
}

export function ClientTicketDisplay({ code, window, type }: ClientTicketDisplayProps) {
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
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-1",
          isPreferential
            ? "bg-linear-to-r from-[#D38E2A] via-[#FDCB35] to-[#EECA46]"
            : "bg-linear-to-r from-sky-500 via-cyan-400 to-slate-900",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-8 h-24 w-24 rounded-full",
          isPreferential
            ? "bg-[#FDCB35]/45 dark:bg-[#FDCB35]/20"
            : "bg-sky-100/70 dark:bg-[#20539A]/25",
        )}
      />

      <div className="relative flex min-h-36 w-full flex-col items-center justify-center gap-3 text-center">
        <p
          className={cn(
            "text-6xl font-bold leading-none tracking-[0.08em] sm:text-7xl",
            isPreferential ? "text-[#7A4C0D] dark:text-[#fff4d4]" : "text-slate-950 dark:text-[#edf5ff]",
          )}
        >
          {code}
        </p>
        <p
          className={cn(
            "text-4xl font-semibold leading-tight sm:text-5xl",
            isPreferential
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
