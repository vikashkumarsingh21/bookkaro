/**
 * BOOKKARO Enterprise Universal API Client
 * Configured for Next.js frontend to communicate with /backend service
 * Supports HTTP-only JWT cookies, automatic 401 token rotation, and normalized error responses.
 */

export interface ApiClientOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  skipRefreshRetry?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode: number, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000/api/v1';
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = path.startsWith('http') ? path : `${this.baseUrl}${cleanPath}`;
    const url = new URL(fullUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Attempt token refresh using HTTP-only cookie rotation
   */
  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshUrl = `${this.baseUrl}/auth/refresh`;
        const res = await fetch(refreshUrl, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Universal Request Handler
   */
  public async request<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
    const { params, timeoutMs = 12000, skipRefreshRetry = false, headers = {}, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        credentials: 'include', // Guarantees HTTP-only cookie transport
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-Platform': 'web-bookkaro-patna',
          ...headers,
        },
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized with single token refresh attempt
      if (response.status === 401 && !skipRefreshRetry && !path.includes('/auth/')) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.request<T>(path, { ...options, skipRefreshRetry: true });
        }
      }

      const responseText = await response.text();
      let responseJson: ApiResponse<T>;

      try {
        responseJson = JSON.parse(responseText);
      } catch {
        if (!response.ok) {
          throw new ApiError(
            `Server responded with ${response.status}: ${response.statusText}`,
            response.status,
            'HTTP_ERROR'
          );
        }
        return responseText as unknown as T;
      }

      if (!response.ok || responseJson.success === false) {
        throw new ApiError(
          responseJson.message || `Request failed with status ${response.status}`,
          response.status,
          responseJson.code || 'REQUEST_FAILED',
          responseJson.errors
        );
      }

      return (responseJson.data !== undefined ? responseJson.data : responseJson) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }

      const err = error as Error;
      throw new ApiError(
        err.name === 'AbortError' ? 'Request timed out' : err.message || 'Network request failed',
        500,
        err.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR'
      );
    }
  }

  public get<T>(path: string, params?: Record<string, string | number | boolean | undefined>, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET', params });
  }

  public post<T>(path: string, body?: unknown, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(path: string, body?: unknown, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(path: string, body?: unknown, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
