import { RouteGuard } from "@/components/auth/route-guard";
import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";

export default function DashboardPage() {
  return (
    <RouteGuard>
      <DashboardPageClient />
    </RouteGuard>
  );
}
