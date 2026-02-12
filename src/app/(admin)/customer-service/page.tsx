import { RouteGuard } from "@/components/auth/route-guard";
import { CustomerServiceWorkspace } from "@/components/customer-service/customer-service-workspace";

export default function CustomerServicePage() {
  return (
    <RouteGuard permissions={["ver atencion al cliente"]}>
      <div className="container mx-auto space-y-6 p-5">
        <section className="rounded-xl border bg-background p-3 shadow-sm sm:p-4">
          <CustomerServiceWorkspace />
        </section>
      </div>
    </RouteGuard>
  );
}
