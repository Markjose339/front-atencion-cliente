import { ServiceWindowCreateDialog } from "@/components/service-windows/service-window-create-dialog";
import { ServiceWindowsTable } from "@/components/service-windows/service-windows-table";

export default function ServiceWindowsPage() {
  return (
    <div className="container mx-auto p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Ventanillas</h1>
        <ServiceWindowCreateDialog />
      </div>
      <section className="rounded-xl border bg-background shadow-sm">
        <div className="p-3 sm:p-4">
          <ServiceWindowsTable />
        </div>
      </section>
    </div>
  )
}