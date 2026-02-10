"use client"

import { useEffect, useState } from "react"
import { TicketKiosk } from "@/components/tickets/ticket-kiosk"
import { ModeToggle } from "@/components/mode-toggle"
import { Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TicketsPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
    else await document.exitFullscreen()
  }

  return (
    <main className="h-dvh w-full bg-muted/40 relative overflow-hidden flex flex-col">
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
        <ModeToggle />
      </div>

      <div className="flex-1 min-h-0">
        <TicketKiosk />
      </div>
    </main>
  )
}

