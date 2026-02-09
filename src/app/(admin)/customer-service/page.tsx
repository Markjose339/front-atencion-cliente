import { RouteGuard } from "@/components/auth/route-guard";
import { CustomerServiceTable } from "@/components/customer-service/customer-service-table";

export default function CustomerServicePage() {
  return (
    <RouteGuard permissions={["ver atencion al cliente"]}>
      <div className="container mx-auto p-5 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl lg:text-3xl">Atención al Cliente</h1>
        </div>
        <section className="rounded-xl border bg-background shadow-sm">
          <div className="p-3 sm:p-4">
            <CustomerServiceTable />
          </div>
        </section>
      </div>
    </RouteGuard>
  )
}
