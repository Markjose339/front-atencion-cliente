'use client'

import { useState, useEffect } from 'react'
import { Announcements } from '@/components/announcements'
import { ClientTicketDisplay } from '@/components/client-ticket-display'

export default function Home() {
  // Simulación de tickets siendo atendidos (datos que vendrían del admin)
  const [attendingTickets, setAttendingTickets] = useState([
    { id: '1', code: '001', window: '1' },
    { id: '2', code: '002', window: '3' },
    { id: '3', code: '005', window: '2' },
  ])

  // Simular actualizaciones en tiempo real (como si fuera WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      // Los datos vendrian del backend en una aplicacion real
      // Por ahora simulamos cambios aleatorios
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <main className="w-full h-screen flex flex-col bg-background overflow-hidden">
      {/* Sección superior: Anuncios (60% del espacio) */}
      <section className="w-full h-3/5 flex-shrink-0 p-4 bg-background">
        <div className="w-full h-full">
          <Announcements />
        </div>
      </section>

      {/* Sección inferior: Tickets siendo atendidos (40% del espacio) */}
      <section className="w-full flex-1 overflow-auto bg-gradient-to-b from-background to-muted/30">
        <div className="w-full h-full px-4 py-6 flex flex-col">
          {/* Encabezado profesional */}
          <div className="mb-6 border-b border-border pb-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-1">
                Clientes siendo atendidos
              </h2>
              <p className="text-muted-foreground">
                Verifique su número de ticket y diríjase a la ventanilla asignada
              </p>
            </div>
          </div>

          {/* Grid de tickets siendo atendidos */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {attendingTickets.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {attendingTickets.map((ticket) => (
                    <ClientTicketDisplay
                      key={ticket.id}
                      code={ticket.code}
                      window={ticket.window}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground text-lg">
                      No hay clientes siendo atendidos en este momento
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
