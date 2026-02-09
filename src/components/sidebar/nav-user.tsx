"use client"

import * as React from "react"
import { ChevronsUpDown, LogOut, User as UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type AppUser = {
  name: string
  email: string
  roles: string[]
}

function getInitials(name?: string) {
  const safe = (name ?? "").trim()
  if (!safe) return "U"
  const parts = safe.split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "")
  return (initials.join("") || "U").slice(0, 2)
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = React.useCallback(async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push("/login")
    } finally {
      setIsLoggingOut(false)
    }
  }, [logout, router])

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="grid flex-1 gap-1 text-left">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" onClick={() => router.push("/login")}>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Iniciar sesión</span>
              <span className="truncate text-xs text-muted-foreground">
                No autenticado
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const u = user as AppUser
  const roles = Array.isArray(u.roles) ? u.roles : []
  const primaryRoles = roles.slice(0, 2)
  const extraCount = Math.max(0, roles.length - primaryRoles.length)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg text-primary">
                  {getInitials(u.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{u.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {u.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-3 font-normal">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {getInitials(u.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{u.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {u.email}
                  </div>
                  {roles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {primaryRoles.map((role) => (
                        <Badge
                          key={role}
                          variant="secondary"
                          className="h-5 px-2 text-[11px]"
                        >
                          {role}
                        </Badge>
                      ))}
                      {extraCount > 0 && (
                        <Badge
                          variant="outline"
                          className="h-5 px-2 text-[11px] text-muted-foreground"
                          title={roles.slice(2).join(", ")}
                        >
                          +{extraCount}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="group flex items-center gap-2 rounded-md px-3 py-2 text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 text-destructive hover:bg-destructive/10 focus:bg-destructive/10" />
              <span>
                {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
