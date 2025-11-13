import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { QUERY_KEYS } from '../constants';
import { isAuthenticated as checkAuth } from '../utils/authUtils';

/**
 * Hook to check authentication status and handle login operations
 * Returns authentication state and helper functions
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const [isLoggingInWithToken, setIsLoggingInWithToken] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.AUTH_STATUS,
    queryFn: () => api.getAuthStatus(),
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const authenticated = !isError && checkAuth(data);

  // Login with token mutation
  const loginWithTokenMutation = useMutation({
    mutationFn: (refreshToken: string) => api.loginWithToken(refreshToken),
    onSuccess: () => {
      // Invalidate auth status to refresh
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH_STATUS });
      setIsLoggingInWithToken(false);
    },
    onError: () => {
      setIsLoggingInWithToken(false);
    },
  });

  const loginWithTokenAsync = async (refreshToken: string) => {
    setIsLoggingInWithToken(true);
    try {
      await loginWithTokenMutation.mutateAsync(refreshToken);
    } finally {
      setIsLoggingInWithToken(false);
    }
  };

  return {
    authenticated,
    isLoading,
    isError,
    data,
    loginWithTokenAsync,
    isLoggingInWithToken,
  };
}
