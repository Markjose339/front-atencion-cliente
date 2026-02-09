"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"
import type { NavGroup, NavItem, SubItem, AccessRule } from "./nav-config"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

function matchRoute(pathname: string, url: string) {
  if (url === "/") return pathname === "/"
  return pathname === url || pathname.startsWith(url + "/")
}

function canAccess(
  access: AccessRule,
  opts: {
    bypassAll: boolean
    anyRoles: (roles: string[]) => boolean
    anyPermissions: (permissions: string[]) => boolean
  },
) {
  if (opts.bypassAll) return true
  if (!access) return true

  const roles = access.roles ?? []
  const perms = access.permissions ?? []

  if (roles.length === 0 && perms.length === 0) return true

  const roleOk = roles.length ? opts.anyRoles(roles) : false
  const permOk = perms.length ? opts.anyPermissions(perms) : false

  return roleOk || permOk
}

function filterGroup(
  group: NavGroup,
  accessOpts: Parameters<typeof canAccess>[1],
): NavGroup {
  const items: NavItem[] = group.items
    .filter((it) => canAccess(it.access, accessOpts))
    .map((it) => {
      const subItems = it.items
        ?.filter((s) => canAccess(s.access, accessOpts))
        .filter(Boolean)

      // si era parent con subitems y ya no quedó nada => ocultar parent
      if (it.items?.length && (!subItems || subItems.length === 0)) {
        return null as unknown as NavItem
      }

      return { ...it, items: subItems }
    })
    .filter(Boolean)

  return { ...group, items }
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname()
  const { user, anyRoles, anyPermissions } = useAuth()

  const bypassAll =
    (user?.roles?.length ?? 0) === 0 && (user?.permissions?.length ?? 0) === 0

  const accessOpts = React.useMemo(
    () => ({ bypassAll, anyRoles, anyPermissions }),
    [bypassAll, anyRoles, anyPermissions],
  )

  const filteredGroups = React.useMemo(() => {
    return (
      groups
        // ✅ 1) no renderizar grupos vacíos desde config
        .filter((g) => g.items.length > 0)
        // ✅ 2) filtrar por access
        .map((g) => filterGroup(g, accessOpts))
        // ✅ 3) no renderizar grupos que quedaron vacíos por permisos
        .filter((g) => g.items.length > 0)
    )
  }, [groups, accessOpts])

  return (
    <>
      {filteredGroups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel className="text-accent-foreground">
            {group.label}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const hasSub = Boolean(item.items?.length)
                const itemActive = matchRoute(pathname, item.url)
                const anySubActive = Boolean(
                  item.items?.some((s) => matchRoute(pathname, s.url)),
                )
                const defaultOpen = itemActive || anySubActive

                if (!hasSub) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={itemActive}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }

                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={defaultOpen}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title} isActive={defaultOpen}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items!.map((sub) => {
                            const subActive = matchRoute(pathname, sub.url)
                            return (
                              <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton asChild isActive={subActive}>
                                  <Link href={sub.url} className="flex items-center gap-2">
                                    {sub.icon ? (
                                      <sub.icon className="h-3.5 w-3.5" />
                                    ) : (
                                      <div className="h-4 w-4" />
                                    )}
                                    <span>{sub.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
