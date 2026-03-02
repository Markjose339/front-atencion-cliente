"use client"

import { useEffect, useState } from "react"
import { Maximize2, Minimize2 } from "lucide-react"

import { ModeToggle } from "@/components/mode-toggle"
import { TicketKiosk } from "@/components/tickets/ticket-kiosk"
import { Button } from "@/components/ui/button"

export default function TicketsPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener("fullscreenchange", onFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      return
    }

    await document.exitFullscreen()
  }

  return (
    <main className="relative isolate h-dvh w-full overflow-hidden bg-[#f4f8ff] text-[#0C3E63] dark:bg-[#0C3E63] dark:text-[#e9f2ff]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_6%_8%,rgba(32,83,154,0.24),transparent_36%),radial-gradient(circle_at_94%_4%,rgba(253,203,53,0.28),transparent_33%),linear-gradient(175deg,#f7fbff_0%,#e9f1ff_54%,#fff7db_100%)] dark:bg-[radial-gradient(circle_at_6%_8%,rgba(32,83,154,0.55),transparent_38%),radial-gradient(circle_at_94%_4%,rgba(240,224,73,0.28),transparent_35%),linear-gradient(165deg,#0C3E63_0%,#213661_58%,#0C3E63_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 bg-[linear-gradient(rgba(17,69,145,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(17,69,145,0.16)_1px,transparent_1px)] bg-size[42px_42px] dark:opacity-35 dark:bg-[linear-gradient(rgba(240,224,73,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(240,224,73,0.14)_1px,transparent_1px)]" />
      <div className="relative z-10 flex h-full flex-col">
        <section className="min-h-0 flex-1 px-3 pb-3 sm:px-5 sm:pb-5">
          <TicketKiosk />
        </section>
      </div>
    </main>
  )
}
