import { AssignmentCreateDialog } from "@/components/assignments/assignment-create-dialog";
import { AssignmentsTable } from "@/components/assignments/assignments-table";

export default function AssignmentsPage() {
  return (
    <div className="container mx-auto p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Asignaciones</h1>
        <AssignmentCreateDialog />
      </div>
      <section className="rounded-xl border bg-background shadow-sm">
        <div className="p-3 sm:p-4">
          <AssignmentsTable />
        </div>
      </section>
    </div>
  )
}
