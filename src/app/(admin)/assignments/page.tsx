import { AssignmentCreateDialog } from "@/components/assignments/assignment-create-dialog";
import { AssignmentsTable } from "@/components/assignments/assignments-table";
import { Protected } from "@/components/auth/protected";
import { RouteGuard } from "@/components/auth/route-guard";

export default function AssignmentsPage() {
  return (
    <RouteGuard permissions={["ver asignaciones"]}>
      <div className="container mx-auto p-5 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Asignaciones</h1>
          <Protected permissions={["ver asignaciones"]}>
            <AssignmentCreateDialog />
          </Protected>
        </div>
        <section className="rounded-xl border bg-background shadow-sm">
          <div className="p-3 sm:p-4">
            <AssignmentsTable />
          </div>
        </section>
      </div>
    </RouteGuard>
  )
}
