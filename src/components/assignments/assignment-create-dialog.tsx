"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import {
  CreateWindowServiceAssignmentSchema,
  CreateWindowServiceAssignmentSchemaType,
} from "@/lib/schemas/assignment.schema";
import { useWindowServiceAssignmentsMutation } from "@/hooks/use-assignments";
import { useBranchesQuery } from "@/hooks/use-branches";
import { useServicesQuery } from "@/hooks/use-services";
import { useWindowsQuery } from "@/hooks/use-windows";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  PaginatedCommandSelect,
  PaginatedItem,
} from "@/components/ui/paginated-command-select";
import { PaginatedCheckboxList } from "@/components/ui/paginated-checkbox-list";

const ITEMS_PER_PAGE = 10;

export function AssignmentCreateDialog() {
  const [open, setOpen] = useState(false);

  const [branchesPage, setBranchesPage] = useState(1);
  const [branchesSearch, setBranchesSearch] = useState("");
  const [windowsPage, setWindowsPage] = useState(1);
  const [windowsSearch, setWindowsSearch] = useState("");
  const [servicesPage, setServicesPage] = useState(1);
  const [servicesSearch, setServicesSearch] = useState("");

  const { create } = useWindowServiceAssignmentsMutation();

  const { findAllBranches } = useBranchesQuery({
    page: branchesPage,
    limit: ITEMS_PER_PAGE,
    search: branchesSearch,
  });

  const { findAllWindows } = useWindowsQuery({
    page: windowsPage,
    limit: ITEMS_PER_PAGE,
    search: windowsSearch,
  });

  const { findAllServices } = useServicesQuery({
    page: servicesPage,
    limit: ITEMS_PER_PAGE,
    search: servicesSearch,
  });

  const form = useForm<CreateWindowServiceAssignmentSchemaType>({
    resolver: zodResolver(CreateWindowServiceAssignmentSchema),
    defaultValues: {
      branchId: "",
      windowId: "",
      serviceIds: [],
      isActive: true,
    },
  });

  const selectedServiceIds = useWatch({
    control: form.control,
    name: "serviceIds",
  }) ?? [];

  const branchOptions = useMemo<PaginatedItem[]>(() => {
    return (
      findAllBranches.data?.data.map((branch) => ({
        id: branch.id,
        label: branch.name,
      })) ?? []
    );
  }, [findAllBranches.data]);

  const windowOptions = useMemo<PaginatedItem[]>(() => {
    return (
      findAllWindows.data?.data.map((window) => ({
        id: window.id,
        label: window.name,
      })) ?? []
    );
  }, [findAllWindows.data]);

  const serviceOptions = useMemo<PaginatedItem[]>(() => {
    return (
      findAllServices.data?.data.map((service) => ({
        id: service.id,
        label: `${service.name} (${service.code})`,
      })) ?? []
    );
  }, [findAllServices.data]);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);

    if (!value) {
      form.reset();
      setBranchesPage(1);
      setBranchesSearch("");
      setWindowsPage(1);
      setWindowsSearch("");
      setServicesPage(1);
      setServicesSearch("");
    }
  };

  const onSubmit = async (values: CreateWindowServiceAssignmentSchemaType) => {
    toast.promise(create.mutateAsync(values), {
      loading: "Asignando servicios...",
      success: (response) => {
        handleOpenChange(false);
        return `Solicitados: ${response.summary.requested}. Asignados: ${response.summary.assigned}. Ya asignados: ${response.summary.alreadyAssigned}.`;
      },
      error: (error) => (error as { message?: string })?.message ?? "Error al crear",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva asignacion de servicio
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asignar servicio a ventanilla</DialogTitle>
          <DialogDescription>
            Define que servicio estara habilitado en una ventanilla de una sucursal.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sucursal</FormLabel>
                  <FormControl>
                    <PaginatedCommandSelect
                      items={branchOptions}
                      value={field.value}
                      placeholder="Selecciona una sucursal"
                      search={branchesSearch}
                      page={branchesPage}
                      totalPages={findAllBranches.data?.meta.totalPages ?? 1}
                      isLoading={findAllBranches.isLoading}
                      onChange={field.onChange}
                      onSearchChange={(value) => {
                        setBranchesSearch(value);
                        setBranchesPage(1);
                      }}
                      onPageChange={setBranchesPage}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="windowId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ventanilla</FormLabel>
                  <FormControl>
                    <PaginatedCommandSelect
                      items={windowOptions}
                      value={field.value}
                      placeholder="Selecciona una ventanilla"
                      search={windowsSearch}
                      page={windowsPage}
                      totalPages={findAllWindows.data?.meta.totalPages ?? 1}
                      isLoading={findAllWindows.isLoading}
                      onChange={field.onChange}
                      onSearchChange={(value) => {
                        setWindowsSearch(value);
                        setWindowsPage(1);
                      }}
                      onPageChange={setWindowsPage}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicios</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Seleccionados: {selectedServiceIds.length}
                  </p>
                  <FormControl>
                    <PaginatedCheckboxList
                      items={serviceOptions}
                      selectedIds={field.value ?? []}
                      search={servicesSearch}
                      page={servicesPage}
                      totalPages={findAllServices.data?.meta.totalPages ?? 1}
                      isLoading={findAllServices.isLoading}
                      onSearchChange={(value) => {
                        setServicesSearch(value);
                        setServicesPage(1);
                      }}
                      onPageChange={setServicesPage}
                      onToggle={(serviceId, checked) => {
                        const currentServiceIds = field.value ?? [];

                        if (checked) {
                          if (!currentServiceIds.includes(serviceId)) {
                            field.onChange([...currentServiceIds, serviceId]);
                          }
                          return;
                        }

                        field.onChange(
                          currentServiceIds.filter((current) => current !== serviceId),
                        );
                      }}
                      hasError={!!form.formState.errors.serviceIds}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors has-checked:border-primary has-checked:bg-primary/5">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={create.isPending}
                      />

                      <div className="grid gap-1.5 font-normal">
                        <p className="text-sm leading-none font-medium">Asignacion activa</p>
                        <p className="text-muted-foreground text-sm">
                          Si esta desactivada, el servicio no se podra atender en esa ventanilla.
                        </p>
                      </div>
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={create.isPending}>
                  Cancelar
                </Button>
              </DialogClose>

              <Button
                type="submit"
                disabled={create.isPending || selectedServiceIds.length === 0}
              >
                {create.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
