"use client"

import { Announcements } from "@/components/announcements"
import { ClientTicketDisplay } from "@/components/client-ticket-display"

const attendingTickets = [
  { id: "1", code: "R0007", window: "1" },
  { id: "2", code: "P0003", window: "4" },
  { id: "3", code: "R0012", window: "2" },
]

export default function Home() {
  return (
    <main className="h-dvh w-full overflow-hidden bg-slate-100">
      <section className="h-3/5 w-full p-4 sm:p-6">
        <div className="h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-60px_rgba(15,23,42,0.85)]">
          <Announcements />
        </div>
      </section>

      <section className="h-2/5 w-full px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white px-4 py-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.85)] sm:px-6">
          <header className="mb-4 border-b border-slate-200 pb-3">
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Clientes siendo atendidos
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Verifique su ticket y dirijase a la ventanilla indicada.
            </p>
          </header>

          <div className="min-h-0 flex-1 overflow-auto">
            {attendingTickets.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {attendingTickets.map((ticket) => (
                  <ClientTicketDisplay
                    key={ticket.id}
                    code={ticket.code}
                    window={ticket.window}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No hay clientes siendo atendidos en este momento.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
