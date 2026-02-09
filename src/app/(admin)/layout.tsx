"use client"

import { useSyncExternalStore } from "react"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

function useIsClient() {
  return useSyncExternalStore(
    () => () => {}, // subscribe no-op
    () => true,     // client snapshot
    () => false     // server snapshot
  )
}

function AdminLayoutFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar skeleton */}
        <aside className="hidden w-[280px] shrink-0 border-r bg-background md:block">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-5/6 rounded-md" />
            </div>

            <div className="mt-10 space-y-3">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-4/5 rounded-md" />
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-9 w-24 rounded-md" />
          </header>

          <main className="flex flex-1 overflow-y-auto bg-muted/10 p-4">
            <div className="mx-auto w-full max-w-6xl space-y-4">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mt-4 h-24 w-full" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mt-4 h-24 w-full" />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4 md:p-6">
                  <Skeleton className="h-5 w-44" />
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient()


  if (!isClient) return <AdminLayoutFallback />

  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset className="min-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>

        <main className="flex flex-1 overflow-y-auto bg-muted/10 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
