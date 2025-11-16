/**
 * Tests for validation utilities
 */

import {
  isValidEmail,
  isValidUrl,
  isValidPixivId,
  isValidPort,
  isValidIPv4,
  isValidCron,
  isValidDateString,
  hasValidExtension,
  isInRange,
  isRequired,
  hasMinLength,
  hasMaxLength,
} from '../../utils/validators';

describe('validators', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://www.pixiv.net/artworks/123456')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('htp://invalid')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isValidPixivId', () => {
    it('should validate correct Pixiv IDs', () => {
      expect(isValidPixivId(123456)).toBe(true);
      expect(isValidPixivId('123456')).toBe(true);
      expect(isValidPixivId(1)).toBe(true);
    });

    it('should reject invalid Pixiv IDs', () => {
      expect(isValidPixivId(0)).toBe(false);
      expect(isValidPixivId(-1)).toBe(false);
      expect(isValidPixivId('abc')).toBe(false);
      expect(isValidPixivId('12a34')).toBe(false);
    });
  });

  describe('isValidPort', () => {
    it('should validate correct port numbers', () => {
      expect(isValidPort(80)).toBe(true);
      expect(isValidPort(3000)).toBe(true);
      expect(isValidPort(65535)).toBe(true);
      expect(isValidPort(1)).toBe(true);
    });

    it('should reject invalid port numbers', () => {
      expect(isValidPort(0)).toBe(false);
      expect(isValidPort(-1)).toBe(false);
      expect(isValidPort(65536)).toBe(false);
      expect(isValidPort(100000)).toBe(false);
      expect(isValidPort(3.14)).toBe(false);
    });
  });

  describe('isValidIPv4', () => {
    it('should validate correct IPv4 addresses', () => {
      expect(isValidIPv4('192.168.1.1')).toBe(true);
      expect(isValidIPv4('127.0.0.1')).toBe(true);
      expect(isValidIPv4('0.0.0.0')).toBe(true);
      expect(isValidIPv4('255.255.255.255')).toBe(true);
    });

    it('should reject invalid IPv4 addresses', () => {
      expect(isValidIPv4('256.1.1.1')).toBe(false);
      expect(isValidIPv4('192.168.1')).toBe(false);
      expect(isValidIPv4('192.168.1.1.1')).toBe(false);
      expect(isValidIPv4('abc.def.ghi.jkl')).toBe(false);
      expect(isValidIPv4('192.168.-1.1')).toBe(false);
    });
  });

  describe('isValidCron', () => {
    it('should validate correct cron expressions', () => {
      expect(isValidCron('0 0 * * *')).toBe(true);
      expect(isValidCron('*/5 * * * *')).toBe(true);
      expect(isValidCron('0 0 1 1 *')).toBe(true);
      expect(isValidCron('0 0 * * * *')).toBe(true); // 6 fields
    });

    it('should reject invalid cron expressions', () => {
      expect(isValidCron('0 0 *')).toBe(false);
      expect(isValidCron('invalid')).toBe(false);
      expect(isValidCron('')).toBe(false);
    });
  });

  describe('isValidDateString', () => {
    it('should validate correct date strings', () => {
      expect(isValidDateString('2024-01-01')).toBe(true);
      expect(isValidDateString('2023-12-31')).toBe(true);
      expect(isValidDateString('2000-06-15')).toBe(true);
    });

    it('should reject invalid date strings', () => {
      expect(isValidDateString('2024-13-01')).toBe(false);
      expect(isValidDateString('2024-01-32')).toBe(false);
      expect(isValidDateString('24-01-01')).toBe(false);
      expect(isValidDateString('2024/01/01')).toBe(false);
      expect(isValidDateString('invalid')).toBe(false);
    });
  });

  describe('hasValidExtension', () => {
    it('should validate correct file extensions', () => {
      expect(hasValidExtension('image.jpg', ['.jpg', '.png'])).toBe(true);
      expect(hasValidExtension('document.PDF', ['.pdf'])).toBe(true);
      expect(hasValidExtension('file.TXT', ['.txt', '.md'])).toBe(true);
    });

    it('should reject invalid file extensions', () => {
      expect(hasValidExtension('image.gif', ['.jpg', '.png'])).toBe(false);
      expect(hasValidExtension('noextension', ['.txt'])).toBe(false);
      expect(hasValidExtension('file.exe', ['.jpg', '.png'])).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should validate values in range', () => {
      expect(isInRange(5, 0, 10)).toBe(true);
      expect(isInRange(0, 0, 10)).toBe(true);
      expect(isInRange(10, 0, 10)).toBe(true);
      expect(isInRange(-5, -10, 0)).toBe(true);
    });

    it('should reject values out of range', () => {
      expect(isInRange(-1, 0, 10)).toBe(false);
      expect(isInRange(11, 0, 10)).toBe(false);
      expect(isInRange(100, 0, 10)).toBe(false);
    });
  });

  describe('isRequired', () => {
    it('should validate non-empty values', () => {
      expect(isRequired('text')).toBe(true);
      expect(isRequired([1, 2, 3])).toBe(true);
      expect(isRequired({ key: 'value' })).toBe(true);
      expect(isRequired(123)).toBe(true);
      expect(isRequired(true)).toBe(true);
    });

    it('should reject empty values', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
      expect(isRequired([])).toBe(false);
      expect(isRequired({})).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });
  });

  describe('hasMinLength', () => {
    it('should validate strings meeting minimum length', () => {
      expect(hasMinLength('hello', 3)).toBe(true);
      expect(hasMinLength('hello', 5)).toBe(true);
      expect(hasMinLength('a', 1)).toBe(true);
    });

    it('should reject strings below minimum length', () => {
      expect(hasMinLength('hi', 3)).toBe(false);
      expect(hasMinLength('', 1)).toBe(false);
      expect(hasMinLength('test', 10)).toBe(false);
    });
  });

  describe('hasMaxLength', () => {
    it('should validate strings within maximum length', () => {
      expect(hasMaxLength('hello', 10)).toBe(true);
      expect(hasMaxLength('hello', 5)).toBe(true);
      expect(hasMaxLength('', 10)).toBe(true);
    });

    it('should reject strings exceeding maximum length', () => {
      expect(hasMaxLength('hello world', 5)).toBe(false);
      expect(hasMaxLength('test', 3)).toBe(false);
    });
  });
});

