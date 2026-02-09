import { Protected } from "@/components/auth/protected";
import { RouteGuard } from "@/components/auth/route-guard";
import { UserCreateDialog } from "@/components/users/user-create-dialog";
import { UsersTable } from "@/components/users/users-table";

export default function UsersPage() {
  return (
    <RouteGuard permissions={["ver usuarios"]}>
      <div className="container mx-auto p-5 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Usuarios</h1>
          <Protected permissions={["ver usuarios"]}>
            <UserCreateDialog />
          </Protected>
        </div>
        <section className="rounded-xl border bg-background shadow-sm">
          <div className="p-3 sm:p-4">
            <UsersTable />
          </div>
        </section>
      </div>
    </RouteGuard>
  )
}
