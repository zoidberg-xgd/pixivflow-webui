import { TableColumnsType, TableProps } from 'antd';
import React from 'react';

/**
 * Column definition for DataTable
 */
export interface DataTableColumn<T = unknown> extends Omit<TableColumnsType<T>[number], 'dataIndex'> {
  /**
   * Data index for the column
   */
  dataIndex?: string | string[] | keyof T;
  /**
   * Whether the column is sortable
   */
  sortable?: boolean;
  
  /**
   * Custom sort function
   */
  sorter?: (a: T, b: T) => number;
  
  /**
   * Whether the column is filterable
   */
  filterable?: boolean;
  
  /**
   * Filter options for the column
   */
  filterOptions?: Array<{ label: string; value: string | number | boolean }>;
  
  /**
   * Custom filter function
   * Note: Ant Design's onFilter accepts boolean | Key, but we use a more restrictive type for better type safety
   */
  onFilter?: (value: string | number | boolean | bigint, record: T) => boolean;
}

/**
 * Props for DataTable component
 */
export interface DataTableProps<T = unknown> extends Omit<TableProps<T>, 'columns' | 'dataSource' | 'pagination'> {
  /**
   * Table data
   */
  data: T[];
  
  /**
   * Column definitions
   */
  columns: DataTableColumn<T>[];
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Whether to show pagination
   */
  pagination?: boolean | {
    current?: number;
    pageSize?: number;
    total?: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: string[];
    onChange?: (page: number, pageSize: number) => void;
    onShowSizeChange?: (current: number, size: number) => void;
  };
  
  /**
   * Row key getter
   */
  rowKey?: string | ((record: T) => string);
  
  /**
   * Whether rows are selectable
   */
  rowSelection?: TableProps<T>['rowSelection'];
  
  /**
   * Empty state message
   */
  emptyText?: string;
  
  /**
   * Custom empty state component
   */
  emptyComponent?: React.ReactNode;
  
  /**
   * Scroll configuration
   */
  scroll?: TableProps<T>['scroll'];
  
  /**
   * Size of the table
   */
  size?: 'small' | 'middle' | 'large';
  
  /**
   * Whether to show borders
   */
  bordered?: boolean;
  
  /**
   * Custom style
   */
  style?: React.CSSProperties;
  
  /**
   * Custom className
   */
  className?: string;
}

/**
 * Filter configuration for TableFilters
 */
export interface TableFilterConfig {
  /**
   * Filter key
   */
  key: string;
  
  /**
   * Filter label
   */
  label: string;
  
  /**
   * Filter type
   */
  type: 'select' | 'input' | 'date' | 'dateRange' | 'number';
  
  /**
   * Filter options (for select type)
   */
  options?: Array<{ label: string; value: string | number | boolean }>;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Default value
   */
  defaultValue?: string | number | boolean | null;
  
  /**
   * Whether the filter is required
   */
  required?: boolean;
}

/**
 * Props for TableFilters component
 */
export interface TableFiltersProps {
  /**
   * Filter configurations
   */
  filters: TableFilterConfig[];
  
  /**
   * Current filter values
   * Can be string, number, boolean, Dayjs, or array of Dayjs for date ranges
   */
  values: Record<string, string | number | boolean | null | undefined | unknown>;
  
  /**
   * Callback when filters change
   */
  onChange: (values: Record<string, string | number | boolean | null | undefined | unknown>) => void;
  
  /**
   * Callback to reset filters
   */
  onReset?: () => void;
  
  /**
   * Whether to show reset button
   */
  showReset?: boolean;
  
  /**
   * Custom style
   */
  style?: React.CSSProperties;
  
  /**
   * Custom className
   */
  className?: string;
}

/**
 * Props for TablePagination component
 */
export interface TablePaginationProps {
  /**
   * Current page
   */
  current: number;
  
  /**
   * Page size
   */
  pageSize: number;
  
  /**
   * Total number of items
   */
  total: number;
  
  /**
   * Callback when page changes
   */
  onChange: (page: number, pageSize: number) => void;
  
  /**
   * Whether to show size changer
   */
  showSizeChanger?: boolean;
  
  /**
   * Page size options
   */
  pageSizeOptions?: string[];
  
  /**
   * Whether to show total
   */
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  
  /**
   * Custom style
   */
  style?: React.CSSProperties;
  
  /**
   * Custom className
   */
  className?: string;
}

