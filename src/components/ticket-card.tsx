'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'

interface TicketCardProps {
  id: string
  code: string
  status: 'waiting' | 'attending' | 'completed'
  window: string
}

export function TicketCard({ code, status: initialStatus, window }: TicketCardProps) {
  const [status, setStatus] = useState<'waiting' | 'attending' | 'completed'>(initialStatus)

  const handleAttending = () => {
    setStatus('attending')
    // Reproducir voz anunciando la ventanilla
    speakWindow(window)
  }

  const handleCompleted = () => {
    setStatus('completed')
  }

  const speakWindow = (windowNumber: string) => {
    if (typeof globalThis !== 'undefined' && 'speechSynthesis' in globalThis) {
      const utterance = new SpeechSynthesisUtterance(
        `El cliente ${code} debe dirigirse a la ventanilla ${windowNumber}`
      )
      utterance.lang = 'es-ES'
      utterance.rate = 0.9
      globalThis.speechSynthesis.speak(utterance)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900'
      case 'attending':
        return 'bg-green-100 border-green-300 text-green-900'
      case 'completed':
        return 'bg-blue-100 border-blue-300 text-blue-900'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'waiting':
        return 'Esperando'
      case 'attending':
        return `Ventanilla ${window}`
      case 'completed':
        return 'Completado'
      default:
        return 'Desconocido'
    }
  }

  return (
    <Card
      className={`p-4 border-2 flex flex-col items-center justify-center min-h-40 rounded-lg transition-all ${getStatusColor()}`}
    >
      <div className="text-sm font-semibold mb-2">Ticket #{code}</div>
      <div className="text-3xl font-bold mb-4">{code}</div>
      <div className="text-sm font-medium mb-4">{getStatusLabel()}</div>

      <div className="flex gap-2 w-full">
        {status === 'waiting' && (
          <button
            onClick={handleAttending}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded transition-all"
          >
            Atender
          </button>
        )}
        {status === 'attending' && (
          <button
            onClick={handleCompleted}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2 px-4 rounded transition-all"
          >
            Completar
          </button>
        )}
        {status === 'completed' && (
          <div className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded text-center">
            Finalizado
          </div>
        )}
      </div>
    </Card>
  )
}
