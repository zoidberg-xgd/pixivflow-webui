/**
 * Tests for authService
 */

import { authService } from '../../services/authService';
import { api } from '../../services/api';

// Mock the API
jest.mock('../../services/api', () => ({
  api: {
    getAuthStatus: jest.fn(),
    login: jest.fn(),
    loginWithToken: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthStatus', () => {
    it('should get authentication status', async () => {
      const mockStatus = {
        isAuthenticated: true,
        userId: '123',
        username: 'testuser',
      };

      (api.getAuthStatus as jest.Mock).mockResolvedValue({
        data: { data: mockStatus },
      });

      const result = await authService.getAuthStatus();

      expect(api.getAuthStatus).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockStatus);
    });

    it('should handle error when getting auth status', async () => {
      (api.getAuthStatus as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await expect(authService.getAuthStatus()).rejects.toThrow('Network error');
    });
  });

  describe('login', () => {
    it('should login with username and password', async () => {
      const mockResponse = {
        success: true,
        userId: '123',
        username: 'testuser',
        token: 'abc123',
      };

      (api.login as jest.Mock).mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await authService.login('testuser', 'password123');

      expect(api.login).toHaveBeenCalledWith('testuser', 'password123', true, undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should login with custom headless setting', async () => {
      const mockResponse = { success: true };

      (api.login as jest.Mock).mockResolvedValue({
        data: { data: mockResponse },
      });

      await authService.login('testuser', 'password123', false);

      expect(api.login).toHaveBeenCalledWith('testuser', 'password123', false, undefined);
    });

    it('should login with proxy settings', async () => {
      const mockResponse = { success: true };
      const proxy = {
        enabled: true,
        host: 'proxy.example.com',
        port: 8080,
        protocol: 'http',
      };

      (api.login as jest.Mock).mockResolvedValue({
        data: { data: mockResponse },
      });

      await authService.login('testuser', 'password123', true, proxy);

      expect(api.login).toHaveBeenCalledWith('testuser', 'password123', true, proxy);
    });

    it('should handle login error', async () => {
      (api.login as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials')
      );

      await expect(
        authService.login('testuser', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('loginWithToken', () => {
    it('should login with refresh token', async () => {
      const mockResponse = {
        success: true,
        userId: '123',
        token: 'new-token',
      };

      (api.loginWithToken as jest.Mock).mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await authService.loginWithToken('refresh-token-123');

      expect(api.loginWithToken).toHaveBeenCalledWith('refresh-token-123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid token error', async () => {
      (api.loginWithToken as jest.Mock).mockRejectedValue(
        new Error('Invalid token')
      );

      await expect(
        authService.loginWithToken('invalid-token')
      ).rejects.toThrow('Invalid token');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token with provided refresh token', async () => {
      const mockResponse = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (api.refreshToken as jest.Mock).mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await authService.refreshToken('old-refresh-token');

      expect(api.refreshToken).toHaveBeenCalledWith('old-refresh-token');
      expect(result).toEqual(mockResponse);
    });

    it('should refresh token without providing refresh token', async () => {
      const mockResponse = {
        token: 'new-access-token',
      };

      (api.refreshToken as jest.Mock).mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await authService.refreshToken();

      expect(api.refreshToken).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should handle refresh token error', async () => {
      (api.refreshToken as jest.Mock).mockRejectedValue(
        new Error('Token expired')
      );

      await expect(
        authService.refreshToken('expired-token')
      ).rejects.toThrow('Token expired');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      (api.logout as jest.Mock).mockResolvedValue({});

      await authService.logout();

      expect(api.logout).toHaveBeenCalledTimes(1);
    });

    it('should handle logout error', async () => {
      (api.logout as jest.Mock).mockRejectedValue(
        new Error('Logout failed')
      );

      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });
});

