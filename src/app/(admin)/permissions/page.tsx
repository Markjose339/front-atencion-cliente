import { Protected } from "@/components/auth/protected";
import { RouteGuard } from "@/components/auth/route-guard";
import { PermissionCreateDialog } from "@/components/permissions/permission-create-dialog";
import { PermissionsTable } from "@/components/permissions/permissions-table";

export default function PermissionsPage() {
  return (
    <RouteGuard roles={["administrador"]}>
      <div className="container mx-auto p-5 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Permisos</h1>
          <Protected roles={["administrador"]}>
            <PermissionCreateDialog />
          </Protected>
        </div>
        <section className="rounded-xl border bg-background shadow-sm">
          <div className="p-3 sm:p-4">
            <PermissionsTable />
          </div>
        </section>
      </div>
    </RouteGuard>
  )
}
