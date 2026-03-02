import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import {
  AdvertisementCreateParsedSchemaType,
  AdvertisementCreateSchemaType,
  AdvertisementUpdateParsedSchemaType,
  AdvertisementUpdateSchemaType,
  advertisementCreateSchema,
  advertisementUpdateSchema,
} from "@/lib/schemas/advertisement.schema";
import { ApiResponse } from "@/types/api-response";
import {
  ADVERTISEMENT_DISPLAY_MODES,
  ADVERTISEMENT_MEDIA_TYPES,
  Advertisement,
  AdvertisementCreateInput,
  AdvertisementDisplayMode,
  AdvertisementListQuery,
  AdvertisementMediaType,
  AdvertisementOptions,
  AdvertisementUpdateInput,
} from "@/types/advertisement";

type UnknownRecord = Record<string, unknown>;

type AdvertisementUpdatePayload = Omit<AdvertisementUpdateInput, "mediaType" | "file"> & {
  textContent?: string | null;
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeQueryValue = (value: string | undefined): string => (value ?? "").trim();

const toISOOrNull = (value: string | undefined): string | null => {
  const normalized = normalizeQueryValue(value);
  if (!normalized) {
    return null;
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

const normalizeEnumArray = <T extends string>(
  value: unknown,
  allowedValues: readonly T[],
): T[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const allowedSet = new Set<T>(allowedValues);
  const normalized = value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (isRecord(item) && typeof item.value === "string") {
        return item.value;
      }

      return null;
    })
    .filter((item): item is string => Boolean(item))
    .filter((item): item is T => allowedSet.has(item as T));

  return Array.from(new Set(normalized));
};

const readOptionsArray = (source: UnknownRecord, keys: string[]): unknown[] => {
  const entry = keys.find((key) => Array.isArray(source[key]));
  if (!entry) {
    return [];
  }

  const rawValue = source[entry];
  return Array.isArray(rawValue) ? rawValue : [];
};

const normalizeAdvertisementOptions = (payload: unknown): AdvertisementOptions => {
  const source = (() => {
    if (!isRecord(payload)) {
      return null;
    }

    if (isRecord(payload.data)) {
      return payload.data;
    }

    return payload;
  })();

  const mediaTypes = normalizeEnumArray<AdvertisementMediaType>(
    source ? readOptionsArray(source, ["mediaTypes", "mediaType"]) : [],
    ADVERTISEMENT_MEDIA_TYPES,
  );

  const displayModes = normalizeEnumArray<AdvertisementDisplayMode>(
    source ? readOptionsArray(source, ["displayModes", "displayMode"]) : [],
    ADVERTISEMENT_DISPLAY_MODES,
  );

  return {
    mediaTypes: mediaTypes.length > 0 ? mediaTypes : [...ADVERTISEMENT_MEDIA_TYPES],
    displayModes: displayModes.length > 0 ? displayModes : [...ADVERTISEMENT_DISPLAY_MODES],
  };
};

const normalizePlaylistResponse = (payload: unknown): Advertisement[] => {
  if (Array.isArray(payload)) {
    return payload as Advertisement[];
  }

  if (isRecord(payload) && Array.isArray(payload.data)) {
    return payload.data as Advertisement[];
  }

  return [];
};

const appendFormDataBaseFields = (
  formData: FormData,
  payload: {
    displayMode: AdvertisementDisplayMode;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
  },
) => {
  formData.append("displayMode", payload.displayMode);
  formData.append("isActive", String(payload.isActive));

  if (payload.startsAt) {
    formData.append("startsAt", payload.startsAt);
  }

  if (payload.endsAt) {
    formData.append("endsAt", payload.endsAt);
  }
};

const buildCreatePayload = (
  values: AdvertisementCreateParsedSchemaType,
): AdvertisementCreateInput | FormData => {
  const payloadBase = {
    title: values.title.trim(),
    mediaType: values.mediaType,
    displayMode: values.displayMode,
    isActive: values.isActive,
    startsAt: toISOOrNull(values.startsAt),
    endsAt: toISOOrNull(values.endsAt),
  };

  if (values.mediaType === "TEXT") {
    return {
      ...payloadBase,
      textContent: values.textContent,
    };
  }

  const formData = new FormData();
  formData.append("title", payloadBase.title);
  formData.append("mediaType", payloadBase.mediaType);
  formData.append("file", values.file as File);
  appendFormDataBaseFields(formData, payloadBase);

  return formData;
};

const buildUpdatePayload = (
  values: AdvertisementUpdateParsedSchemaType,
): AdvertisementUpdatePayload | FormData => {
  const payloadBase = {
    displayMode: values.displayMode,
    isActive: values.isActive,
    startsAt: toISOOrNull(values.startsAt),
    endsAt: toISOOrNull(values.endsAt),
  };

  if (values.mediaType === "TEXT") {
    return {
      ...payloadBase,
      textContent: values.textContent,
    };
  }

  if (!values.file) {
    return payloadBase;
  }

  const formData = new FormData();
  appendFormDataBaseFields(formData, payloadBase);
  formData.append("file", values.file);

  return formData;
};

export function useAdvertisementOptionsQuery() {
  const findAdvertisementOptions = useQuery({
    queryKey: ["advertisements", "options"],
    queryFn: async () => {
      const response = await api.get<unknown>("/advertisements/options");
      return normalizeAdvertisementOptions(response);
    },
    staleTime: 5 * 60_000,
  });

  return { findAdvertisementOptions };
}

export function useAdvertisementsQuery(params: AdvertisementListQuery) {
  const findAllAdvertisements = useQuery({
    queryKey: [
      "advertisements",
      "list",
      params.page,
      params.limit,
      params.search,
      params.mediaType ?? "",
      params.displayMode ?? "",
      params.isActive ?? "",
      params.activeNow ?? "",
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: params.page.toString(),
        limit: params.limit.toString(),
      });

      const search = normalizeQueryValue(params.search);
      const mediaType = normalizeQueryValue(params.mediaType);
      const displayMode = normalizeQueryValue(params.displayMode);
      const isActive = normalizeQueryValue(params.isActive);
      const activeNow = normalizeQueryValue(params.activeNow);

      if (search) {
        searchParams.set("search", search);
      }

      if (mediaType) {
        searchParams.set("mediaType", mediaType);
      }

      if (displayMode) {
        searchParams.set("displayMode", displayMode);
      }

      if (isActive) {
        searchParams.set("isActive", isActive);
      }

      if (activeNow) {
        searchParams.set("activeNow", activeNow);
      }

      return api.get<ApiResponse<Advertisement>>(`/advertisements?${searchParams.toString()}`);
    },
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  return { findAllAdvertisements };
}

export function useAdvertisementsPlaylistQuery(displayMode: AdvertisementDisplayMode) {
  const playlist = useQuery({
    queryKey: ["advertisements", "playlist", displayMode],
    queryFn: async () => {
      const params = new URLSearchParams({ displayMode });
      const response = await api.get<unknown>(`/advertisements/playlist?${params.toString()}`);
      return normalizePlaylistResponse(response);
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  return { playlist };
}

export function useAdvertisementsMutation() {
  const queryClient = useQueryClient();

  const invalidateAdvertisements = () => {
    queryClient.invalidateQueries({ queryKey: ["advertisements"], exact: false });
  };

  const create = useMutation({
    mutationFn: (values: AdvertisementCreateSchemaType) => {
      const parsedValues = advertisementCreateSchema.parse(values);
      const payload = buildCreatePayload(parsedValues);

      if (parsedValues.mediaType === "TEXT") {
        return api.post<Advertisement>("/advertisements", payload);
      }

      return api.post<Advertisement>("/advertisements/upload", payload);
    },
    onSuccess: invalidateAdvertisements,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: AdvertisementUpdateSchemaType;
    }) => {
      const parsedValues = advertisementUpdateSchema.parse(values);
      const payload = buildUpdatePayload(parsedValues);
      return api.patch<Advertisement>(`/advertisements/${id}`, payload);
    },
    onSuccess: invalidateAdvertisements,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete<Advertisement>(`/advertisements/${id}`),
    onSuccess: invalidateAdvertisements,
  });

  return { create, update, remove };
}

export const toDateTimeLocalInputValue = (value: string | null): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localOffsetMs = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - localOffsetMs);

  return localDate.toISOString().slice(0, 16);
};

export const isAdvertisementActiveNow = (advertisement: Advertisement): boolean => {
  if (!advertisement.isActive) {
    return false;
  }

  const now = Date.now();
  const startsAt = advertisement.startsAt ? new Date(advertisement.startsAt).getTime() : null;
  const endsAt = advertisement.endsAt ? new Date(advertisement.endsAt).getTime() : null;

  if (startsAt && now < startsAt) {
    return false;
  }

  if (endsAt && now > endsAt) {
    return false;
  }

  return true;
};

export const formatDateTime = (value: string | null): string => {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Fecha invalida";
  }

  return date.toLocaleString("es-BO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getMediaPreviewType = (mediaType: string): "image" | "video" | "text" => {
  if (mediaType === "VIDEO") {
    return "video";
  }

  if (mediaType === "TEXT") {
    return "text";
  }

  return "image";
};

export const humanizeDisplayMode = (value: string): string => {
  const labels: Record<string, string> = {
    FULLSCREEN: "Pantalla completa",
    TICKER: "Franja ticker",
  };

  return labels[value] ?? value;
};

export const humanizeMediaType = (value: string): string => {
  const labels: Record<string, string> = {
    IMAGE: "Imagen",
    VIDEO: "Video",
    TEXT: "Texto",
  };

  return labels[value] ?? value;
};
