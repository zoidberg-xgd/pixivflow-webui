/**
 * Tests for usePagination hook
 */

import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../../hooks/usePagination';

describe('usePagination', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(20);
    expect(result.current.total).toBe(0);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it('should initialize with custom page size', () => {
    const { result } = renderHook(() => usePagination(50));

    expect(result.current.pageSize).toBe(50);
  });

  it('should calculate total pages correctly', () => {
    const { result } = renderHook(() => usePagination(10));

    act(() => {
      result.current.setTotal(100);
    });

    expect(result.current.totalPages).toBe(10);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should handle partial pages', () => {
    const { result } = renderHook(() => usePagination(10));

    act(() => {
      result.current.setTotal(95);
    });

    expect(result.current.totalPages).toBe(10);
  });

  it('should navigate to next page', () => {
    const { result } = renderHook(() => usePagination(10));

    act(() => {
      result.current.setTotal(100);
    });

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page).toBe(2);
    expect(result.current.hasPrevPage).toBe(true);
  });

  it('should not navigate beyond last page', () => {
    const { result } = renderHook(() => usePagination(10));

    act(() => {
      result.current.setTotal(20);
      result.current.setPage(2);
    });

    expect(result.current.hasNextPage).toBe(false);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.page).toBe(2);
  });

  it('should navigate to previous page', () => {
    const { result } = renderHook(() => usePagination(10));

    act(() => {
      result.current.setTotal(100);
      result.current.setPage(3);
    });

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page).toBe(2);
  });

  it('should not navigate before first page', () => {
    const { result } = renderHook(() => usePagination(10));

    expect(result.current.hasPrevPage).toBe(false);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page).toBe(1);
  });

  it('should reset pagination', () => {
    const { result } = renderHook(() => usePagination(10));

    act(() => {
      result.current.setTotal(100);
      result.current.setPage(5);
    });

    expect(result.current.page).toBe(5);
    expect(result.current.total).toBe(100);

    act(() => {
      result.current.reset();
    });

    expect(result.current.page).toBe(1);
    expect(result.current.total).toBe(0);
  });

  it('should reset to first page when page size changes', () => {
    const { result } = renderHook(() => usePagination(10));

    act(() => {
      result.current.setTotal(100);
      result.current.setPage(5);
    });

    expect(result.current.page).toBe(5);

    act(() => {
      result.current.setPageSize(20);
    });

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(20);
  });

  it('should update hasNextPage and hasPrevPage correctly', () => {
    const { result } = renderHook(() => usePagination(10));

    act(() => {
      result.current.setTotal(30);
    });

    // Page 1
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);

    // Page 2
    act(() => {
      result.current.nextPage();
    });
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(true);

    // Page 3 (last page)
    act(() => {
      result.current.nextPage();
    });
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(true);
  });

  it('should handle edge case with zero total', () => {
    const { result } = renderHook(() => usePagination(10));

    expect(result.current.totalPages).toBe(0);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('should handle edge case with total less than page size', () => {
    const { result } = renderHook(() => usePagination(20));

    act(() => {
      result.current.setTotal(10);
    });

    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
  });
});

