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
        <div className="flex justify-end p-3 sm:p-5">
          <div className="flex items-center gap-2 rounded-2xl border border-[#20539A]/45 bg-white/85 px-2 py-1 shadow-[0_20px_32px_-28px_rgba(12,62,99,0.7)] backdrop-blur dark:border-[#5b7da6]/70 dark:bg-[#1b446e]/85 dark:shadow-[0_22px_34px_-26px_rgba(0,0,0,0.8)]">

            <ModeToggle buttonClassName="h-10 w-10 border-[#20539A]/45 bg-white text-[#114591] hover:border-[#114591] hover:bg-[#e9f1ff] dark:border-[#5e81ab]/70 dark:bg-[#123d64] dark:text-[#deebff] dark:hover:border-[#86a9d9] dark:hover:bg-[#114591]" />

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 border-[#20539A]/45 bg-white text-[#114591] hover:border-[#114591] hover:bg-[#e9f1ff] dark:border-[#5e81ab]/70 dark:bg-[#123d64] dark:text-[#deebff] dark:hover:border-[#86a9d9] dark:hover:bg-[#114591]"
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
        </div>

        <section className="min-h-0 flex-1 px-3 pb-3 sm:px-5 sm:pb-5">
          <TicketKiosk />
        </section>
      </div>
    </main>
  )
}
