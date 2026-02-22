"use client"

import { BellRing, Star } from "lucide-react"

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
        "group relative overflow-hidden rounded-2xl border p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.75)] transition-transform duration-200 hover:-translate-y-0.5 dark:shadow-[0_20px_42px_-32px_rgba(0,0,0,0.85)]",
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

      <div className="relative space-y-2">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest",
              isPreferential
                ? "border-[#D38E2A]/45 bg-white/80 text-[#B5771F] dark:border-[#EECA46]/45 dark:bg-[#214766]/80 dark:text-[#FDCB35]"
                : "border-slate-200 bg-slate-50 text-slate-500 dark:border-[#56789f]/60 dark:bg-[#1b446e]/70 dark:text-[#d8e7fb]",
            )}
          >
            {isPreferential ? <Star className="h-3.5 w-3.5" /> : <BellRing className="h-3.5 w-3.5" />}
            {isPreferential ? "Preferencial" : "Ticket"}
          </span>

          <span
            className={cn(
              "text-xs font-medium",
              isPreferential
                ? "text-[#9B6420] dark:text-[#F0E049]"
                : "text-slate-500 dark:text-[#c6d9f2]",
            )}
          >
            En atencion
          </span>
        </div>

        <div className="text-center">
          <p
            className={cn(
              "text-[2.15rem] font-bold tracking-[0.08em]",
              isPreferential ? "text-[#7A4C0D] dark:text-[#fff4d4]" : "text-slate-950 dark:text-[#edf5ff]",
            )}
          >
            {code}
          </p>
          <p
            className={cn(
              "text-xl font-semibold",
              isPreferential
                ? "text-[#9C6114] dark:text-[#FDCB35]"
                : "text-sky-900 dark:text-[#bcd5f5]",
            )}
          >
            {windowLabel}
          </p>
        </div>
      </div>
    </Card>
  )
}
