type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asTrimmedString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const extractConstraintMessage = (value: unknown): string | null => {
  if (!isRecord(value)) {
    return null;
  }

  const firstMessage = Object.values(value)
    .map((item) => asTrimmedString(item))
    .find((item) => Boolean(item));

  return firstMessage ?? null;
};

const collectFieldErrorsFromRecord = (
  source: UnknownRecord,
  target: Record<string, string>,
): void => {
  const propertyName = asTrimmedString(source.property);

  if (propertyName) {
    const directMessage = asTrimmedString(source.message);
    const constraintsMessage = extractConstraintMessage(source.constraints);

    if (directMessage) {
      target[propertyName] = directMessage;
      return;
    }

    if (constraintsMessage) {
      target[propertyName] = constraintsMessage;
      return;
    }
  }

  Object.entries(source).forEach(([key, rawValue]) => {
    if (["statusCode", "error"].includes(key)) {
      return;
    }

    const directMessage = asTrimmedString(rawValue);
    if (directMessage) {
      target[key] = directMessage;
      return;
    }

    if (Array.isArray(rawValue)) {
      const firstString = rawValue
        .map((item) => asTrimmedString(item))
        .find((item) => Boolean(item));

      if (firstString) {
        target[key] = firstString;
        return;
      }

      rawValue
        .filter((item): item is UnknownRecord => isRecord(item))
        .forEach((item) => collectFieldErrorsFromRecord(item, target));
      return;
    }

    if (isRecord(rawValue)) {
      const nestedMessage = asTrimmedString(rawValue.message);
      if (nestedMessage) {
        target[key] = nestedMessage;
        return;
      }

      const constraintsMessage = extractConstraintMessage(rawValue.constraints);
      if (constraintsMessage) {
        target[key] = constraintsMessage;
        return;
      }

      collectFieldErrorsFromRecord(rawValue, target);
    }
  });
};

export function extractApiFieldErrors(error: unknown): Record<string, string> {
  if (!isRecord(error)) {
    return {};
  }

  const target: Record<string, string> = {};
  const payload = error.message ?? error.errors ?? error;

  if (Array.isArray(payload)) {
    payload
      .filter((item): item is UnknownRecord => isRecord(item))
      .forEach((item) => collectFieldErrorsFromRecord(item, target));

    return target;
  }

  if (isRecord(payload)) {
    collectFieldErrorsFromRecord(payload, target);
  }

  return target;
}

export function extractApiErrorMessage(
  error: unknown,
  fallback: string = "Ocurrio un error inesperado",
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (!isRecord(error)) {
    return fallback;
  }

  const direct = asTrimmedString(error.message);
  if (direct) {
    return direct;
  }

  if (Array.isArray(error.message)) {
    const normalized = error.message
      .map((item) => asTrimmedString(item))
      .filter((item): item is string => Boolean(item));

    if (normalized.length > 0) {
      return normalized.join(". ");
    }
  }

  if (isRecord(error.message)) {
    const nested = asTrimmedString(error.message.message);
    if (nested) {
      return nested;
    }

    const fromField = Object.values(error.message)
      .flatMap((value) => {
        if (Array.isArray(value)) {
          return value.map((item) => asTrimmedString(item)).filter(Boolean) as string[];
        }

        const asString = asTrimmedString(value);
        return asString ? [asString] : [];
      })
      .find((message) => Boolean(message));

    if (fromField) {
      return fromField;
    }
  }

  const fallbackFromErrorField = asTrimmedString(error.error);
  if (fallbackFromErrorField) {
    return fallbackFromErrorField;
  }

  return fallback;
}
