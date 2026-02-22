import { RouteGuard } from "@/components/auth/route-guard";
import { CustomerServiceTimelinesView } from "@/components/customer-service/customer-service-timelines-view";

export default function CustomerServiceTimelinesPage() {
  return (
    <RouteGuard roles={["administrador"]}>
      <div className="container mx-auto space-y-6 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold lg:text-3xl">Tiempos de Atención</h1>
        </div>

        <section className="rounded-xl border bg-background shadow-sm">
          <div className="p-3 sm:p-4">
            <CustomerServiceTimelinesView />
          </div>
        </section>
      </div>
    </RouteGuard>
  );
}
