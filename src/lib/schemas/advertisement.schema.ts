import { z } from "zod";

import {
  ADVERTISEMENT_DISPLAY_MODES,
  ADVERTISEMENT_MEDIA_TYPES,
  AdvertisementMediaType,
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

const normalizeOptionalText = z
  .string()
  .optional()
  .transform((value) => (value ?? "").trim());

const isFileInstance = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

const optionalFileField = z
  .custom<File | undefined>((value) => value === undefined || isFileInstance(value), {
    message: "El archivo es invalido",
  })
  .optional();

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

const validateMediaFile = (
  file: File,
  mediaType: AdvertisementMediaType,
  ctx: z.RefinementCtx,
) => {
  if (file.size <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["file"],
      message: "El archivo es obligatorio",
    });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["file"],
      message: "El archivo no puede superar 200MB",
    });
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (!isImage && !isVideo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["file"],
      message: "Solo se permiten imagenes o videos",
    });
    return;
  }

  if (mediaType === "IMAGE" && !isImage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["file"],
      message: "Debe subir una imagen",
    });
  }

  if (mediaType === "VIDEO" && !isVideo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["file"],
      message: "Debe subir un video",
    });
  }
};

const advertisementBaseSchema = z.object({
  mediaType: z.enum(ADVERTISEMENT_MEDIA_TYPES),
  displayMode: z.enum(ADVERTISEMENT_DISPLAY_MODES),
  textContent: normalizeOptionalText,
  file: optionalFileField,
  isActive: z.boolean(),
  startsAt: datetimeLocalField,
  endsAt: datetimeLocalField,
});

export const advertisementCreateSchema = advertisementBaseSchema
  .extend({
    title: z
      .string({ message: "El titulo debe ser texto" })
      .trim()
      .min(1, "El titulo es obligatorio")
      .max(150, "El titulo no puede exceder 150 caracteres"),
  })
  .superRefine((values, ctx) => {
    validateDateRange(values, ctx);

    if (values.mediaType === "TEXT") {
      if (!values.textContent) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["textContent"],
          message: "El texto es obligatorio para publicidades de tipo texto",
        });
      }

      if (values.file) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["file"],
          message: "No debe subir archivo para publicidades de texto",
        });
      }

      return;
    }

    if (values.textContent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["textContent"],
        message: "El texto no aplica para imagenes o videos",
      });
    }

    if (!values.file) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["file"],
        message: "El archivo es obligatorio",
      });
      return;
    }

    validateMediaFile(values.file, values.mediaType, ctx);
  });

export const advertisementUpdateSchema = advertisementBaseSchema.superRefine((values, ctx) => {
  validateDateRange(values, ctx);

  if (values.mediaType === "TEXT") {
    if (!values.textContent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["textContent"],
        message: "El texto es obligatorio para publicidades de tipo texto",
      });
    }

    if (values.file) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["file"],
        message: "No debe subir archivo para publicidades de texto",
      });
    }

    return;
  }

  if (values.textContent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["textContent"],
      message: "El texto no aplica para imagenes o videos",
    });
  }

  if (values.file) {
    validateMediaFile(values.file, values.mediaType, ctx);
  }
});

export type AdvertisementCreateSchemaType = z.input<typeof advertisementCreateSchema>;
export type AdvertisementCreateParsedSchemaType = z.output<typeof advertisementCreateSchema>;
export type AdvertisementUpdateSchemaType = z.input<typeof advertisementUpdateSchema>;
export type AdvertisementUpdateParsedSchemaType = z.output<typeof advertisementUpdateSchema>;
