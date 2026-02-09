"use client"

import { useRouter } from "next/navigation"
import { ShieldAlert, ArrowLeft, Lock, Sparkles } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/15" />
        <div className="absolute top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl dark:bg-orange-500/15" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-slate-200/60 blur-3xl dark:bg-slate-800/30" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <div className="mb-6 flex justify-center">
            <Badge
              variant="secondary"
              className="flex items-center gap-2 px-4 py-1.5 text-sm shadow-sm
                         bg-white/70 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              Acceso restringido
            </Badge>
          </div>

          <Card className="border-slate-200 bg-white/80 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                {/* Icono */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-orange-500/20 blur-xl dark:bg-orange-500/25" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50
                                  dark:border-orange-900/50 dark:bg-orange-950/30">
                    <ShieldAlert className="h-7 w-7 animate-pulse text-orange-600 dark:text-orange-300" />
                  </div>
                </div>

                <div className="flex-1">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl dark:text-slate-100">
                    No tienes autorización
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Tu usuario está autenticado, pero no cuenta con el rol o permiso necesario para acceder a esta sección.
                  </p>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Lock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-sm font-medium">Acción recomendada</span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Si crees que esto es un error, solicita al administrador que te asigne el permiso correspondiente.
                    </p>
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="gap-2 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:bg-slate-900"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver
                    </Button>
                  </div>

                  <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
                    Error 403 • Permisos insuficientes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
