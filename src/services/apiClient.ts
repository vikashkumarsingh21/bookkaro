/**
 * Re-export Universal API Client from @/lib/apiClient
 * Preserves backward-compatibility across all service modules
 */

export {
  apiClient,
  ApiError,
  type ApiClientOptions,
  type ApiClientOptions as ApiRequestOptions,
  type ApiResponse,
} from '@/lib/apiClient';

export { default } from '@/lib/apiClient';
