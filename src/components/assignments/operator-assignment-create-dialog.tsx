"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { CreateOperatorAssignmentSchema } from "@/lib/schemas/assignment.schema";
import { useOperatorAssignmentsMutation } from "@/hooks/use-assignments";
import { useBranchesQuery } from "@/hooks/use-branches";
import { useUsersQuery } from "@/hooks/use-users";
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

const ITEMS_PER_PAGE = 10;

type CreateOperatorAssignmentFormValues = z.input<typeof CreateOperatorAssignmentSchema>;
type CreateOperatorAssignmentPayload = z.output<typeof CreateOperatorAssignmentSchema>;

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

  const { findAllWindows } = useWindowsQuery({
    page: windowsPage,
    limit: ITEMS_PER_PAGE,
    search: windowsSearch,
  });

  const { findAllUsers } = useUsersQuery({
    page: usersPage,
    limit: ITEMS_PER_PAGE,
    search: usersSearch,
  });

  const form = useForm<CreateOperatorAssignmentFormValues>({
    resolver: zodResolver(CreateOperatorAssignmentSchema),
    defaultValues: {
      branchId: "",
      windowId: "",
      userId: "",
      isActive: true,
    },
  });

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

  const onSubmit = async (values: CreateOperatorAssignmentFormValues) => {
    const payload: CreateOperatorAssignmentPayload =
      CreateOperatorAssignmentSchema.parse(values);

    toast.promise(create.mutateAsync(payload), {
      loading: "Creando asignacion de operador...",
      success: () => {
        handleOpenChange(false);
        return "Asignacion de operador creada";
      },
      error: (error) =>
        (error as { message?: string })?.message ?? "Error al crear",
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
                      value={field.value ?? ""}
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
                      value={field.value ?? ""}
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
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operador</FormLabel>
                  <FormControl>
                    <PaginatedCommandSelect
                      items={userOptions}
                      value={field.value ?? ""}
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

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors has-checked:border-primary has-checked:bg-primary/5">
                      <Checkbox
                        checked={!!field.value}
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

              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
