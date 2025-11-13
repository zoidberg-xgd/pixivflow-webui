import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { QUERY_KEYS } from '../constants';
import { isAuthenticated as checkAuth } from '../utils/authUtils';

/**
 * Hook to check authentication status
 * Returns authentication state and helper functions
 */
export function useAuth() {
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.AUTH_STATUS,
    queryFn: () => api.getAuthStatus(),
    retry: false,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const authenticated = !isError && checkAuth(data);

  return {
    authenticated,
    isLoading,
    isError,
    data,
  };
}
