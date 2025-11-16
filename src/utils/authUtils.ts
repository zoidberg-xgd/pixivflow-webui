import { AxiosResponse } from 'axios';
import { ApiResponse, AuthStatus } from '../services/api/types';

/**
 * Extract authentication status from API response
 * Handles different response structures:
 * - AxiosResponse<ApiResponse<AuthStatus>>: response.data.data.isAuthenticated
 * - ApiResponse<AuthStatus>: response.data.isAuthenticated
 * - AuthStatus: response.isAuthenticated
 * 
 * @param response - API response (can be AxiosResponse, ApiResponse, or AuthStatus)
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(response: unknown): boolean {
  if (!response) {
    return false;
  }

  // Handle AxiosResponse structure: response.data.data.isAuthenticated
  if (typeof response === 'object' && response !== null && 'data' in response) {
    const axiosResponse = response as AxiosResponse<ApiResponse<AuthStatus>>;
    const apiResponse = axiosResponse.data;
    
    // Check if it's ApiResponse structure
    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      const authStatus = apiResponse.data as AuthStatus;
      return authStatus?.isAuthenticated === true;
    }
    
    // Check if data itself is AuthStatus
    const authStatus = apiResponse as unknown as AuthStatus;
    if (authStatus && typeof authStatus === 'object' && 'isAuthenticated' in authStatus) {
      return authStatus.isAuthenticated === true;
    }
  }

  // Handle direct AuthStatus object
  if (typeof response === 'object' && response !== null && 'isAuthenticated' in response) {
    const authStatus = response as AuthStatus;
    return authStatus.isAuthenticated === true;
  }

  // Fallback: check for legacy field names (for backward compatibility)
  // IMPORTANT: Only check isAuthenticated or authenticated, NOT hasToken
  // hasToken only indicates token exists, not that it's valid
  if (typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>;
    const responseData = obj.data as Record<string, unknown> | undefined;
    
    if (responseData) {
      // Check nested data structure
      const nestedData = responseData.data as Record<string, unknown> | undefined;
      const dataToCheck = nestedData || responseData;
      
      // Only check isAuthenticated or authenticated, NOT hasToken
      // hasToken === true does NOT mean authenticated === true
      return (
        dataToCheck?.isAuthenticated === true ||
        dataToCheck?.authenticated === true
      );
    }
    
    // Check top-level fields
    // Only check isAuthenticated or authenticated, NOT hasToken
    return (
      obj.isAuthenticated === true ||
      obj.authenticated === true
    );
  }

  return false;
}

/**
 * Extract user information from authentication response
 * @param response - API response
 * @returns User object or undefined
 */
export function getUserFromAuthResponse(response: unknown): AuthStatus['user'] | undefined {
  if (!response) {
    return undefined;
  }

  // Handle AxiosResponse structure
  if (typeof response === 'object' && response !== null && 'data' in response) {
    const axiosResponse = response as AxiosResponse<ApiResponse<AuthStatus>>;
    const apiResponse = axiosResponse.data;
    
    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      const authStatus = apiResponse.data as AuthStatus;
      return authStatus?.user;
    }
    
    const authStatus = apiResponse as unknown as AuthStatus;
    if (authStatus && typeof authStatus === 'object' && 'user' in authStatus) {
      return authStatus.user;
    }
  }

  // Handle direct AuthStatus object
  if (typeof response === 'object' && response !== null && 'user' in response) {
    const authStatus = response as AuthStatus;
    return authStatus.user;
  }

  return undefined;
}

