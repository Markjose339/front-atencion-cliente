'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface Announcement {
  id: string
  type: 'image' | 'video'
  src: string
  alt: string
  url?: string
}

export function Announcements() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/announcements')
        if (!response.ok) {
          throw new Error('Error al cargar los anuncios')
        }
        const data = await response.json()
        setAnnouncements(data.announcements || [])
      } catch (err) {
        console.error('[v0] Error fetching announcements:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (announcements.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [announcements.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }

  if (loading) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
          <p className="text-primary-foreground text-sm">Cargando anuncios...</p>
        </div>
      </div>
    )
  }

  if (error || announcements.length === 0) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary-foreground text-lg font-semibold">
            {error || 'No hay anuncios disponibles'}
          </p>
        </div>
      </div>
    )
  }

  const currentAnnouncement = announcements[currentIndex]

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl shadow-lg">
      {/* Contenedor principal */}
      <div className="relative w-full h-full">
        {/* Anuncios */}
        {announcements.map((announcement, index) => (
          <div
            key={announcement.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {announcement.type === 'image' ? (
              <Image
                src={announcement.src || "/placeholder.svg"}
                alt={announcement.alt}
                fill
                className="object-cover"
                priority={index === currentIndex}
              />
            ) : (
              <video
                src={announcement.src}
                autoPlay={index === currentIndex}
                muted
                loop
                className="w-full h-full object-cover"
              />
            )}
            {/* Overlay oscuro para mejor legibilidad */}
            <div className="absolute inset-0 bg-black/20" />
          </div>
        ))}
      </div>

      {/* Indicadores de página (puntos) */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {announcements.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'bg-white w-8 h-2'
                : 'bg-white/50 w-2 h-2 hover:bg-white/75'
            }`}
            aria-label={`Ir al anuncio ${index + 1}`}
            aria-current={index === currentIndex}
          />
        ))}
      </div>

      {/* Botones de navegación */}
      {announcements.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2.5 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Anuncio anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2.5 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Siguiente anuncio"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Información del anuncio (opcional) */}
      {currentAnnouncement.url && (
        <div className="absolute top-4 right-4 z-20">
          <a
            href={currentAnnouncement.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
          >
            Más información
          </a>
        </div>
      )}
    </div>
  )
}
