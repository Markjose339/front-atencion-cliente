import { ServiceCreateDialog } from "@/components/services/service-create-dialog";
import { ServicesTable } from "@/components/services/services-table";

export default function ServicesPage() {
  return (
    <div className="container mx-auto p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Servicios</h1>
        <ServiceCreateDialog />
      </div>
      <section className="rounded-xl border bg-background shadow-sm">
        <div className="p-3 sm:p-4">
          <ServicesTable/>
        </div>
      </section>
    </div>
  )
}