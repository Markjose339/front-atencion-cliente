const API_URL: string | undefined = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

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
  const id: number = window.setTimeout(() => controller.abort(), ms);

  return {
    signal: controller.signal,
    cancel: () => clearTimeout(id),
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
    const res: Response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Refresh failed');
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
  ['/auth/login', '/auth/logout', '/auth/refresh'].some(path =>
    endpoint.includes(path),
  );

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
    const res: Response = await fetch(`${API_URL}${endpoint}`, finalConfig);

    if (res.status === 401 && retry && !shouldSkipRefresh(endpoint)) {
      const refreshed: boolean = await refreshToken();
      if (refreshed) {
        return apiFetch<T>(endpoint, config, false);
      }
    }

    if (!res.ok) {
      const message: string = await res.json();
      throw { status: res.status, message } satisfies ApiError;
    }

    if (res.status === 204) {
      return null as T;
    }

    return (await res.json()) as T;
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
