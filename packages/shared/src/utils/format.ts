/**
 * Formatting utility functions for numbers, currency, files, etc.
 */

/**
 * Formats a number with locale-specific formatting
 * @param num - Number to format
 * @param options - Intl.NumberFormat options
 * @param locale - Locale to use (defaults to user's locale)
 * @returns Formatted number string
 */
export function formatNumber(
  num: number,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Formats a number as currency
 * @param amount - Amount to format
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @param locale - Locale to use
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale?: string
): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Formats a number as a percentage
 * @param value - Value to format (0.5 = 50%)
 * @param decimals - Number of decimal places
 * @param locale - Locale to use
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  decimals = 1,
  locale?: string
): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formats a large number with abbreviated units (K, M, B, T)
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Abbreviated number string
 */
export function formatAbbreviatedNumber(num: number, decimals = 1): string {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  const units = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' }
  ];
  
  for (const unit of units) {
    if (absNum >= unit.value) {
      const formatted = (absNum / unit.value).toFixed(decimals);
      return `${sign}${formatted}${unit.suffix}`;
    }
  }
  
  return num.toString();
}

/**
 * Formats a file size in bytes to human-readable format
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places
 * @param binary - Use binary (1024) vs decimal (1000) units
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number, decimals = 2, binary = true): string {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) return '0 B';
  if (bytes === 0) return '0 B';
  
  const base = binary ? 1024 : 1000;
  const units = binary 
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(base));
  const size = bytes / Math.pow(base, unitIndex);
  
  return `${size.toFixed(decimals)} ${units[unitIndex]}`;
}

/**
 * Formats a duration in milliseconds to human-readable format
 * @param ms - Duration in milliseconds
 * @param format - Format type ('long', 'short', 'compact')
 * @returns Formatted duration string
 */
export function formatDuration(
  ms: number,
  format: 'long' | 'short' | 'compact' = 'short'
): string {
  if (typeof ms !== 'number' || isNaN(ms) || ms < 0) return '0ms';
  
  const units = [
    { value: 365 * 24 * 60 * 60 * 1000, long: 'year', short: 'yr', compact: 'y' },
    { value: 30 * 24 * 60 * 60 * 1000, long: 'month', short: 'mo', compact: 'mo' },
    { value: 7 * 24 * 60 * 60 * 1000, long: 'week', short: 'wk', compact: 'w' },
    { value: 24 * 60 * 60 * 1000, long: 'day', short: 'day', compact: 'd' },
    { value: 60 * 60 * 1000, long: 'hour', short: 'hr', compact: 'h' },
    { value: 60 * 1000, long: 'minute', short: 'min', compact: 'm' },
    { value: 1000, long: 'second', short: 'sec', compact: 's' },
    { value: 1, long: 'millisecond', short: 'ms', compact: 'ms' }
  ];
  
  for (const unit of units) {
    if (ms >= unit.value) {
      const value = Math.floor(ms / unit.value);
      const unitName = unit[format];
      const plural = format === 'long' && value !== 1 ? 's' : '';
      const separator = format === 'compact' ? '' : ' ';
      return `${value}${separator}${unitName}${plural}`;
    }
  }
  
  return '0ms';
}

/**
 * Formats a phone number
 * @param phone - Phone number string
 * @param format - Format type
 * @returns Formatted phone number
 */
export function formatPhone(
  phone: string,
  format: 'us' | 'international' | 'dots' | 'dashes' = 'us'
): string {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10) return phone; // Return original if too short
  
  let digits = cleaned;
  let countryCode = '';
  
  // Handle country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    countryCode = '1';
    digits = cleaned.slice(1);
  } else if (cleaned.length > 11) {
    // Assume first digits are country code
    countryCode = cleaned.slice(0, cleaned.length - 10);
    digits = cleaned.slice(-10);
  }
  
  const areaCode = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  const number = digits.slice(6);
  
  switch (format) {
    case 'international':
      return countryCode ? `+${countryCode} (${areaCode}) ${exchange}-${number}` : `(${areaCode}) ${exchange}-${number}`;
    case 'dots':
      return `${areaCode}.${exchange}.${number}`;
    case 'dashes':
      return `${areaCode}-${exchange}-${number}`;
    default: // 'us'
      return `(${areaCode}) ${exchange}-${number}`;
  }
}

/**
 * Formats a credit card number with spaces
 * @param cardNumber - Credit card number
 * @param maskDigits - Number of digits to mask (from start)
 * @returns Formatted credit card number
 */
export function formatCreditCard(cardNumber: string, maskDigits = 12): string {
  if (!cardNumber || typeof cardNumber !== 'string') return '';
  
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return cardNumber;
  
  let formatted = cleaned;
  
  // Mask digits if requested
  if (maskDigits > 0 && maskDigits < cleaned.length - 4) {
    const masked = '*'.repeat(maskDigits);
    const visible = cleaned.slice(maskDigits);
    formatted = masked + visible;
  }
  
  // Add spaces every 4 digits
  return formatted.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Formats a Social Security Number
 * @param ssn - SSN string
 * @param mask - Whether to mask the number
 * @returns Formatted SSN
 */
export function formatSSN(ssn: string, mask = true): string {
  if (!ssn || typeof ssn !== 'string') return '';
  
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) return ssn;
  
  const formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  
  if (mask) {
    return `***-**-${cleaned.slice(5)}`;
  }
  
  return formatted;
}

/**
 * Formats a number with ordinal suffix (1st, 2nd, 3rd, etc.)
 * @param num - Number to format
 * @returns Number with ordinal suffix
 */
export function formatOrdinal(num: number): string {
  if (typeof num !== 'number' || isNaN(num)) return '0th';
  
  const absNum = Math.abs(num);
  const lastDigit = absNum % 10;
  const lastTwoDigits = absNum % 100;
  
  let suffix = 'th';
  
  if (lastTwoDigits < 11 || lastTwoDigits > 13) {
    switch (lastDigit) {
      case 1:
        suffix = 'st';
        break;
      case 2:
        suffix = 'nd';
        break;
      case 3:
        suffix = 'rd';
        break;
    }
  }
  
  return `${num}${suffix}`;
}

/**
 * Formats coordinates (latitude, longitude)
 * @param lat - Latitude
 * @param lng - Longitude
 * @param decimals - Number of decimal places
 * @returns Formatted coordinates string
 */
export function formatCoordinates(lat: number, lng: number, decimals = 6): string {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return '0°00\'00", 0°00\'00"';
  }
  
  const formatCoord = (coord: number, isLat: boolean): string => {
    const abs = Math.abs(coord);
    const degrees = Math.floor(abs);
    const minutes = Math.floor((abs - degrees) * 60);
    const seconds = ((abs - degrees - minutes / 60) * 3600).toFixed(decimals - 4);
    const direction = isLat ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
    
    return `${degrees}°${minutes.toString().padStart(2, '0')}'${seconds.padStart(6, '0')}" ${direction}`;
  };
  
  return `${formatCoord(lat, true)}, ${formatCoord(lng, false)}`;
}

/**
 * Formats a decimal coordinates to simple format
 * @param lat - Latitude
 * @param lng - Longitude
 * @param decimals - Number of decimal places
 * @returns Simple coordinates string
 */
export function formatSimpleCoordinates(lat: number, lng: number, decimals = 6): string {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return '0.000000, 0.000000';
  }
  
  return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
}

/**
 * Formats a number as a fraction
 * @param decimal - Decimal number
 * @param maxDenominator - Maximum denominator value
 * @returns Fraction string
 */
export function formatFraction(decimal: number, maxDenominator = 100): string {
  if (typeof decimal !== 'number' || isNaN(decimal)) return '0/1';
  
  if (decimal === 0) return '0';
  if (decimal === 1) return '1';
  
  const sign = decimal < 0 ? '-' : '';
  const abs = Math.abs(decimal);
  const whole = Math.floor(abs);
  const fractional = abs - whole;
  
  if (fractional === 0) return `${sign}${whole}`;
  
  let bestNumerator = 1;
  let bestDenominator = 1;
  let bestError = Math.abs(fractional - bestNumerator / bestDenominator);
  
  for (let denominator = 2; denominator <= maxDenominator; denominator++) {
    const numerator = Math.round(fractional * denominator);
    const error = Math.abs(fractional - numerator / denominator);
    
    if (error < bestError) {
      bestNumerator = numerator;
      bestDenominator = denominator;
      bestError = error;
    }
    
    if (error === 0) break;
  }
  
  const wholePartStr = whole > 0 ? `${whole} ` : '';
  return `${sign}${wholePartStr}${bestNumerator}/${bestDenominator}`;
}

/**
 * Formats a number in scientific notation
 * @param num - Number to format
 * @param decimals - Number of decimal places
 * @returns Scientific notation string
 */
export function formatScientific(num: number, decimals = 2): string {
  if (typeof num !== 'number' || isNaN(num)) return '0e+0';
  
  return num.toExponential(decimals);
}

/**
 * Formats a range of numbers
 * @param start - Start of range
 * @param end - End of range
 * @param separator - Separator string
 * @returns Formatted range string
 */
export function formatRange(start: number, end: number, separator = ' - '): string {
  if (typeof start !== 'number' || typeof end !== 'number' || isNaN(start) || isNaN(end)) {
    return '0 - 0';
  }
  
  return `${formatNumber(start)}${separator}${formatNumber(end)}`;
}