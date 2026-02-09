import { Protected } from "@/components/auth/protected";
import { RouteGuard } from "@/components/auth/route-guard";
import { WindowCreateDialog } from "@/components/windows/window-create-dialog";
import { WindowsTable } from "@/components/windows/windows-table";

export default function ServiceWindowsPage() {
  return (
    <RouteGuard permissions={["ver ventanillas"]}>
      <div className="container mx-auto p-5 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Ventanillas</h1>
          <Protected permissions={["ver ventanillas"]}>
            <WindowCreateDialog />
          </Protected>
        </div>
        <section className="rounded-xl border bg-background shadow-sm">
          <div className="p-3 sm:p-4">
            <WindowsTable />
          </div>
        </section>
      </div>
    </RouteGuard>
  )
}
