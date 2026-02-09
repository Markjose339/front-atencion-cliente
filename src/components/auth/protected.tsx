"use client"

import * as React from "react"
import { useAuth } from "@/contexts/auth-context"

type ProtectedProps = {
  roles?: string[]
  permissions?: string[]
  mode?: "or" | "and"
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function Protected({
  roles = [],
  permissions = [],
  mode = "or",
  fallback = null,
  children,
}: ProtectedProps) {
  const { user, anyRoles, anyPermissions } = useAuth()

  const bypassAll =
    (user?.roles?.length ?? 0) === 0 &&
    (user?.permissions?.length ?? 0) === 0

  if (bypassAll) return <>{children}</>

  if (roles.length === 0 && permissions.length === 0) {
    return <>{children}</>
  }

  const roleOk = roles.length > 0 ? anyRoles(roles) : false
  const permOk = permissions.length > 0 ? anyPermissions(permissions) : false

  const allowed =
    mode === "and"
      ? (roles.length ? roleOk : true) &&
        (permissions.length ? permOk : true)
      : roleOk || permOk

  return allowed ? <>{children}</> : <>{fallback}</>
}
