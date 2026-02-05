import { BranchCreateDialog } from "@/components/branches/branch-create-dialog";
import { BranchesTable } from "@/components/branches/branches-table";

export default function BranchesPage() {
  return (
    <div className="container mx-auto p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-2xl lg:text-3xl">Gestión de Sucursales</h1>
        <BranchCreateDialog/>
      </div>
      <section className="rounded-xl border bg-background shadow-sm">
        <div className="p-3 sm:p-4">
          <BranchesTable/>
        </div>
      </section>
    </div>
  )
}