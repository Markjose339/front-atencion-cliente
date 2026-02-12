"use client"

import { api } from "@/lib/api";
import { PublicBranch, PublicService } from "@/types/public";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

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

const normalizeBranchId = (branchId: string | null | undefined): string => {
  if (typeof branchId !== "string") return ""
  return branchId.trim()
}

export function getKioskBranchId(): string | null {
  if (typeof window === "undefined") return null
  const v = window.localStorage.getItem(KIOSK_BRANCH_KEY)
  const normalized = normalizeBranchId(v)
  return normalized.length > 0 ? normalized : null
}

export function setKioskBranchId(branchId: string): void {
  if (typeof window === "undefined") return
  const normalized = normalizeBranchId(branchId)
  if (!normalized) {
    window.localStorage.removeItem(KIOSK_BRANCH_KEY)
    return
  }
  window.localStorage.setItem(KIOSK_BRANCH_KEY, normalized)
}

export function clearKioskBranchId(): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(KIOSK_BRANCH_KEY)
}

type UseKioskBranchReturn = {
  branchId: string
  selectedBranch: PublicBranch | null
  selectBranch: (branchId: string) => void
  resetBranch: () => void
}

export function useKioskBranch(
  branches: PublicBranch[] | undefined,
): UseKioskBranchReturn {
  const [branchId, setBranchId] = useState<string>(() => getKioskBranchId() ?? "")

  const selectedBranch = useMemo(
    () => (branches ?? []).find((branch) => branch.id === branchId) ?? null,
    [branches, branchId],
  )

  const selectBranch = (value: string) => {
    const normalized = normalizeBranchId(value)
    setBranchId(normalized)
    setKioskBranchId(normalized)
  }

  const resetBranch = () => {
    setBranchId("")
    clearKioskBranchId()
  }

  return {
    branchId,
    selectedBranch,
    selectBranch,
    resetBranch,
  }
}
