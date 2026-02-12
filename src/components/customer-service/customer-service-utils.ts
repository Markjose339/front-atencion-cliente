export const formatCustomerServiceDate = (value: string | null): string => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("es-BO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getCustomerServiceErrorText = (
  error: unknown,
  fallback: string,
): string => {
  if (typeof error === "string") {
    return error;
  }

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const errorRecord = error as Record<string, unknown>;

  if (typeof errorRecord.message === "string") {
    return errorRecord.message;
  }

  if (errorRecord.message && typeof errorRecord.message === "object") {
    const nested = errorRecord.message as Record<string, unknown>;

    if (typeof nested.message === "string") {
      return nested.message;
    }

    if (typeof nested.error === "string") {
      return nested.error;
    }
  }

  if (typeof errorRecord.error === "string") {
    return errorRecord.error;
  }

  return fallback;
};
