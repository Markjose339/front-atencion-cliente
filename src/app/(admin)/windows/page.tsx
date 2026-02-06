import { WindowCreateDialog } from "@/components/windows/window-create-dialog";
import { WindowsTable } from "@/components/windows/windows-table";

export default function ServiceWindowsPage() {
  return (
    <div className="container mx-auto p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Ventanillas</h1>
        <WindowCreateDialog />
      </div>
      <section className="rounded-xl border bg-background shadow-sm">
        <div className="p-3 sm:p-4">
          <WindowsTable />
        </div>
      </section>
    </div>
  )
}