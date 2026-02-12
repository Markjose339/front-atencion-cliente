import { AssignmentCreateDialog } from "@/components/assignments/assignment-create-dialog";
import { AssignmentsTable } from "@/components/assignments/assignments-table";
import { OperatorAssignmentCreateDialog } from "@/components/assignments/operator-assignment-create-dialog";
import { OperatorAssignmentsTable } from "@/components/assignments/operator-assignments-table";
import { Protected } from "@/components/auth/protected";
import { RouteGuard } from "@/components/auth/route-guard";

export default function AssignmentsPage() {
  return (
    <RouteGuard permissions={["ver asignaciones"]}>
      <div className="container mx-auto p-5 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl lg:text-3xl">Gestion de asignaciones</h1>
        </div>

        <section className="rounded-xl border bg-background shadow-sm space-y-4 p-3 sm:p-4">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">Servicios por ventanilla</h2>
              <p className="text-sm text-muted-foreground">
                Configura que servicios puede atender cada ventanilla.
              </p>
            </div>
            <Protected permissions={["crear asignaciones"]}>
              <AssignmentCreateDialog />
            </Protected>
          </div>

          <AssignmentsTable />
        </section>

        <section className="rounded-xl border bg-background shadow-sm space-y-4 p-3 sm:p-4">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">Operadores por ventanilla</h2>
              <p className="text-sm text-muted-foreground">
                Asigna operadores a una ventanilla especifica en cada sucursal.
              </p>
            </div>
            <Protected permissions={["crear asignaciones"]}>
              <OperatorAssignmentCreateDialog />
            </Protected>
          </div>

          <OperatorAssignmentsTable />
        </section>
      </div>
    </RouteGuard>
  );
}
