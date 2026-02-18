export const ADVERTISEMENT_MEDIA_TYPES = ["IMAGE", "VIDEO"] as const;

export const ADVERTISEMENT_DISPLAY_MODES = [
  "FULLSCREEN",
  "BANNER_TOP",
  "BANNER_BOTTOM",
  "SPLIT_LEFT",
  "SPLIT_RIGHT",
] as const;

export const ADVERTISEMENT_TRANSITIONS = ["NONE", "FADE", "SLIDE"] as const;

export type AdvertisementMediaType = (typeof ADVERTISEMENT_MEDIA_TYPES)[number];
export type AdvertisementDisplayMode = (typeof ADVERTISEMENT_DISPLAY_MODES)[number];
export type AdvertisementTransition = (typeof ADVERTISEMENT_TRANSITIONS)[number];

export interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  mediaType: AdvertisementMediaType;
  displayMode: AdvertisementDisplayMode;
  transition: AdvertisementTransition;
  durationSeconds: number;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdvertisementOptions {
  mediaTypes: AdvertisementMediaType[];
  displayModes: AdvertisementDisplayMode[];
  transitions: AdvertisementTransition[];
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
  description?: string;
  file: File;
  displayMode: AdvertisementDisplayMode;
  transition: AdvertisementTransition;
  durationSeconds: number;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface AdvertisementUpdateInput {
  displayMode: AdvertisementDisplayMode;
  transition: AdvertisementTransition;
  durationSeconds: number;
  sortOrder: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}
