import { RouteGuard } from "@/components/auth/route-guard";

export default function DashboardPage() {
  return (
    <RouteGuard>
      <div>
        dashboard
      </div>
    </RouteGuard>
  )
}
