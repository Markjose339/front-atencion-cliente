"use client"

import dynamic from "next/dynamic"

export const TicketKiosk = dynamic(() => import("./ticket-kiosk.client"), {
  ssr: false,
})
