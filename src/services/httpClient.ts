import type { ServiceResponse } from '../types';
import { useAuthStore } from '../store/authStore';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
const DEFAULT_TIMEOUT_MS = 15_000;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  skipAuth?: boolean;
  _retry?: boolean;
}

export class HttpClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: RequestOptions['params']): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const urlString = this.baseUrl.startsWith('http')
      ? `${this.baseUrl}${cleanPath}`
      : `${window.location.origin}${this.baseUrl}${cleanPath}`;

    const url = new URL(urlString);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async attemptTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const { refreshToken, logout, setTokens } = useAuthStore.getState();
    if (!refreshToken) {
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshUrl = this.buildUrl('/auth/refresh');
        const res = await fetch(refreshUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          logout();
          return null;
        }

        const json = await res.json();
        const data = json?.data || json;
        const newAccessToken = data?.accessToken || data?.token;
        const newRefreshToken = data?.refreshToken || refreshToken;

        if (newAccessToken) {
          setTokens(newAccessToken, newRefreshToken);
          return newAccessToken;
        }

        logout();
        return null;
      } catch {
        logout();
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<ServiceResponse<T>> {
    const { params, timeoutMs = DEFAULT_TIMEOUT_MS, skipAuth = false, _retry = false, headers: customHeaders, ...rest } = options;
    const url = this.buildUrl(path, params);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers = new Headers(customHeaders);
    if (!(body instanceof FormData) && !headers.has('Content-Type') && body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }

    if (!skipAuth) {
      const token = useAuthStore.getState().token;
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        ...rest,
      });

      clearTimeout(timer);

      // Handle 401 Unauthorized with token refresh
      if (response.status === 401 && !skipAuth && !_retry && !path.includes('/auth/refresh') && !path.includes('/auth/logout')) {
        const newAccessToken = await this.attemptTokenRefresh();
        if (newAccessToken) {
          // Retry the request with the fresh token
          const retryHeaders = new Headers(headers);
          retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
          return this.request<T>(path, method, body, {
            ...options,
            _retry: true,
            headers: retryHeaders,
          });
        }

        // Refresh failed -> clear session and redirect
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/sign-in') && !window.location.pathname.startsWith('/letter/')) {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/sign-in?redirect=${encodeURIComponent(currentPath)}`;
        }
        return {
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Your session has expired. Please sign in again.',
        };
      }

      if (response.status === 401) {
        useAuthStore.getState().logout();
        return {
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Your session has expired. Please sign in again.',
        };
      }

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        if (isJson) {
          try {
            const errorJson = await response.json();
            return {
              success: false,
              code: errorJson.code || `HTTP_${response.status}`,
              message: errorJson.message || errorJson.error || response.statusText,
            };
          } catch {
            // Fallback if parsing fails
          }
        }
        return {
          success: false,
          code: `HTTP_${response.status}`,
          message: response.statusText || 'Server error occurred.',
        };
      }

      if (response.status === 204) {
        return {
          success: true,
          data: {} as T,
        };
      }

      if (isJson) {
        const json = await response.json();
        // Support { success: true, data: T } or { status: true, data: T } (BaseResponse) or direct payload T
        if (typeof json === 'object' && json !== null) {
          if ('success' in json && 'data' in json) {
            if (json.success) {
              return {
                success: true,
                data: json.data as T,
              };
            }
            return {
              success: false,
              code: json.code || 'UNKNOWN_ERROR',
              message: json.message || 'An error occurred.',
            };
          }
          if ('status' in json && 'data' in json) {
            if (json.status) {
              return {
                success: true,
                data: json.data as T,
              };
            }
            return {
              success: false,
              code: json.statusCode ? `ERR_${json.statusCode}` : 'UNKNOWN_ERROR',
              message: json.message || 'An error occurred.',
            };
          }
        }
        return {
          success: true,
          data: json as T,
        };
      }

      const text = await response.text();
      return {
        success: true,
        data: text as unknown as T,
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof DOMException && err.name === 'AbortError') {
        return {
          success: false,
          code: 'TIMEOUT',
          message: 'The request took too long to complete. Please check your connection.',
        };
      }

      const message = err instanceof Error ? err.message : 'Network failure occurred.';
      return {
        success: false,
        code: 'NETWORK_ERROR',
        message: message.includes('Failed to fetch') || message.includes('NetworkError')
          ? 'Could not connect to the server. Please check your internet connection.'
          : message,
      };
    }
  }

  get<T>(path: string, options?: RequestOptions): Promise<ServiceResponse<T>> {
    return this.request<T>(path, 'GET', undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ServiceResponse<T>> {
    return this.request<T>(path, 'POST', body, options);
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ServiceResponse<T>> {
    return this.request<T>(path, 'PUT', body, options);
  }

  delete<T>(path: string, options?: RequestOptions): Promise<ServiceResponse<T>> {
    return this.request<T>(path, 'DELETE', undefined, options);
  }
}

export const httpClient = new HttpClient();
