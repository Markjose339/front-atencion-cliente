export const resolveAdvertisementFileUrl = (fileUrl: string): string => {
  const normalized = fileUrl.trim();
  if (!normalized) {
    return "";
  }

  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("data:")) {
    return normalized;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiBaseUrl) {
    return normalized;
  }

  const base = apiBaseUrl.replace(/\/+$/, "");
  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `${base}${path}`;
};
