"use client"

import { BellRing, Building2 } from "lucide-react"

import { Card } from "@/components/ui/card"

interface ClientTicketDisplayProps {
  code: string
  window: string
}

export function ClientTicketDisplay({ code, window }: ClientTicketDisplayProps) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.75)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-slate-900" />
      <div className="pointer-events-none absolute -right-10 -top-8 h-24 w-24 rounded-full bg-sky-100/70" />

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            <BellRing className="h-3.5 w-3.5" />
            Ticket
          </span>

          <span className="text-xs font-medium text-slate-500">En atencion</span>
        </div>

        <div className="text-center">
          <p className="text-[2.15rem] font-bold tracking-[0.08em] text-slate-950">{code}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.09em] text-slate-500">
            Numero asignado
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2">
          <Building2 className="h-4 w-4 text-sky-700" />
          <p className="text-sm font-semibold text-sky-900">Ventanilla {window}</p>
        </div>
      </div>
    </Card>
  )
}
