"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  humanizeDisplayMode,
  humanizeMediaType,
  toDateTimeLocalInputValue,
  useAdvertisementsMutation,
} from "@/hooks/use-advertisements";
import { resolveAdvertisementFileUrl } from "@/lib/advertisement-media";
import { extractApiErrorMessage, extractApiFieldErrors } from "@/lib/api-error";
import {
  AdvertisementUpdateSchemaType,
  advertisementUpdateSchema,
} from "@/lib/schemas/advertisement.schema";
import { Advertisement, AdvertisementMediaType, AdvertisementOptions } from "@/types/advertisement";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  "textContent",
  "file",
  "isActive",
  "startsAt",
  "endsAt",
] as const;

type EditableFieldName = (typeof editableFieldNames)[number];

const resolveFileAccept = (mediaType: AdvertisementMediaType): string => {
  if (mediaType === "IMAGE") {
    return "image/*";
  }

  if (mediaType === "VIDEO") {
    return "video/*";
  }

  return "image/*,video/*";
};

const getDefaultValues = (
  advertisement: Advertisement,
): AdvertisementUpdateSchemaType => ({
  mediaType: advertisement.mediaType,
  displayMode: advertisement.displayMode,
  textContent: advertisement.textContent ?? "",
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMediaType, setPreviewMediaType] = useState<"image" | "video" | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const { update } = useAdvertisementsMutation();

  const form = useForm<AdvertisementUpdateSchemaType>({
    resolver: zodResolver(advertisementUpdateSchema),
    defaultValues: getDefaultValues(advertisement),
  });

  const mediaType = useWatch({
    control: form.control,
    name: "mediaType",
  }) ?? advertisement.mediaType;

  const textContentValue = useWatch({
    control: form.control,
    name: "textContent",
  }) ?? "";

  const isTextMedia = mediaType === "TEXT";

  const clearFilePreview = () => {
    setPreviewUrl((previous) => {
      if (previous) {
        URL.revokeObjectURL(previous);
      }

      return null;
    });
    setPreviewMediaType(null);
    setFileInputKey((previous) => previous + 1);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(getDefaultValues(advertisement));
  }, [open, advertisement, form]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const currentResolvedFileUrl = useMemo(
    () => resolveAdvertisementFileUrl(advertisement.fileUrl),
    [advertisement.fileUrl],
  );

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.setValue("file", undefined, { shouldValidate: false, shouldDirty: false });
      clearFilePreview();
    }

    onOpenChange(nextOpen);
  };

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

  const handleFileChange = (file: File | undefined) => {
    form.setValue("file", file, { shouldValidate: true, shouldDirty: true });

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

  async function onSubmit(values: AdvertisementUpdateSchemaType) {
    form.clearErrors();

    try {
      const updated = await update.mutateAsync({
        id: advertisement.id,
        values: {
          ...values,
          mediaType: advertisement.mediaType,
        },
      });

      handleDialogOpenChange(false);
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
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar configuracion de publicidad</DialogTitle>
          <DialogDescription>
            Ajuste el modo de visualizacion y la vigencia. El tipo de media no puede cambiar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="font-medium">Titulo</p>
              <p className="text-muted-foreground">{advertisement.title}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Tipo de media</Label>
                <div className="border-input bg-muted/40 text-muted-foreground flex h-9 items-center rounded-md border px-3 text-sm">
                  {humanizeMediaType(advertisement.mediaType)}
                </div>
              </div>

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
            </div>

            {isTextMedia ? (
              <FormField
                control={form.control}
                name="textContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido de texto</FormLabel>
                    <FormControl>
                      <textarea
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Texto que se mostrara en la franja"
                        disabled={update.isPending}
                        className="border-input bg-transparent shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 min-h-24 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>Reemplazar archivo (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        key={fileInputKey}
                        type="file"
                        accept={resolveFileAccept(advertisement.mediaType)}
                        onChange={(event) => handleFileChange(event.target.files?.[0])}
                        disabled={update.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            <div className="space-y-3">
              <p className="text-sm font-medium">Preview</p>
              <div className="flex min-h-40 items-center justify-center rounded-lg border bg-muted/20 p-3">
                {isTextMedia ? (
                  <p className="line-clamp-7 text-sm text-muted-foreground">
                    {textContentValue.trim() || "Sin texto"}
                  </p>
                ) : null}

                {!isTextMedia && previewUrl && previewMediaType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Preview del archivo"
                    className="max-h-40 w-full rounded-md object-contain"
                  />
                ) : null}

                {!isTextMedia && previewUrl && previewMediaType === "video" ? (
                  <video
                    src={previewUrl}
                    controls
                    muted
                    playsInline
                    className="max-h-40 w-full rounded-md object-contain"
                  />
                ) : null}

                {!isTextMedia && !previewUrl && currentResolvedFileUrl && advertisement.mediaType === "VIDEO" ? (
                  <video
                    src={currentResolvedFileUrl}
                    controls
                    muted
                    playsInline
                    className="max-h-40 w-full rounded-md object-contain"
                  />
                ) : null}

                {!isTextMedia && !previewUrl && currentResolvedFileUrl && advertisement.mediaType === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentResolvedFileUrl}
                    alt={advertisement.title}
                    className="max-h-40 w-full rounded-md object-contain"
                  />
                ) : null}

                {!isTextMedia && !previewUrl && !currentResolvedFileUrl ? (
                  <p className="text-center text-sm text-muted-foreground">Sin archivo disponible.</p>
                ) : null}
              </div>
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
                onClick={() => handleDialogOpenChange(false)}
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
