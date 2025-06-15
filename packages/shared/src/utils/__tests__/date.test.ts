/**
 * Date Utilities Tests
 */

import {
  formatDate,
  getRelativeTime,
  isValidDate,
  addDays,
  subtractDays,
  isSameDay,
  isToday,
  formatDateRange,
  parseDate,
  createDate,
  formatDuration,
  getTimezone,
  formatTimeAgo,
} from '../date';

describe('Date Utils', () => {
  const testDate = new Date('2023-06-15T10:30:00Z');

  describe('formatDate', () => {
    it('should format date with default options', () => {
      const result = formatDate(testDate);
      expect(result).toMatch(/6\/15\/2023/);
    });

    it('should format date with custom locale', () => {
      const result = formatDate(testDate, { locale: 'en-GB' });
      expect(result).toMatch(/15\/06\/2023/);
    });

    it('should format date with custom format', () => {
      const result = formatDate(testDate, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      expect(result).toMatch(/June 15, 2023/);
    });
  });

  describe('getRelativeTime', () => {
    it('should return relative time for past dates', () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
      const result = getRelativeTime(pastDate);
      expect(result).toMatch(/2 minutes ago/);
    });

    it('should return relative time for future dates', () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      const result = getRelativeTime(futureDate);
      expect(result).toMatch(/in 5 minutes/);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(testDate)).toBe(true);
      expect(isValidDate('2023-06-15')).toBe(true);
      expect(isValidDate(1686825000000)).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate(NaN)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      const result = addDays(testDate, 5);
      expect(result.getDate()).toBe(20);
    });

    it('should handle negative days', () => {
      const result = addDays(testDate, -5);
      expect(result.getDate()).toBe(10);
    });
  });

  describe('subtractDays', () => {
    it('should subtract days from a date', () => {
      const result = subtractDays(testDate, 5);
      expect(result.getDate()).toBe(10);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const sameDay = new Date('2023-06-15T15:45:00Z');
      expect(isSameDay(testDate, sameDay)).toBe(true);
    });

    it('should return false for different days', () => {
      const differentDay = new Date('2023-06-16T10:30:00Z');
      expect(isSameDay(testDate, differentDay)).toBe(false);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for other days', () => {
      expect(isToday(testDate)).toBe(false);
    });
  });

  describe('formatDateRange', () => {
    it('should format date range', () => {
      const endDate = new Date('2023-06-20T10:30:00Z');
      const result = formatDateRange(testDate, endDate);
      expect(result).toContain('–');
    });
  });

  describe('parseDate', () => {
    it('should parse ISO string', () => {
      const result = parseDate('2023-06-15T10:30:00Z');
      expect(result).toEqual(testDate);
    });

    it('should parse timestamp', () => {
      const result = parseDate(testDate.getTime());
      expect(result).toEqual(testDate);
    });

    it('should return null for invalid input', () => {
      const result = parseDate('invalid');
      expect(result).toBeNull();
    });
  });

  describe('formatDuration', () => {
    it('should format duration in seconds', () => {
      expect(formatDuration(30)).toBe('30 seconds');
      expect(formatDuration(90)).toBe('1 minute 30 seconds');
      expect(formatDuration(3661)).toBe('1 hour 1 minute 1 second');
    });

    it('should handle short format', () => {
      expect(formatDuration(3661, { short: true })).toBe('1h 1m 1s');
    });
  });
});