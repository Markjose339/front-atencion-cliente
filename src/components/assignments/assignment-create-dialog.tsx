"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

import { useAssignmentsMutation } from "@/hooks/use-assignments";
import { useBranchesQuery } from "@/hooks/use-branches";
import { useWindowsQuery } from "@/hooks/use-windows";
import { useServicesQuery } from "@/hooks/use-services";
import { useUsersQuery } from "@/hooks/use-users";

import { AssignmentSchema, AssignmentSchemaType } from "@/lib/schemas/assignment.schema";

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

const ITEMS_PER_PAGE = 10;

export function AssignmentCreateDialog() {
  const [open, setOpen] = useState(false);

  const [branchesPage, setBranchesPage] = useState(1);
  const [branchesSearch, setBranchesSearch] = useState("");

  const [windowsPage, setWindowsPage] = useState(1);
  const [windowsSearch, setWindowsSearch] = useState("");

  const [servicesPage, setServicesPage] = useState(1);
  const [servicesSearch, setServicesSearch] = useState("");

  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");

  const { create } = useAssignmentsMutation();

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
      branchId: "",
      windowId: "",
      serviceId: "",
      userId: "",
    },
  });

  async function onSubmit(values: AssignmentSchemaType) {
    toast.promise(create.mutateAsync(values), {
      loading: "Creando asignaciÃ³n...",
      success: () => {
        handleOpenChange(false);
        return "AsignaciÃ³n creada exitosamente";
      },
      error: (error: Error) => error.message,
    });
  }

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
        label: service.name,
      })) ?? []
    );
  }, [findAllServices.data]);

  const userOptions = useMemo<PaginatedItem[]>(() => {
    return (
      findAllUsers.data?.data.map((user) => ({
        id: user.id,
        label: user.name,
      })) ?? []
    );
  }, [findAllUsers.data]);

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
      setUsersPage(1);
      setUsersSearch("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Asignación
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Asignación</DialogTitle>
          <DialogDescription>
            Selecciona la sucursal, ventanilla, servicio y usuario a asignar.
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
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={create.isPending}
                >
                  Cancelar
                </Button>
              </DialogClose>

              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Guardando..." : "Guardar Asignación"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
