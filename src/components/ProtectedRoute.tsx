import { useQuery } from '@tanstack/react-query';
import { Spin, Alert } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { QUERY_KEYS } from '../constants';
import { isAuthenticated } from '../utils/authUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that checks authentication status
 * Allows access to all pages, but shows a login prompt if not authenticated
 * This prevents white screen issues and provides better UX
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.AUTH_STATUS,
    queryFn: () => api.getAuthStatus(),
    retry: false,
    staleTime: 0, // No cache - always fetch fresh data
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary requests
  });

  const authenticated = !isError && isAuthenticated(data);

  // Show loading spinner while checking authentication (only on initial load)
  if (isLoading && !data) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Always render children, but show a login prompt if not authenticated
  return (
    <>
      {!authenticated && (
        <Alert
          message={t('layout.needLogin')}
          description={
            <span>
              {t('layout.notLoggedInDesc')}
              <Link to="/login" style={{ marginLeft: 8 }}>
                {t('layout.loginNow')}
              </Link>
            </span>
          }
          type="warning"
          showIcon
          closable
          style={{
            margin: 16,
            marginBottom: 0,
          }}
        />
      )}
      {children}
    </>
  );
}

