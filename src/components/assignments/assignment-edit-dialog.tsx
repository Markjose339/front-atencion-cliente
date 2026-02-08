"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Assignment } from "@/types/assignment";
import { AssignmentSchema, AssignmentSchemaType } from "@/lib/schemas/assignment.schema";

import { useAssignmentsMutation } from "@/hooks/use-assignments";
import { useBranchesQuery } from "@/hooks/use-branches";
import { useWindowsQuery } from "@/hooks/use-windows";
import { useServicesQuery } from "@/hooks/use-services";
import { useUsersQuery } from "@/hooks/use-users";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  PaginatedCommandSelect,
  PaginatedItem,
} from "@/components/ui/paginated-command-select";

interface AssignmentEditDialogProps {
  assignment: Assignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ITEMS_PER_PAGE = 10;

const ensureSelected = (
  items: PaginatedItem[],
  selectedId: string | undefined,
  selectedLabel: string | undefined,
): PaginatedItem[] => {
  if (!selectedId || !selectedLabel) return items;
  const exists = items.some((item) => item.id === selectedId);
  if (exists) return items;
  return [{ id: selectedId, label: selectedLabel }, ...items];
};

export default function AssignmentEditDialog({
  assignment,
  open,
  onOpenChange,
}: AssignmentEditDialogProps) {
  const { update } = useAssignmentsMutation();

  const [branchesPage, setBranchesPage] = useState(1);
  const [branchesSearch, setBranchesSearch] = useState("");

  const [windowsPage, setWindowsPage] = useState(1);
  const [windowsSearch, setWindowsSearch] = useState("");

  const [servicesPage, setServicesPage] = useState(1);
  const [servicesSearch, setServicesSearch] = useState("");

  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");

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

  const { findAllUsers } = useUsersQuery({
    page: usersPage,
    limit: ITEMS_PER_PAGE,
    search: usersSearch,
  });

  const form = useForm<AssignmentSchemaType>({
    resolver: zodResolver(AssignmentSchema),
    defaultValues: {
      branchId: assignment.branch?.id ?? "",
      windowId: assignment.window?.id ?? "",
      serviceId: assignment.service?.id ?? "",
      userId: assignment.user?.id ?? "",
    },
  });

  useEffect(() => {
    if (open && assignment) {
      form.reset({
        branchId: assignment.branch?.id ?? "",
        windowId: assignment.window?.id ?? "",
        serviceId: assignment.service?.id ?? "",
        userId: assignment.user?.id ?? "",
      });
    }
  }, [open, assignment, form]);

  const branchOptions = useMemo<PaginatedItem[]>(() => {
    const items =
      findAllBranches.data?.data.map((branch) => ({
        id: branch.id,
        label: branch.name,
      })) ?? [];
    return ensureSelected(items, assignment.branch?.id, assignment.branch?.name);
  }, [findAllBranches.data, assignment.branch]);

  const windowOptions = useMemo<PaginatedItem[]>(() => {
    const items =
      findAllWindows.data?.data.map((window) => ({
        id: window.id,
        label: window.name,
      })) ?? [];
    return ensureSelected(items, assignment.window?.id, assignment.window?.name);
  }, [findAllWindows.data, assignment.window]);

  const serviceOptions = useMemo<PaginatedItem[]>(() => {
    const items =
      findAllServices.data?.data.map((service) => ({
        id: service.id,
        label: `${service.name} (${service.code})`,
      })) ?? [];
    const selectedLabel = assignment.service
      ? `${assignment.service.name} (${assignment.service.code})`
      : undefined;
    return ensureSelected(items, assignment.service?.id, selectedLabel);
  }, [findAllServices.data, assignment.service]);

  const userOptions = useMemo<PaginatedItem[]>(() => {
    const items =
      findAllUsers.data?.data.map((user) => ({
        id: user.id,
        label: `${user.name} - ${user.email}`,
      })) ?? [];
    const selectedLabel = assignment.user
      ? `${assignment.user.name} - ${assignment.user.email}`
      : undefined;
    return ensureSelected(items, assignment.user?.id, selectedLabel);
  }, [findAllUsers.data, assignment.user]);

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      setBranchesPage(1);
      setBranchesSearch("");
      setWindowsPage(1);
      setWindowsSearch("");
      setServicesPage(1);
      setServicesSearch("");
      setUsersPage(1);
      setUsersSearch("");
    }
  };

  async function onSubmit(values: AssignmentSchemaType) {
    toast.promise(update.mutateAsync({ id: assignment.id, values }), {
      loading: "Actualizando asignaciÃ³n...",
      success: () => {
        handleOpenChange(false);
        return "AsignaciÃ³n actualizada exitosamente";
      },
      error: (error) => error.message || "Error desconocido",
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Asignación</DialogTitle>
          <DialogDescription>
            Actualiza la sucursal, ventanilla, servicio o usuario asociados.
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
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicio</FormLabel>
                  <FormControl>
                    <PaginatedCommandSelect
                      items={serviceOptions}
                      value={field.value}
                      placeholder="Selecciona un servicio"
                      search={servicesSearch}
                      page={servicesPage}
                      totalPages={findAllServices.data?.meta.totalPages ?? 1}
                      isLoading={findAllServices.isLoading}
                      onChange={field.onChange}
                      onSearchChange={(value) => {
                        setServicesSearch(value);
                        setServicesPage(1);
                      }}
                      onPageChange={setServicesPage}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <PaginatedCommandSelect
                      items={userOptions}
                      value={field.value}
                      placeholder="Selecciona un usuario"
                      search={usersSearch}
                      page={usersPage}
                      totalPages={findAllUsers.data?.meta.totalPages ?? 1}
                      isLoading={findAllUsers.isLoading}
                      onChange={field.onChange}
                      onSearchChange={(value) => {
                        setUsersSearch(value);
                        setUsersPage(1);
                      }}
                      onPageChange={setUsersPage}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleOpenChange(false)}
                disabled={update.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Guardando..." : "Actualizar AsignaciÃ³n"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
