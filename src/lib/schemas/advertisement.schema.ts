import { z } from "zod";

import {
  ADVERTISEMENT_DISPLAY_MODES,
  ADVERTISEMENT_TRANSITIONS,
} from "@/types/advertisement";

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024;

const isValidDateValue = (value: string): boolean => {
  if (!value) {
    return true;
  }

  return !Number.isNaN(new Date(value).getTime());
};

const datetimeLocalField = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim())
  .refine((value) => isValidDateValue(value), {
    message: "Fecha y hora invalidas",
  });

const optionalDescriptionField = z
  .string()
  .optional()
  .transform((value) => {
    const normalized = (value ?? "").trim();
    return normalized.length > 0 ? normalized : "";
  })
  .refine((value) => value.length <= 500, {
    message: "La descripcion no puede exceder 500 caracteres",
  });

const fileField = z
  .custom<File>((value) => typeof File !== "undefined" && value instanceof File, {
    message: "El archivo es obligatorio",
  })
  .refine((file) => file.size > 0, {
    message: "El archivo es obligatorio",
  })
  .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, {
    message: "El archivo no puede superar 200MB",
  })
  .refine((file) => file.type.startsWith("image/") || file.type.startsWith("video/"), {
    message: "Solo se permiten imagenes o videos",
  });

const validateDateRange = (
  values: { startsAt?: string; endsAt?: string },
  ctx: z.RefinementCtx,
) => {
  if (!values.startsAt || !values.endsAt) {
    return;
  }

  const startsAt = new Date(values.startsAt).getTime();
  const endsAt = new Date(values.endsAt).getTime();

  if (Number.isNaN(startsAt) || Number.isNaN(endsAt)) {
    return;
  }

  if (endsAt < startsAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endsAt"],
      message: "La fecha de fin debe ser mayor o igual a la fecha de inicio",
    });
  }
};

export const advertisementCreateSchema = z
  .object({
    title: z
      .string({ message: "El titulo debe ser texto" })
      .trim()
      .min(1, "El titulo es obligatorio")
      .max(150, "El titulo no puede exceder 150 caracteres"),
    description: optionalDescriptionField,
    file: fileField,
    displayMode: z.enum(ADVERTISEMENT_DISPLAY_MODES),
    transition: z.enum(ADVERTISEMENT_TRANSITIONS),
    durationSeconds: z.coerce
      .number({ message: "La duracion es obligatoria" })
      .int("La duracion debe ser un numero entero")
      .min(1, "La duracion debe ser al menos 1 segundo")
      .max(3600, "La duracion no puede exceder 3600 segundos"),
    sortOrder: z.coerce
      .number({ message: "El orden es obligatorio" })
      .int("El orden debe ser un numero entero")
      .min(0, "El orden no puede ser negativo")
      .max(999_999, "El orden no puede exceder 999999"),
    isActive: z.boolean(),
    startsAt: datetimeLocalField,
    endsAt: datetimeLocalField,
  })
  .superRefine((values, ctx) => validateDateRange(values, ctx));

export const advertisementUpdateSchema = z
  .object({
    displayMode: z.enum(ADVERTISEMENT_DISPLAY_MODES),
    transition: z.enum(ADVERTISEMENT_TRANSITIONS),
    durationSeconds: z.coerce
      .number({ message: "La duracion es obligatoria" })
      .int("La duracion debe ser un numero entero")
      .min(1, "La duracion debe ser al menos 1 segundo")
      .max(3600, "La duracion no puede exceder 3600 segundos"),
    sortOrder: z.coerce
      .number({ message: "El orden es obligatorio" })
      .int("El orden debe ser un numero entero")
      .min(0, "El orden no puede ser negativo")
      .max(999_999, "El orden no puede exceder 999999"),
    isActive: z.boolean(),
    startsAt: datetimeLocalField,
    endsAt: datetimeLocalField,
  })
  .superRefine((values, ctx) => validateDateRange(values, ctx));

export type AdvertisementCreateSchemaType = z.input<typeof advertisementCreateSchema>;
export type AdvertisementCreateParsedSchemaType = z.output<typeof advertisementCreateSchema>;
export type AdvertisementUpdateSchemaType = z.input<typeof advertisementUpdateSchema>;
export type AdvertisementUpdateParsedSchemaType = z.output<typeof advertisementUpdateSchema>;
