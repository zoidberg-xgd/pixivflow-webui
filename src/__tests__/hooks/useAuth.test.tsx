import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { ApiResponse, AuthStatus, AuthLoginResponse } from '../../services/api/types';

// Mock the API
jest.mock('../../services/api', () => ({
  api: {
    getAuthStatus: jest.fn(),
    loginWithToken: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('useAuth', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('authentication status', () => {
    it('should fetch auth status successfully', async () => {
      const mockAuthStatus: AuthStatus = {
        isAuthenticated: true,
        user: { id: '12345', name: 'testuser' },
      };

      const mockResponse: AxiosResponse<ApiResponse<AuthStatus>> = {
        data: {
          data: mockAuthStatus,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      };

      mockApi.getAuthStatus.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.authenticated).toBe(true);
      expect(result.current.data).toBeDefined();
      expect(mockApi.getAuthStatus).toHaveBeenCalledTimes(1);
    });

    it('should handle unauthenticated status', async () => {
      const mockAuthStatus: AuthStatus = {
        isAuthenticated: false,
      };

      const mockResponse: AxiosResponse<ApiResponse<AuthStatus>> = {
        data: {
          data: mockAuthStatus,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      };

      mockApi.getAuthStatus.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.authenticated).toBe(false);
    });

    it('should handle auth status error', async () => {
      const error = new Error('Failed to fetch auth status');
      mockApi.getAuthStatus.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.authenticated).toBe(false);
    });
  });

  describe('login with token', () => {
    it('should login with token successfully', async () => {
      const mockAuthStatus: AuthStatus = {
        isAuthenticated: true,
        user: { id: '12345', name: 'testuser' },
      };

      const mockAuthResponse: AxiosResponse<ApiResponse<AuthLoginResponse>> = {
        data: {
          data: {
            refreshToken: 'new_refresh_token',
            user: mockAuthStatus.user,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      };

      const mockStatusResponse: AxiosResponse<ApiResponse<AuthStatus>> = {
        data: {
          data: mockAuthStatus,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      };

      mockApi.getAuthStatus.mockResolvedValue(mockStatusResponse);
      mockApi.loginWithToken.mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.loginWithTokenAsync('refresh_token_123');

      expect(mockApi.loginWithToken).toHaveBeenCalledWith('refresh_token_123');
    });

    it('should handle login with token error', async () => {
      const mockAuthStatus: AuthStatus = {
        isAuthenticated: false,
      };

      const mockStatusResponse: AxiosResponse<ApiResponse<AuthStatus>> = {
        data: {
          data: mockAuthStatus,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      };

      const error = new Error('Login failed');
      mockApi.getAuthStatus.mockResolvedValue(mockStatusResponse);
      mockApi.loginWithToken.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.loginWithTokenAsync('invalid_token')
      ).rejects.toThrow('Login failed');
    });
  });

  describe('loading states', () => {
    it('should track login with token loading state', async () => {
      const mockAuthStatus: AuthStatus = {
        isAuthenticated: false,
      };

      const mockStatusResponse: AxiosResponse<ApiResponse<AuthStatus>> = {
        data: {
          data: mockAuthStatus,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      };

      const mockAuthResponse: AxiosResponse<ApiResponse<AuthLoginResponse>> = {
        data: {
          data: {
            refreshToken: 'new_refresh_token',
            user: { id: '12345', name: 'testuser' },
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      };

      mockApi.getAuthStatus.mockResolvedValue(mockStatusResponse);
      mockApi.loginWithToken.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockAuthResponse), 100))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const loginPromise = result.current.loginWithTokenAsync('refresh_token_123');

      await waitFor(() => {
        expect(result.current.isLoggingInWithToken).toBe(true);
      });

      await loginPromise;

      await waitFor(() => {
        expect(result.current.isLoggingInWithToken).toBe(false);
      });
    });
  });
});

