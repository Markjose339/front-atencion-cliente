"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAdvertisementOptionsQuery, humanizeDisplayMode, humanizeTransition } from "@/hooks/use-advertisements";
import { useAdvertisementsMutation } from "@/hooks/use-advertisements";
import { extractApiErrorMessage, extractApiFieldErrors } from "@/lib/api-error";
import {
  AdvertisementCreateSchemaType,
  advertisementCreateSchema,
} from "@/lib/schemas/advertisement.schema";
import {
  ADVERTISEMENT_DISPLAY_MODES,
  ADVERTISEMENT_TRANSITIONS,
} from "@/types/advertisement";

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

const createFieldNames = [
  "title",
  "description",
  "file",
  "displayMode",
  "transition",
  "durationSeconds",
  "sortOrder",
  "isActive",
  "startsAt",
  "endsAt",
] as const;

type CreateFieldName = (typeof createFieldNames)[number];

const defaultValues: Omit<AdvertisementCreateSchemaType, "file"> = {
  title: "",
  description: "",
  displayMode: "FULLSCREEN",
  transition: "NONE",
  durationSeconds: 10,
  sortOrder: 0,
  isActive: true,
  startsAt: "",
  endsAt: "",
};

export function AdvertisementCreateDialog() {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMediaType, setPreviewMediaType] = useState<"image" | "video" | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const { create } = useAdvertisementsMutation();
  const { findAdvertisementOptions } = useAdvertisementOptionsQuery();

  const options = useMemo(
    () =>
      findAdvertisementOptions.data ?? {
        mediaTypes: [],
        displayModes: [...ADVERTISEMENT_DISPLAY_MODES],
        transitions: [...ADVERTISEMENT_TRANSITIONS],
      },
    [findAdvertisementOptions.data],
  );

  const form = useForm<AdvertisementCreateSchemaType>({
    resolver: zodResolver(advertisementCreateSchema),
    defaultValues,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetDialogState = () => {
    form.reset(defaultValues);
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }

      return null;
    });
    setPreviewMediaType(null);
    setFileInputKey((previous) => previous + 1);
  };

  const handleOpenChange = (nextValue: boolean) => {
    setOpen(nextValue);

    if (!nextValue) {
      resetDialogState();
    }
  };

  const applyServerFieldErrors = (error: unknown): boolean => {
    const fieldErrors = extractApiFieldErrors(error);
    let applied = false;

    Object.entries(fieldErrors).forEach(([field, message]) => {
      if (createFieldNames.includes(field as CreateFieldName)) {
        form.setError(field as CreateFieldName, {
          type: "server",
          message,
        });
        applied = true;
      }
    });

    return applied;
  };

  const handleFileChange = (file: File | undefined) => {
    form.setValue("file", file as File, { shouldValidate: true, shouldDirty: true });

    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }

      if (!file) {
        return null;
      }

      return URL.createObjectURL(file);
    });

    if (!file) {
      setPreviewMediaType(null);
      return;
    }

    setPreviewMediaType(file.type.startsWith("video/") ? "video" : "image");
  };

  async function onSubmit(values: AdvertisementCreateSchemaType) {
    form.clearErrors();

    try {
      const created = await create.mutateAsync(values);
      handleOpenChange(false);
      toast.success(`Publicidad "${created.title}" creada`);
    } catch (error) {
      const hasFieldErrors = applyServerFieldErrors(error);

      if (hasFieldErrors) {
        toast.error("Revise los campos marcados");
        return;
      }

      toast.error(extractApiErrorMessage(error, "No se pudo crear la publicidad"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Publicidad
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear publicidad</DialogTitle>
          <DialogDescription>
            Cargue un archivo de imagen o video y configure su reproduccion.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.25fr_1fr]">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titulo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Campana principal"
                          disabled={create.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripcion (opcional)</FormLabel>
                      <FormControl>
                        <textarea
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="Texto descriptivo de la publicidad"
                          disabled={create.isPending}
                          className="border-input bg-transparent shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 min-h-20 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="file"
                  render={() => (
                    <FormItem>
                      <FormLabel>Archivo</FormLabel>
                      <FormControl>
                        <Input
                          key={fileInputKey}
                          type="file"
                          accept="image/*,video/*"
                          onChange={(event) => handleFileChange(event.target.files?.[0])}
                          disabled={create.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="displayMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modo de visualizacion</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={create.isPending}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccione" />
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
                          disabled={create.isPending}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccione" />
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                            disabled={create.isPending}
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
                            disabled={create.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                            disabled={create.isPending}
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
                            disabled={create.isPending}
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
                            disabled={create.isPending}
                          />

                          <div className="grid gap-1.5 font-normal">
                            <p className="text-sm leading-none font-medium">Publicidad activa</p>
                            <p className="text-muted-foreground text-sm">
                              Solo las publicidades activas podran mostrarse en la playlist.
                            </p>
                          </div>
                        </Label>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Preview local</p>
                <div className="flex min-h-56 items-center justify-center rounded-lg border bg-muted/20 p-3">
                  {previewUrl && previewMediaType === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Preview del archivo"
                      className="max-h-56 w-full rounded-md object-contain"
                    />
                  ) : null}

                  {previewUrl && previewMediaType === "video" ? (
                    <video
                      src={previewUrl}
                      controls
                      muted
                      playsInline
                      className="max-h-56 w-full rounded-md object-contain"
                    />
                  ) : null}

                  {!previewUrl ? (
                    <p className="text-center text-sm text-muted-foreground">
                      Seleccione un archivo para ver la previsualizacion.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={create.isPending}>
                  Cancelar
                </Button>
              </DialogClose>

              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Guardando..." : "Guardar Publicidad"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
