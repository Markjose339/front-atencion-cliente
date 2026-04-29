import { RouteGuard } from "@/components/auth/route-guard";
import { AuditTable } from "@/components/audit/audit-table";

export default function AuditPage() {
  return (
    <RouteGuard roles={["administrador"]} permissions={["ver auditoria"]}>
      <div className="container mx-auto space-y-6 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold lg:text-3xl">Auditoria</h1>
        </div>

        <section className="rounded-xl border bg-background p-3 shadow-sm sm:p-4">
          <AuditTable />
        </section>
      </div>
    </RouteGuard>
  );
}
