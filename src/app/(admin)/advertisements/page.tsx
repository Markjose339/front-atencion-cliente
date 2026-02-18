import { RouteGuard } from "@/components/auth/route-guard";
import { AdvertisementCreateDialog } from "@/components/advertisements/advertisement-create-dialog";
import { AdvertisementsTable } from "@/components/advertisements/advertisements-table";

export default function AdvertisementsPage() {
  return (
    <RouteGuard>
      <div className="container mx-auto space-y-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold lg:text-3xl">Publicidades</h1>
          <AdvertisementCreateDialog />
        </div>

        <section className="rounded-xl border bg-background p-3 shadow-sm sm:p-4">
          <AdvertisementsTable />
        </section>
      </div>
    </RouteGuard>
  );
}
