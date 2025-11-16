/**
 * Tests for formatting utilities
 */

import {
  formatFileSize,
  formatDuration,
  formatNumber,
  formatPercentage,
  truncateText,
  formatPixivId,
  pluralize,
  formatRelativeTime,
} from '../../utils/formatters';

describe('formatters', () => {
  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(undefined)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1048576)).toBe('1.00 MB');
      expect(formatFileSize(1073741824)).toBe('1.00 GB');
    });

    it('should respect decimal places', () => {
      expect(formatFileSize(1536, 0)).toBe('2 KB');
      expect(formatFileSize(1536, 1)).toBe('1.5 KB');
      expect(formatFileSize(1536, 3)).toBe('1.500 KB');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(65)).toBe('1m 5s');
      expect(formatDuration(125)).toBe('2m 5s');
    });

    it('should format hours, minutes and seconds', () => {
      expect(formatDuration(3665)).toBe('1h 1m 5s');
      expect(formatDuration(7200)).toBe('2h');
    });

    it('should handle zero seconds', () => {
      expect(formatDuration(0)).toBe('0s');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousands separator', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123456789)).toBe('123,456,789');
    });

    it('should handle small numbers', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(100)).toBe('100');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      expect(formatPercentage(25, 100)).toBe('25.0%');
      expect(formatPercentage(1, 3)).toBe('33.3%');
      expect(formatPercentage(50, 200)).toBe('25.0%');
    });

    it('should handle zero total', () => {
      expect(formatPercentage(10, 0)).toBe('0%');
    });

    it('should respect decimal places', () => {
      expect(formatPercentage(1, 3, 0)).toBe('33%');
      expect(formatPercentage(1, 3, 2)).toBe('33.33%');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello...');
      expect(truncateText('This is a long text', 10)).toBe('This is...');
    });

    it('should not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short');
      expect(truncateText('Hello', 5)).toBe('Hello');
    });

    it('should use custom ellipsis', () => {
      expect(truncateText('Hello World', 8, '…')).toBe('Hello W…');
    });
  });

  describe('formatPixivId', () => {
    it('should format numeric ID with leading zeros', () => {
      expect(formatPixivId(12345)).toBe('00012345');
      expect(formatPixivId(1)).toBe('00000001');
    });

    it('should format string ID with leading zeros', () => {
      expect(formatPixivId('12345')).toBe('00012345');
      expect(formatPixivId('999')).toBe('00000999');
    });

    it('should respect custom length', () => {
      expect(formatPixivId(123, 5)).toBe('00123');
      expect(formatPixivId(123, 10)).toBe('0000000123');
    });
  });

  describe('pluralize', () => {
    it('should use singular for count of 1', () => {
      expect(pluralize(1, 'item')).toBe('1 item');
      expect(pluralize(1, 'file')).toBe('1 file');
    });

    it('should use plural for count > 1', () => {
      expect(pluralize(5, 'item')).toBe('5 items');
      expect(pluralize(0, 'file')).toBe('0 files');
    });

    it('should use custom plural form', () => {
      expect(pluralize(2, 'child', 'children')).toBe('2 children');
      expect(pluralize(3, 'person', 'people')).toBe('3 people');
    });
  });

  describe('formatRelativeTime', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should format "just now" for recent times', () => {
      const date = new Date(now.getTime() - 30000); // 30 seconds ago
      expect(formatRelativeTime(date, 'en-US')).toBe('just now');
      expect(formatRelativeTime(date, 'zh-CN')).toBe('刚刚');
    });

    it('should format minutes ago', () => {
      const date = new Date(now.getTime() - 120000); // 2 minutes ago
      expect(formatRelativeTime(date, 'en-US')).toBe('2 minutes ago');
      expect(formatRelativeTime(date, 'zh-CN')).toBe('2分钟前');
    });

    it('should format hours ago', () => {
      const date = new Date(now.getTime() - 7200000); // 2 hours ago
      expect(formatRelativeTime(date, 'en-US')).toBe('2 hours ago');
      expect(formatRelativeTime(date, 'zh-CN')).toBe('2小时前');
    });

    it('should format days ago', () => {
      const date = new Date(now.getTime() - 172800000); // 2 days ago
      expect(formatRelativeTime(date, 'en-US')).toBe('2 days ago');
      expect(formatRelativeTime(date, 'zh-CN')).toBe('2天前');
    });

    it('should format full date for old dates', () => {
      const date = new Date(now.getTime() - 604800000); // 7 days ago
      const result = formatRelativeTime(date, 'en-US');
      expect(result).toContain('2023'); // Should contain year
    });
  });
});

