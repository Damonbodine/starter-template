/**
 * Date utility functions for cross-platform use
 */

/**
 * Formats a date to a readable string
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Formats a date to ISO string (YYYY-MM-DD)
 * @param date - The date to format
 * @returns ISO date string
 */
export function formatISODate(date: Date | string | number): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  return dateObj.toISOString().split('T')[0];
}

/**
 * Formats a time to a readable string
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted time string
 */
export function formatTime(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return dateObj.toLocaleTimeString(undefined, defaultOptions);
}

/**
 * Calculates relative time from now (e.g., "2 hours ago", "in 3 days")
 * @param date - The date to calculate from
 * @returns Relative time string
 */
export function getRelativeTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  const now = new Date();
  const diffInMs = dateObj.getTime() - now.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);
  
  if (Math.abs(diffInSeconds) < 60) {
    return diffInSeconds === 0 ? 'just now' : 
           diffInSeconds > 0 ? 'in a few seconds' : 'a few seconds ago';
  }
  
  if (Math.abs(diffInMinutes) < 60) {
    return diffInMinutes > 0 
      ? `in ${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) !== 1 ? 's' : ''}`
      : `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) !== 1 ? 's' : ''} ago`;
  }
  
  if (Math.abs(diffInHours) < 24) {
    return diffInHours > 0
      ? `in ${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? 's' : ''}`
      : `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? 's' : ''} ago`;
  }
  
  if (Math.abs(diffInDays) < 7) {
    return diffInDays > 0
      ? `in ${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? 's' : ''}`
      : `${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? 's' : ''} ago`;
  }
  
  if (Math.abs(diffInWeeks) < 4) {
    return diffInWeeks > 0
      ? `in ${Math.abs(diffInWeeks)} week${Math.abs(diffInWeeks) !== 1 ? 's' : ''}`
      : `${Math.abs(diffInWeeks)} week${Math.abs(diffInWeeks) !== 1 ? 's' : ''} ago`;
  }
  
  if (Math.abs(diffInMonths) < 12) {
    return diffInMonths > 0
      ? `in ${Math.abs(diffInMonths)} month${Math.abs(diffInMonths) !== 1 ? 's' : ''}`
      : `${Math.abs(diffInMonths)} month${Math.abs(diffInMonths) !== 1 ? 's' : ''} ago`;
  }
  
  return diffInYears > 0
    ? `in ${Math.abs(diffInYears)} year${Math.abs(diffInYears) !== 1 ? 's' : ''}`
    : `${Math.abs(diffInYears)} year${Math.abs(diffInYears) !== 1 ? 's' : ''} ago`;
}

/**
 * Adds time to a date
 * @param date - The base date
 * @param amount - Amount to add
 * @param unit - Unit of time
 * @returns New date with added time
 */
export function addTime(
  date: Date | string | number,
  amount: number,
  unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
): Date {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  const result = new Date(dateObj);
  
  switch (unit) {
    case 'seconds':
      result.setSeconds(result.getSeconds() + amount);
      break;
    case 'minutes':
      result.setMinutes(result.getMinutes() + amount);
      break;
    case 'hours':
      result.setHours(result.getHours() + amount);
      break;
    case 'days':
      result.setDate(result.getDate() + amount);
      break;
    case 'weeks':
      result.setDate(result.getDate() + (amount * 7));
      break;
    case 'months':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'years':
      result.setFullYear(result.getFullYear() + amount);
      break;
  }
  
  return result;
}

/**
 * Checks if a date is valid
 * @param date - The date to validate
 * @returns True if valid, false otherwise
 */
export function isValidDate(date: any): boolean {
  if (!date) return false;
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Gets the start of a time period
 * @param date - The date
 * @param unit - Unit of time
 * @returns Start of the period
 */
export function startOf(
  date: Date | string | number,
  unit: 'day' | 'week' | 'month' | 'year'
): Date {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  const result = new Date(dateObj);
  
  switch (unit) {
    case 'day':
      result.setHours(0, 0, 0, 0);
      break;
    case 'week':
      const day = result.getDay();
      const diff = result.getDate() - day;
      result.setDate(diff);
      result.setHours(0, 0, 0, 0);
      break;
    case 'month':
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'year':
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
  }
  
  return result;
}

/**
 * Gets the end of a time period
 * @param date - The date
 * @param unit - Unit of time
 * @returns End of the period
 */
export function endOf(
  date: Date | string | number,
  unit: 'day' | 'week' | 'month' | 'year'
): Date {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  const result = new Date(dateObj);
  
  switch (unit) {
    case 'day':
      result.setHours(23, 59, 59, 999);
      break;
    case 'week':
      const day = result.getDay();
      const diff = result.getDate() - day + 6;
      result.setDate(diff);
      result.setHours(23, 59, 59, 999);
      break;
    case 'month':
      result.setMonth(result.getMonth() + 1, 0);
      result.setHours(23, 59, 59, 999);
      break;
    case 'year':
      result.setMonth(11, 31);
      result.setHours(23, 59, 59, 999);
      break;
  }
  
  return result;
}

/**
 * Checks if a date is between two dates
 * @param date - The date to check
 * @param start - Start date
 * @param end - End date
 * @param inclusive - Include boundaries
 * @returns True if between, false otherwise
 */
export function isBetween(
  date: Date | string | number,
  start: Date | string | number,
  end: Date | string | number,
  inclusive = true
): boolean {
  const dateObj = new Date(date);
  const startObj = new Date(start);
  const endObj = new Date(end);
  
  if (isNaN(dateObj.getTime()) || isNaN(startObj.getTime()) || isNaN(endObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  if (inclusive) {
    return dateObj >= startObj && dateObj <= endObj;
  }
  
  return dateObj > startObj && dateObj < endObj;
}

/**
 * Gets the difference between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @param unit - Unit of difference
 * @returns Difference in specified unit
 */
export function getDifference(
  date1: Date | string | number,
  date2: Date | string | number,
  unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years' = 'days'
): number {
  const dateObj1 = new Date(date1);
  const dateObj2 = new Date(date2);
  
  if (isNaN(dateObj1.getTime()) || isNaN(dateObj2.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  const diffInMs = Math.abs(dateObj1.getTime() - dateObj2.getTime());
  
  switch (unit) {
    case 'seconds':
      return Math.floor(diffInMs / 1000);
    case 'minutes':
      return Math.floor(diffInMs / (1000 * 60));
    case 'hours':
      return Math.floor(diffInMs / (1000 * 60 * 60));
    case 'days':
      return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    case 'weeks':
      return Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));
    case 'months':
      return Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));
    case 'years':
      return Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));
  }
}

/**
 * Converts date to a specific timezone (uses Intl API)
 * @param date - The date to convert
 * @param timeZone - Target timezone (e.g., 'America/New_York')
 * @returns Date string in target timezone
 */
export function toTimeZone(
  date: Date | string | number,
  timeZone: string
): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  return dateObj.toLocaleString('en-US', { timeZone });
}

/**
 * Gets current timestamp in milliseconds
 * @returns Current timestamp
 */
export function now(): number {
  return Date.now();
}

/**
 * Creates a date from parts
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day
 * @param hour - Hour (0-23)
 * @param minute - Minute
 * @param second - Second
 * @returns New date
 */
export function createDate(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
): Date {
  return new Date(year, month - 1, day, hour, minute, second);
}