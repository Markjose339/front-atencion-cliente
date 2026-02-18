"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAdvertisementsMutation, humanizeDisplayMode, humanizeTransition, toDateTimeLocalInputValue } from "@/hooks/use-advertisements";
import { extractApiErrorMessage, extractApiFieldErrors } from "@/lib/api-error";
import {
  AdvertisementUpdateSchemaType,
  advertisementUpdateSchema,
} from "@/lib/schemas/advertisement.schema";
import { Advertisement, AdvertisementOptions } from "@/types/advertisement";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdvertisementEditDialogProps {
  advertisement: Advertisement;
  options: AdvertisementOptions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const editableFieldNames = [
  "displayMode",
  "transition",
  "durationSeconds",
  "sortOrder",
  "isActive",
  "startsAt",
  "endsAt",
] as const;

type EditableFieldName = (typeof editableFieldNames)[number];

const getDefaultValues = (
  advertisement: Advertisement,
): AdvertisementUpdateSchemaType => ({
  displayMode: advertisement.displayMode,
  transition: advertisement.transition,
  durationSeconds: advertisement.durationSeconds,
  sortOrder: advertisement.sortOrder,
  isActive: advertisement.isActive,
  startsAt: toDateTimeLocalInputValue(advertisement.startsAt),
  endsAt: toDateTimeLocalInputValue(advertisement.endsAt),
});

export function AdvertisementEditDialog({
  advertisement,
  options,
  open,
  onOpenChange,
}: AdvertisementEditDialogProps) {
  const { update } = useAdvertisementsMutation();

  const form = useForm<AdvertisementUpdateSchemaType>({
    resolver: zodResolver(advertisementUpdateSchema),
    defaultValues: getDefaultValues(advertisement),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(getDefaultValues(advertisement));
  }, [open, advertisement, form]);

  const applyServerFieldErrors = (error: unknown): boolean => {
    const fieldErrors = extractApiFieldErrors(error);
    let applied = false;

    Object.entries(fieldErrors).forEach(([field, message]) => {
      if (editableFieldNames.includes(field as EditableFieldName)) {
        form.setError(field as EditableFieldName, {
          type: "server",
          message,
        });
        applied = true;
      }
    });

    return applied;
  };

  async function onSubmit(values: AdvertisementUpdateSchemaType) {
    form.clearErrors();

    try {
      const updated = await update.mutateAsync({
        id: advertisement.id,
        values,
      });

      onOpenChange(false);
      toast.success(`Publicidad "${updated.title}" actualizada`);
    } catch (error) {
      const hasFieldErrors = applyServerFieldErrors(error);

      if (hasFieldErrors) {
        toast.error("Revise los campos marcados");
        return;
      }

      toast.error(extractApiErrorMessage(error, "No se pudo actualizar la publicidad"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar configuracion de publicidad</DialogTitle>
          <DialogDescription>
            Ajuste el modo de visualizacion, transicion, duracion, orden y vigencia.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="font-medium">Titulo</p>
              <p className="text-muted-foreground">{advertisement.title}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="displayMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modo de visualizacion</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={update.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione un modo" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {options.displayModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {humanizeDisplayMode(mode)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transicion</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={update.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione una transicion" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {options.transitions.map((transition) => (
                          <SelectItem key={transition} value={transition}>
                            {humanizeTransition(transition)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="durationSeconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duracion (segundos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : String(field.value)
                        }
                        onChange={(event) => field.onChange(event.target.value)}
                        disabled={update.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : String(field.value)
                        }
                        onChange={(event) => field.onChange(event.target.value)}
                        disabled={update.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inicio de vigencia</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                        disabled={update.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fin de vigencia</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                        disabled={update.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors has-checked:border-primary has-checked:bg-primary/5">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        disabled={update.isPending}
                      />

                      <div className="grid gap-1.5 font-normal">
                        <p className="text-sm leading-none font-medium">Publicidad activa</p>
                        <p className="text-muted-foreground text-sm">
                          Solo las publicidades activas pueden entrar a la playlist.
                        </p>
                      </div>
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={update.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
