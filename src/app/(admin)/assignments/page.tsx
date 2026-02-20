import { AssignmentBranchConfig } from "@/components/assignments/assignment-branch-config";
import { RouteGuard } from "@/components/auth/route-guard";

export default function AssignmentsPage() {
  return (
    <RouteGuard permissions={["ver asignaciones"]}>
      <div className="container mx-auto p-5 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-2xl lg:text-3xl">Gestion de asignaciones</h1>
        </div>

        <AssignmentBranchConfig />
      </div>
    </RouteGuard>
  );
}
