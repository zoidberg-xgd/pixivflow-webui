/**
 * Accessibility tests using jest-axe
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

import Login from '../../pages/Login';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';
import { ErrorCode } from '../../types/errors';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock hooks
jest.mock('../../pages/Login/hooks', () => ({
  useLoginFlow: () => ({
    loginMode: 'password',
    loginStep: 0,
    isLoggingIn: false,
    isLoggingInWithToken: false,
    authStatusLoading: false,
    authStatus: { isAuthenticated: false },
    isAuthenticated: () => false,
    setLoginMode: jest.fn(),
    handleLogin: jest.fn(),
    handleCheckStatus: jest.fn(),
    navigate: jest.fn(),
  }),
}));

expect.extend(toHaveNoViolations);

describe('Accessibility (a11y)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('LoginPage Accessibility', () => {
    it('should have no accessibility violations on initial render', async () => {
      const { container } = renderWithProviders(<Login />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Common Components Accessibility', () => {
    it('EmptyState should have no accessibility violations', async () => {
      const { container } = renderWithProviders(
        <EmptyState description="No data available" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('LoadingSpinner should have no accessibility violations', async () => {
      const { container } = renderWithProviders(
        <LoadingSpinner />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ErrorDisplay should have no accessibility violations', async () => {
      const mockError = {
        code: ErrorCode.NETWORK_ERROR,
        message: 'An error occurred',
      };
      const { container } = renderWithProviders(
        <ErrorDisplay error={mockError} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

