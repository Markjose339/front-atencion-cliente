export const ADVERTISEMENT_MEDIA_TYPES = ["IMAGE", "VIDEO", "TEXT"] as const;

export const ADVERTISEMENT_DISPLAY_MODES = ["FULLSCREEN", "TICKER"] as const;

export type AdvertisementMediaType = (typeof ADVERTISEMENT_MEDIA_TYPES)[number];
export type AdvertisementDisplayMode = (typeof ADVERTISEMENT_DISPLAY_MODES)[number];

export interface Advertisement {
  id: string;
  title: string;
  mediaType: AdvertisementMediaType;
  displayMode: AdvertisementDisplayMode;
  textContent: string | null;
  filePath: string | null;
  mimeType: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdvertisementOptions {
  mediaTypes: AdvertisementMediaType[];
  displayModes: AdvertisementDisplayMode[];
}

export interface AdvertisementListQuery {
  page: number;
  limit: number;
  search: string;
  mediaType?: AdvertisementMediaType | "";
  displayMode?: AdvertisementDisplayMode | "";
  isActive?: "true" | "false" | "";
  activeNow?: "true" | "false" | "";
}

export interface AdvertisementCreateInput {
  title: string;
  mediaType: AdvertisementMediaType;
  displayMode: AdvertisementDisplayMode;
  textContent?: string | null;
  file?: File;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface AdvertisementUpdateInput {
  mediaType: AdvertisementMediaType;
  displayMode: AdvertisementDisplayMode;
  textContent?: string | null;
  file?: File;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}
