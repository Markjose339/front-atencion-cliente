import { resolveAdvertisementFileUrl } from "@/lib/advertisement-media";
import { cn } from "@/lib/utils";
import { AdvertisementMediaType } from "@/types/advertisement";

type AdvertisementPreviewProps = {
  fileUrl: string | null;
  mediaType: AdvertisementMediaType;
  title: string;
  textContent?: string | null;
  className?: string;
};

export function AdvertisementPreview({
  fileUrl,
  mediaType,
  title,
  textContent,
  className,
}: AdvertisementPreviewProps) {
  if (mediaType === "TEXT") {
    return (
      <div
        className={cn(
          "flex h-20 w-36 items-center rounded-md border bg-muted/30 px-2.5 py-2 text-xs",
          className,
        )}
      >
        <p className="line-clamp-4 break-words text-muted-foreground">
          {textContent?.trim() || "Sin contenido de texto"}
        </p>
      </div>
    );
  }

  const resolvedFileUrl = resolveAdvertisementFileUrl(fileUrl);

  if (!resolvedFileUrl) {
    return (
      <div
        className={cn(
          "flex h-20 w-36 items-center justify-center rounded-md border bg-muted text-xs",
          className,
        )}
      >
        Sin archivo
      </div>
    );
  }

  if (mediaType === "VIDEO") {
    return (
      <video
        src={resolvedFileUrl}
        muted
        playsInline
        controls
        preload="metadata"
        className={cn("h-20 w-36 rounded-md border object-cover", className)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedFileUrl}
      alt={title}
      loading="lazy"
      className={cn("h-20 w-36 rounded-md border object-cover", className)}
    />
  );
}
