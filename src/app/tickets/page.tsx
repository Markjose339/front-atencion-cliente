"use client"

import { useEffect, useMemo, useState } from "react"
import { Maximize2, Minimize2, ShieldCheck } from "lucide-react"

import { TicketKiosk } from "@/components/tickets/ticket-kiosk"
import { Button } from "@/components/ui/button"

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default function TicketsPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener("fullscreenchange", onFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange)
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, 60_000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      return
    }

    await document.exitFullscreen()
  }

  const formattedDate = useMemo(() => formatDateTime(now), [now])

  return (
    <main className="relative isolate h-dvh w-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.2),transparent_32%),radial-gradient(circle_at_90%_0%,rgba(148,163,184,0.24),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_60%,#111827_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 flex h-full flex-col p-4 sm:p-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/75 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-200">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Banco PRO
              </p>
              <h1 className="text-lg font-semibold text-white sm:text-xl">
                Emision de tickets
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-slate-300 sm:inline-flex">
              {formattedDate}
            </span>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </header>

        <section className="min-h-0 flex-1 rounded-[2rem] border border-slate-700/60 bg-slate-900/45 backdrop-blur-sm">
          <TicketKiosk />
        </section>
      </div>
    </main>
  )
}
