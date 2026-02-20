"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import {
  CreateOperatorAssignmentSchema,
  CreateOperatorAssignmentSchemaType,
} from "@/lib/schemas/assignment.schema";
import {
  useBranchWindowsQuery,
  useOperatorAssignmentsMutation,
} from "@/hooks/use-assignments";
import { useBranchesQuery } from "@/hooks/use-branches";
import { useUsersQuery } from "@/hooks/use-users";

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

const ITEMS_PER_PAGE = 10;

const getErrorText = (error: unknown): string => {
  if (!error || typeof error !== "object") {
    return "Error desconocido";
  }

  const current = error as Record<string, unknown>;

  if (typeof current.message === "string") {
    return current.message;
  }

  if (current.message && typeof current.message === "object") {
    const nested = current.message as Record<string, unknown>;

    if (typeof nested.message === "string") {
      return nested.message;
    }

    if (typeof nested.error === "string") {
      return nested.error;
    }
  }

  return "Error desconocido";
};

export function OperatorAssignmentCreateDialog() {
  const [open, setOpen] = useState(false);

  const [branchesPage, setBranchesPage] = useState(1);
  const [branchesSearch, setBranchesSearch] = useState("");
  const [windowsPage, setWindowsPage] = useState(1);
  const [windowsSearch, setWindowsSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");

  const { create } = useOperatorAssignmentsMutation();

  const { findAllBranches } = useBranchesQuery({
    page: branchesPage,
    limit: ITEMS_PER_PAGE,
    search: branchesSearch,
  });

  const { findAllUsers } = useUsersQuery({
    page: usersPage,
    limit: ITEMS_PER_PAGE,
    search: usersSearch,
  });

  const form = useForm<CreateOperatorAssignmentSchemaType>({
    resolver: zodResolver(CreateOperatorAssignmentSchema),
    defaultValues: {
      branchId: "",
      windowId: "",
      userId: "",
      isActive: true,
    },
  });

  const selectedBranchId =
    useWatch({
      control: form.control,
      name: "branchId",
    }) ?? "";
  const selectedWindowId =
    useWatch({
      control: form.control,
      name: "windowId",
    }) ?? "";
  const selectedUserId =
    useWatch({
      control: form.control,
      name: "userId",
    }) ?? "";
  const hasSelectedBranch = selectedBranchId.trim().length > 0;

  const { findBranchWindows } = useBranchWindowsQuery(selectedBranchId);
  const branchWindows = useMemo(
    () => findBranchWindows.data?.data ?? [],
    [findBranchWindows.data?.data],
  );
  const hasBranchWindows = branchWindows.length > 0;
  const isBranchWindowsLoading = findBranchWindows.isLoading || findBranchWindows.isFetching;
  const noWindowsForBranch =
    hasSelectedBranch &&
    !isBranchWindowsLoading &&
    !findBranchWindows.error &&
    !hasBranchWindows;

  const branchOptions = useMemo<PaginatedItem[]>(() => {
    return (
      findAllBranches.data?.data.map((branch) => ({
        id: branch.id,
        label: branch.name,
      })) ?? []
    );
  }, [findAllBranches.data]);

  const windowOptions = useMemo<PaginatedItem[]>(() => {
    const normalizedSearch = windowsSearch.trim().toLowerCase();

    return (
      branchWindows
        .filter(({ window }) => {
          if (!normalizedSearch) {
            return true;
          }

          return (
            window.name.toLowerCase().includes(normalizedSearch) ||
            window.code.toLowerCase().includes(normalizedSearch)
          );
        })
        .map(({ window }) => ({
          id: window.id,
          label: `${window.name} (${window.code})`,
        })) ?? []
    );
  }, [branchWindows, windowsSearch]);

  const userOptions = useMemo<PaginatedItem[]>(() => {
    return (
      findAllUsers.data?.data.map((user) => ({
        id: user.id,
        label: `${user.name} (${user.email})`,
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
      setUsersPage(1);
      setUsersSearch("");
    }
  };

  const onSubmit = async (values: CreateOperatorAssignmentSchemaType) => {
    toast.promise(create.mutateAsync(values), {
      loading: "Creando asignacion de operador...",
      success: () => {
        handleOpenChange(false);
        return "Asignacion de operador creada";
      },
      error: (error) => (error as { message?: string })?.message ?? "Error al crear",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva asignacion de operador
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asignar operador a ventanilla</DialogTitle>
          <DialogDescription>
            Define en que ventanilla y sucursal trabajara el operador.
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
                      disabled={create.isPending}
                      onChange={(nextBranchId) => {
                        if (nextBranchId !== field.value) {
                          form.setValue("windowId", "", {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                          setWindowsSearch("");
                          setWindowsPage(1);
                        }

                        field.onChange(nextBranchId);
                      }}
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
                      totalPages={1}
                      isLoading={isBranchWindowsLoading}
                      disabled={
                        create.isPending ||
                        !hasSelectedBranch ||
                        isBranchWindowsLoading ||
                        noWindowsForBranch
                      }
                      onChange={field.onChange}
                      onSearchChange={(value) => {
                        setWindowsSearch(value);
                        setWindowsPage(1);
                      }}
                      onPageChange={setWindowsPage}
                    />
                  </FormControl>
                  {hasSelectedBranch && findBranchWindows.error ? (
                    <p className="text-sm text-destructive">
                      No se pudieron cargar las ventanillas: {getErrorText(findBranchWindows.error)}
                    </p>
                  ) : null}
                  {noWindowsForBranch ? (
                    <p className="text-sm text-muted-foreground">
                      La sucursal seleccionada no tiene ventanillas disponibles.
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operador</FormLabel>
                  <FormControl>
                    <PaginatedCommandSelect
                      items={userOptions}
                      value={field.value}
                      placeholder="Selecciona un usuario"
                      search={usersSearch}
                      page={usersPage}
                      totalPages={findAllUsers.data?.meta.totalPages ?? 1}
                      isLoading={findAllUsers.isLoading}
                      disabled={create.isPending}
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
                          Si esta desactivada, el operador no podra atender en esa ventanilla.
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
                disabled={
                  create.isPending ||
                  !hasSelectedBranch ||
                  !selectedWindowId ||
                  !selectedUserId ||
                  noWindowsForBranch
                }
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
