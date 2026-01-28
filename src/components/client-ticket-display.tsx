'use client'

import { Card } from '@/components/ui/card'

interface ClientTicketDisplayProps {
  code: string
  window: string
}

export function ClientTicketDisplay({ code, window }: ClientTicketDisplayProps) {
  return (
    <Card className="bg-gradient-to-br from-white to-muted border border-border flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 shadow-lg overflow-hidden relative">
      {/* Línea decorativa superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
      
      {/* Contenido */}
      <div className="space-y-3 text-center">
        {/* Etiqueta */}
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Número de Ticket
          </span>
        </div>

        {/* Código del ticket */}
        <div className="py-2">
          <p className="text-5xl font-bold text-primary tracking-wider">
            {code}
          </p>
        </div>

        {/* Separador */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Ventanilla */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Diríjase a
          </span>
          <div className="relative">
            {/* Círculo de fondo */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-secondary/80 rounded-full blur opacity-25" />
            {/* Contenido */}
            <div className="relative bg-gradient-to-br from-secondary to-secondary/90 rounded-full w-16 h-16 flex items-center justify-center">
              <span className="text-3xl font-bold text-secondary-foreground">
                {window}
              </span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium mt-1">
            Ventanilla
          </span>
        </div>
      </div>
    </Card>
  )
}
