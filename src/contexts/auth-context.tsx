"use client"

import { api, isAuthenticated } from "@/lib/api"
import { LoginType } from "@/lib/schemas/login.schema"
import { AuthContextType, User } from "@/types/auth"
import { useRouter } from "next/navigation"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used dentro de AuthProvider")
  return context
}

const fetchUser = async (): Promise<User | null> => {
  if (!isAuthenticated()) return null
  const data = await api.get<{ user: User }>("/auth/me")
  return data.user
}

const loginUser = async (credentials: LoginType): Promise<User> => {
  const data = await api.post<{ user: User }>("/auth/login", credentials)
  return data.user
}

const logoutUser = async (): Promise<void> => {
  await api.post<void>("/auth/logout")
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    data: user = null,
    isLoading: loading,
  } = useQuery<User | null>({
    queryKey: ["auth", "user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["auth", "user"], userData)
      router.push("/dashboard")
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null)
      queryClient.clear()
      router.push("/login")
    },
  })

  const login = useCallback(
    async (credentials: LoginType): Promise<void> => {
      await loginMutation.mutateAsync(credentials)
    },
    [loginMutation],
  )

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation.mutateAsync()
  }, [logoutMutation])

  const hasPermission = useCallback(
    (permission: string): boolean =>
      (user?.permissions ?? []).includes(permission),
    [user],
  )

  const anyPermissions = useCallback(
    (permissions: string[]): boolean =>
      permissions.some((p) => (user?.permissions ?? []).includes(p)),
    [user],
  )

  const hasRole = useCallback(
    (role: string): boolean => (user?.roles ?? []).includes(role),
    [user],
  )

  const anyRoles = useCallback(
    (roles: string[]): boolean =>
      roles.some((r) => (user?.roles ?? []).includes(r)),
    [user],
  )

  const hasNoAccessRules =
    !!user &&
    (user.roles?.length ?? 0) === 0 &&
    (user.permissions?.length ?? 0) === 0

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      hasPermission,
      anyPermissions,
      hasRole,
      anyRoles,
      hasNoAccessRules,
    }),
    [
      user,
      loading,
      login,
      logout,
      hasPermission,
      anyPermissions,
      hasRole,
      anyRoles,
      hasNoAccessRules,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
