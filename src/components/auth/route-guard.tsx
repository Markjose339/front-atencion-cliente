"use client"

import { useEffect, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { GuardLoading } from "./guard-loading"

type RouteGuardProps = {
  roles?: string[]
  permissions?: string[]
  mode?: "or" | "and"
  redirectTo?: string
  children: React.ReactNode
  loadingFallback?: React.ReactNode
}

export function RouteGuard({
  roles = [],
  permissions = [],
  mode = "or",
  redirectTo = "/unauthorized",
  children,
  loadingFallback = <GuardLoading />, // 👈 loading global por defecto
}: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { loading, isAuthenticated, anyRoles, anyPermissions, user } = useAuth()

  const bypassAll = useMemo(() => {
    return (
      (user?.roles?.length ?? 0) === 0 &&
      (user?.permissions?.length ?? 0) === 0
    )
  }, [user])

  const allowed = useMemo(() => {
    if (loading) return false
    if (!isAuthenticated) return false

    if (roles.length === 0 && permissions.length === 0) return true
    if (bypassAll) return true

    const roleOk = roles.length > 0 ? anyRoles(roles) : false
    const permOk = permissions.length > 0 ? anyPermissions(permissions) : false

    return mode === "and"
      ? (roles.length ? roleOk : true) &&
          (permissions.length ? permOk : true)
      : roleOk || permOk
  }, [
    loading,
    isAuthenticated,
    roles,
    permissions,
    mode,
    anyRoles,
    anyPermissions,
    bypassAll,
  ])

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`)
      return
    }

    if (!allowed) {
      router.replace(redirectTo)
    }
  }, [loading, isAuthenticated, allowed, router, pathname, redirectTo])

  // 🔒 Bloquea render para evitar flash
  if (loading) return <>{loadingFallback}</>
  if (!isAuthenticated) return <>{loadingFallback}</>
  if (!allowed) return <>{loadingFallback}</>

  return <>{children}</>
}
