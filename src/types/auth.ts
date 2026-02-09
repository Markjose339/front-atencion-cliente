export type User = {
  id: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export type AuthContextType = {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  anyPermissions: (permissions: string[]) => boolean
  hasRole: (role: string) => boolean
  anyRoles: (roles: string[]) => boolean
  hasNoAccessRules: boolean
}
