import { DepartmentCreateDialog } from "@/components/departments/department-create-dialog";
import { DepartmentsTable } from "@/components/departments/departments-table";

export default function PermissionsPage() {
  return (
    <div className="container mx-auto p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Departamentos</h1>
        <DepartmentCreateDialog/>
      </div>
      <section className="rounded-xl border bg-background shadow-sm">
        <div className="p-3 sm:p-4">
          <DepartmentsTable/>
        </div>
      </section>
    </div>
  )
}