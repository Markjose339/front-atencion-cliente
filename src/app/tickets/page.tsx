"use client"

import { useEffect, useMemo, useState } from "react"
import { Maximize2, Minimize2, ShieldCheck } from "lucide-react"

import { ModeToggle } from "@/components/mode-toggle"
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
    <main className="relative isolate h-dvh w-full overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(14,165,233,0.15),transparent_36%),radial-gradient(circle_at_90%_0%,rgba(100,116,139,0.22),transparent_30%)] dark:bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.22),transparent_36%),radial-gradient(circle_at_90%_0%,rgba(148,163,184,0.25),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_60%,#111827_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-35 [background-image:linear-gradient(rgba(148,163,184,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative z-10 flex h-full flex-col p-4 sm:p-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/85 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                Emision de tickets
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground sm:inline-flex">
              {formattedDate}
            </span>

            <ModeToggle />

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-border bg-card text-foreground hover:bg-accent"
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

        <section className="min-h-0 flex-1 rounded-[2rem] border border-border/70 bg-card/35 backdrop-blur-sm dark:bg-slate-900/45">
          <TicketKiosk />
        </section>
      </div>
    </main>
  )
}
