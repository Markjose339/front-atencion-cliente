import { Protected } from "@/components/auth/protected";
import { RouteGuard } from "@/components/auth/route-guard";
import { BranchCreateDialog } from "@/components/branches/branch-create-dialog";
import { BranchesTable } from "@/components/branches/branches-table";

export default function BranchesPage() {
  return (
    <RouteGuard permissions={["ver sucursales"]}>
      <div className="container mx-auto p-5 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Sucursales</h1>
          <Protected permissions={["ver sucursales"]}>
            <BranchCreateDialog />
          </Protected>
        </div>
        <section className="rounded-xl border bg-background shadow-sm">
          <div className="p-3 sm:p-4">
            <BranchesTable />
          </div>
        </section>
      </div>
    </RouteGuard>
  )
}
