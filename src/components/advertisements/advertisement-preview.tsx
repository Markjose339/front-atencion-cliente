import { resolveAdvertisementFileUrl } from "@/lib/advertisement-media";
import { cn } from "@/lib/utils";
import { AdvertisementMediaType } from "@/types/advertisement";

type AdvertisementPreviewProps = {
  fileUrl: string;
  mediaType: AdvertisementMediaType;
  title: string;
  className?: string;
};

export function AdvertisementPreview({
  fileUrl,
  mediaType,
  title,
  className,
}: AdvertisementPreviewProps) {
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
