import { RoleCreateDialog } from "@/components/roles/role-create-dialog";
import { RolesTable } from "@/components/roles/roles-table";

export default function RolesPage() {
  return (
    <div className="container mx-auto p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Roles</h1>
        <RoleCreateDialog />
      </div>
      <section className="rounded-xl border bg-background shadow-sm">
        <div className="p-3 sm:p-4">
          <RolesTable />
        </div>
      </section>
    </div>
  )
}