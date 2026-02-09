"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ShieldCheck } from "lucide-react"

export function GuardLoading() {
  return (
    <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950">
      {/* backdrop blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/15" />
        <div className="absolute top-24 -right-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl dark:bg-orange-500/15" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-slate-200/60 blur-3xl dark:bg-slate-800/30" />
      </div>

      <div className="relative w-full max-w-xl px-4">
        <div className="flex justify-center">
          <Badge
            variant="secondary"
            className="flex items-center gap-2 px-4 py-1.5 text-sm shadow-sm
                       bg-white/70 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            Verificando acceso
          </Badge>
        </div>

        <Card className="mt-3 border-slate-200 bg-white/80 shadow-xl backdrop-blur
                         dark:border-slate-800 dark:bg-slate-900/60">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/15 blur-xl dark:bg-blue-500/20" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50
                                dark:border-blue-900/50 dark:bg-blue-950/40">
                  <ShieldCheck className="h-7 w-7 animate-pulse text-blue-700 dark:text-blue-300" />
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl dark:text-slate-100">
                  Verificando permisos…
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Un momento por favor. Estamos validando tu sesión y el acceso a esta sección.
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900
                                  dark:border-slate-800 dark:border-t-slate-100" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Esto puede tardar unos segundos
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
