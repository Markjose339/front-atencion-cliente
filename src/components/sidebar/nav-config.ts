import {
  Building,
  Clock3,
  Frame,
  Home,
  LifeBuoy,
  Map,
  Megaphone,
  MessageSquare,
  Send,
  Shield,
  Ticket,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react"

export type AccessRule =
  | {
    roles?: string[]
    permissions?: string[]
  }
  | undefined

export type SubItem = {
  title: string
  url: string
  icon?: LucideIcon
  access?: AccessRule
}

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  items?: SubItem[]
  access?: AccessRule
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const sidebarData: {
  main: NavGroup[]
  secondary: { title: string; url: string; icon: LucideIcon }[]
} = {
  main: [
    {
      label: "Administración",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: Home,
          access: {
            roles: ["administrador"],
          }
        },
        {
          title: "Usuarios",
          url: "/users",
          icon: Users,
          access: {
            permissions: ["ver usuarios"],
          },
        },
        {
          title: "Roles",
          url: "/roles",
          icon: UserCog,
          access: {
            roles: ["administrador"],
          },
        },
        {
          title: "Permisos",
          url: "/permissions",
          icon: Shield,
          access: {
            roles: ["administrador"],
          },
        },
        {
          title: "Sucursales",
          url: "/branches",
          icon: Building,
          access: {
            permissions: ["ver sucursales"],
          },
        },
        {
          title: "Ventanillas",
          url: "/windows",
          icon: Ticket,
          access: {
            permissions: ["ver ventanillas"],
          },
        },
        {
          title: "Servicios",
          url: "/services",
          icon: Frame,
          access: {
            permissions: ["ver servicios"],
          },
        },
        {
          title: "Asignaciones",
          url: "/assignments",
          icon: Map,
          access: {
            permissions: ["ver asignaciones"],
          },
        },
        {
          title: "Publicidades",
          url: "/advertisements",
          icon: Megaphone,
          access: {
            permissions: ["ver publicidades"]
          }
        },
        {
          title: "Atención al Cliente",
          url: "/customer-service",
          icon: MessageSquare,
          items: [
            {
              title: "Operación",
              url: "/customer-service",
              icon: MessageSquare,
              access: {
                permissions: ["ver atencion al cliente"],
              },
            },
            {
              title: "Tiempos de Atención",
              url: "/customer-service/timelines",
              icon: Clock3,
              access: {
                roles: ["administrador"],
              },
            },
          ],
          access: {
            permissions: ["ver atencion al cliente"],
          },
        },
      ],
    },
  ],
  secondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}
