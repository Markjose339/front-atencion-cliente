import { api } from "@/lib/api";
import { PublicBranch, PublicDefaultWindow, PublicService } from "@/types/public";
import { useQuery } from "@tanstack/react-query";

export function usePublicBranches() {
  return useQuery({
    queryKey: ["public", "branches"],
    queryFn: () => api.get<PublicBranch[]>("/public/branches"),
    staleTime: 60_000,
  })
}

export function usePublicServicesByBranch(branchId: string | null) {
  return useQuery({
    queryKey: ["public", "branches", branchId, "services"],
    enabled: typeof branchId === "string" && branchId.length > 0,
    queryFn: () => api.get<PublicService[]>(`/public/branches/${branchId}/services`),
    staleTime: 60_000,
  })
}

const KIOSK_BRANCH_KEY = "kiosk_branch_id"

export function getKioskBranchId(): string | null {
  if (typeof window === "undefined") return null
  const v = window.localStorage.getItem(KIOSK_BRANCH_KEY)
  return v && v.length > 0 ? v : null
}

export function setKioskBranchId(branchId: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(KIOSK_BRANCH_KEY, branchId)
}

export function clearKioskBranchId(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KIOSK_BRANCH_KEY)
}