const RAW_API_URL: string | undefined = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!RAW_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const NORMALIZED_API_URL = RAW_API_URL.replace(/\/+$/, "");
const API_BASE_URL = NORMALIZED_API_URL.endsWith("/api")
  ? NORMALIZED_API_URL
  : `${NORMALIZED_API_URL}/api`;

type ApiError = {
  status: number;
  message: string;
};

type RefreshQueueCallback = (success: boolean) => void;

type TimeoutController = {
  signal: AbortSignal;
  cancel: () => void;
};

let isRefreshing: boolean = false;
let refreshQueue: RefreshQueueCallback[] = [];

const timeoutFetch = (ms: number): TimeoutController => {
  const controller: AbortController = new AbortController();
  const id: ReturnType<typeof setTimeout> = globalThis.setTimeout(
    () => controller.abort(),
    ms,
  );

  return {
    signal: controller.signal,
    cancel: () => globalThis.clearTimeout(id),
  };
};

const notifyQueue = (success: boolean): void => {
  refreshQueue.forEach(cb => cb(success));
  refreshQueue = [];
};

const refreshToken = async (): Promise<boolean> => {
  if (isRefreshing) {
    return new Promise<boolean>(resolve => {
      refreshQueue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const res: Response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Refresh failed");
    }

    notifyQueue(true);
    return true;
  } catch {
    notifyQueue(false);
    return false;
  } finally {
    isRefreshing = false;
  }
};

const shouldSkipRefresh = (endpoint: string): boolean =>
  ["/auth/login", "/auth/logout", "/auth/refresh"].some(path =>
    endpoint.includes(path),
  );

const resolveEndpoint = (endpoint: string): string =>
  endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

const parseErrorMessage = (raw: string, fallback: string): string => {
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (typeof parsed === "string" && parsed.trim()) {
      return parsed;
    }

    if (typeof parsed === "object" && parsed !== null) {
      if (
        "message" in parsed &&
        typeof parsed.message === "string" &&
        parsed.message.trim()
      ) {
        return parsed.message;
      }

      if (
        "message" in parsed &&
        Array.isArray(parsed.message) &&
        parsed.message.length > 0
      ) {
        return parsed.message.join(", ");
      }
    }

    return fallback;
  } catch {
    return raw;
  }
};

const buildConfig = (config?: RequestInit): RequestInit => {
  const body: BodyInit | null | undefined = config?.body;
  const isFormData: boolean = body instanceof FormData;

  const headers: HeadersInit | undefined = isFormData
    ? config?.headers
    : {
        'Content-Type': 'application/json',
        ...(config?.headers ?? {}),
      };

  return {
    credentials: 'include',
    ...config,
    headers,
  };
};

const apiFetch = async <T>(
  endpoint: string,
  config?: RequestInit,
  retry: boolean = true,
): Promise<T> => {
  const { signal, cancel } = timeoutFetch(15000);

  const finalConfig: RequestInit = {
    ...buildConfig(config),
    signal,
  };

  try {
    const normalizedEndpoint = resolveEndpoint(endpoint);
    const res: Response = await fetch(
      `${API_BASE_URL}${normalizedEndpoint}`,
      finalConfig,
    );

    if (res.status === 401 && retry && !shouldSkipRefresh(endpoint)) {
      const refreshed: boolean = await refreshToken();
      if (refreshed) {
        return apiFetch<T>(endpoint, config, false);
      }
    }

    if (!res.ok) {
      const raw = await res.text();
      const message = parseErrorMessage(
        raw,
        `Request failed with status ${res.status}`,
      );
      throw { status: res.status, message } satisfies ApiError;
    }

    if (res.status === 204) {
      return null as T;
    }

    const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType.includes("json")) {
      return (await res.json()) as T;
    }

    return (await res.text()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw { status: 408, message: 'Request timeout' } satisfies ApiError;
    }

    if (typeof error === 'object' && error !== null && 'status' in error) {
      throw error;
    }

    throw {
      status: 500,
      message: 'Unexpected error',
    } satisfies ApiError;
  } finally {
    cancel();
  }
};

export const api = {
  get: <T>(endpoint: string, config?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, { ...config, method: 'GET' }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    config?: RequestInit,
  ): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...config,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    config?: RequestInit,
  ): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    config?: RequestInit,
  ): Promise<T> =>
    apiFetch<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, config?: RequestInit): Promise<T> =>
    apiFetch<T>(endpoint, { ...config, method: 'DELETE' }),
};

export const isAuthenticated = (): boolean =>
  typeof document !== 'undefined' &&
  document.cookie.split('; ').includes('IsAuthenticated=true');
